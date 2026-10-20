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
import { loadPerfilUso, savePerfilUso } from '../services/perfilStorage';
import type { PerfilCadastro } from '../types/auth';

interface AuthContextValue {
  user: UsuarioLogado | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  perfilUso: PerfilCadastro | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (usuario: UsuarioLogado) => Promise<void>;
  setPerfilUso: (perfil: PerfilCadastro) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [perfilUso, setPerfilUsoState] = useState<PerfilCadastro | null>(null);

  const applySession = useCallback(async (session: StoredSession | null) => {
    if (!session || isSessionExpired(session.expiresAt)) {
      setUser(null);
      setToken(null);
      setPerfilUsoState(null);
      return false;
    }

    const perfil = await loadPerfilUso(session.usuario.email);
    setPerfilUsoState(perfil);
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
    const emailNormalized = payload.email.trim().toLowerCase();
    const senhaNormalized = payload.senha;

    const localAccount = {
      'fornecedor@teste.com': {
        perfilUso: 'Fornecedor' as const,
        usuario: {
          id: 998,
          nome: 'Fornecedor Teste',
          email: 'fornecedor@teste.com',
          perfil: { id: 2, nome: 'fornecedor', descricao: 'Fornecedor local para testes' },
          empresa: { id: 998, nome: 'Distribuidora Teste', cnpj: '12.345.678/0001-90', telefone: '(11) 99999-0001' },
          ativo: 1,
        },
      },
      'cliente@teste.com': {
        perfilUso: 'Cliente' as const,
        usuario: {
          id: 997,
          nome: 'Cliente Teste',
          email: 'cliente@teste.com',
          perfil: { id: 3, nome: 'cliente', descricao: 'Cliente local para testes' },
          empresa: { id: 997, nome: 'Mercado Teste', cnpj: '98.765.432/0001-10', telefone: '(11) 99999-0002' },
          ativo: 1,
        },
      },
    }[emailNormalized];

    if (localAccount && senhaNormalized === '1234') {
      const localUser: UsuarioLogado = localAccount.usuario;

      const session: StoredSession = {
        token: `local-${localAccount.perfilUso.toLowerCase()}-token`,
        usuario: localUser,
        expiresAt: Date.now() + 86400000,
      };

      await saveSession(session);
      await savePerfilUso(localUser.email, localAccount.perfilUso);
      const applied = await applySession(session);

      if (!applied) {
        throw new Error('Sessão inválida. Tente novamente.');
      }
      return;
    }

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
    setPerfilUsoState(perfil);
    if (user?.email) {
      await savePerfilUso(user.email, perfil);
    }
  }, [user?.email]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      perfilUso,
      signIn,
      signOut,
      updateUser,
      setPerfilUso,
    }),
    [user, token, isLoading, perfilUso, signIn, signOut, updateUser, setPerfilUso],
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
