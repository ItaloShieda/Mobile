import { API_BASE_URL } from '../config/api';
import { NETWORK_ERROR_MESSAGE, parseResponse } from './http';
import type {
  CadastroContaPayload,
  CadastroContaResponse,
  UsuarioLogado,
  LoginPayload,
  LoginResponse,
  RecuperarSenhaPayload,
  AtualizarUsuarioPayload,
  AtualizarEmpresaPayload,
} from '../types/auth';

export type {
  CadastroContaPayload,
  CadastroContaResponse,
  UsuarioLogado,
  LoginPayload,
  LoginResponse,
  RecuperarSenhaPayload,
  AtualizarUsuarioPayload,
  AtualizarEmpresaPayload,
};

function normalizeLoginResponse(data: Record<string, unknown>): LoginResponse {
  if (typeof data.token === 'string' && data.usuario) {
    return {
      token: data.token,
      expiresIn: typeof data.expiresIn === 'number' ? data.expiresIn : 86400000,
      usuario: data.usuario as UsuarioLogado,
    };
  }

  if (typeof data.id === 'number' && typeof data.email === 'string') {
    return {
      token: `legacy:${data.id}`,
      expiresIn: 86400000,
      usuario: data as unknown as UsuarioLogado,
    };
  }

  throw new Error('Resposta inválida do servidor de login.');
}

export function isLegacyToken(token: string): boolean {
  return token.startsWith('legacy:');
}

export async function cadastrarConta(
  payload: CadastroContaPayload,
): Promise<CadastroContaResponse> {
  const response = await fetch(`${API_BASE_URL}/api/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<CadastroContaResponse>(response);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        senha: payload.senha,
      }),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.erro === 'string'
        ? data.erro
        : 'E-mail ou senha incorretos.';
    throw new Error(message);
  }

  return normalizeLoginResponse(data as Record<string, unknown>);
}

export async function recuperarSenha(payload: RecuperarSenhaPayload): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/usuarios/recuperar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        novaSenha: payload.novaSenha,
      }),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  await parseResponse<Record<string, unknown>>(response);
}

export async function obterUsuarioAtual(token: string): Promise<UsuarioLogado> {
  const response = await fetch(`${API_BASE_URL}/api/usuarios/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<UsuarioLogado>(response);
}

export async function atualizarUsuario(
  id: number,
  payload: AtualizarUsuarioPayload,
): Promise<UsuarioLogado> {
  const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<UsuarioLogado>(response);
}

export async function atualizarEmpresa(
  id: number,
  payload: AtualizarEmpresaPayload,
): Promise<UsuarioLogado['empresa']> {
  const response = await fetch(`${API_BASE_URL}/api/empresas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<UsuarioLogado['empresa']>(response);
}
