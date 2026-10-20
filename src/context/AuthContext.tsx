import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearSession,
  isSessionExpired,
  loadSession,
  saveSession,
  StoredSession,
} from '../services/sessionStorage';
import {
  login as loginRequest,
  LoginPayload,
  obterUsuarioAtual,
  UsuarioLogado,
  isLegacyToken,
} from '../services/authService';
import {
  loadModoAtivo,
  loadPerfilUso,
  saveModoAtivo,
  savePerfilUso,
  ModoAtivo,
} from '../services/perfilStorage';
import type { PerfilCadastro } from '../types/auth';
import { isContaDemo } from '../config/demo';

interface AuthContextValue {
  user: UsuarioLogado | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Visão ativa das telas. Na conta demo, é a visão escolhida. */
  perfilUso: PerfilCadastro | null;
  /** Perfil da conta salvo no cadastro ou enviado pelo servidor. */
  perfilConta: PerfilCadastro | null;
  /** Só a conta demo (testes e manutenção do administrador) alterna entre cliente e fornecedor. */
  podeAlternarPerfil: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (usuario: UsuarioLogado) => Promise<void>;
  setPerfilUso: (perfil: PerfilCadastro) => Promise<void>;
  alternarPerfil: (modo: ModoAtivo) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [perfilUso, setPerfilUsoState] = useState<PerfilCadastro | null>(null);
  const [perfilConta, setPerfilConta] = useState<PerfilCadastro | null>(null);

  const applySession = useCallback(async (session: StoredSession | null) => {
    if (!session || isSessionExpired(session.expiresAt)) {
      setUser(null);
      setToken(null);
      setPerfilUsoState(null);
      setPerfilConta(null);
      return false;
    }

    // O perfil salvo no cadastro vale mais; sem ele (outro aparelho), usa o do servidor.
    const email = session.usuario.email;
    const perfil = (await loadPerfilUso(email)) ?? session.usuario.perfilUso ?? null;
    setPerfilConta(perfil);
    if (perfil === 'ClienteFornecedor') {
      // Outras contas "Cliente e fornecedor" ficam sempre na visão de fornecedor.
      const modo = isContaDemo(email) ? await loadModoAtivo(email) : null;
      setPerfilUsoState(modo ?? 'Fornecedor');
    } else {
      setPerfilUsoState(perfil);
    }
    setUser(session.usuario);
    setToken(session.token);
    return true;
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const session = await loadSession();

      if (!session || isSessionExpired(session.expiresAt)) {
        await clearSession();
        await applySession(null);
        return;
      }

      if (isLegacyToken(session.token)) {
        await applySession(session);
        return;
      }

      try {
        const usuario = await obterUsuarioAtual(session.token);
        const refreshed: StoredSession = {
          token: session.token,
          usuario,
          expiresAt: session.expiresAt,
        };
        await saveSession(refreshed);
        await applySession(refreshed);
      } catch {
        await clearSession();
        await applySession(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);

    if (!response.token || !response.usuario) {
      throw new Error('Não foi possível autenticar. Tente novamente.');
    }

    const session: StoredSession = {
      token: response.token,
      usuario: response.usuario,
      expiresAt: Date.now() + response.expiresIn,
    };

    await saveSession(session);
    const applied = await applySession(session);

    if (!applied) {
      throw new Error('Sessão inválida. Tente novamente.');
    }
  }, [applySession]);

  const signOut = useCallback(async () => {
    try {
      await clearSession();
    } finally {
      setUser(null);
      setToken(null);
      setPerfilUsoState(null);
      setPerfilConta(null);
    }
  }, []);

  const updateUser = useCallback(async (usuario: UsuarioLogado) => {
    const session = await loadSession();
    if (!session || isSessionExpired(session.expiresAt)) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const refreshed: StoredSession = {
      ...session,
      usuario,
    };

    await saveSession(refreshed);
    await applySession(refreshed);
  }, [applySession]);

  const setPerfilUso = useCallback(async (perfil: PerfilCadastro) => {
    setPerfilConta(perfil);
    setPerfilUsoState(perfil === 'ClienteFornecedor' ? 'Fornecedor' : perfil);
    if (user?.email) {
      await savePerfilUso(user.email, perfil);
    }
  }, [user?.email]);

  const podeAlternarPerfil = perfilConta === 'ClienteFornecedor' && isContaDemo(user?.email);

  const alternarPerfil = useCallback(async (modo: ModoAtivo) => {
    if (!podeAlternarPerfil) return;
    setPerfilUsoState(modo);
    if (user?.email) {
      await saveModoAtivo(user.email, modo);
    }
  }, [podeAlternarPerfil, user?.email]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      perfilUso,
      perfilConta,
      podeAlternarPerfil,
      signIn,
      signOut,
      updateUser,
      setPerfilUso,
      alternarPerfil,
    }),
    [
      user, token, isLoading, perfilUso, perfilConta, podeAlternarPerfil,
      signIn, signOut, updateUser, setPerfilUso, alternarPerfil,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
