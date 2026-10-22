import { API_BASE_URL } from '../config/api';

export const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';

export function extractErrorMessage(
  data: unknown,
  fallback: string,
  options?: { treatOutdatedServer?: boolean },
): string {
  const record =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};

  if (typeof record.erro === 'string' && record.erro.trim()) {
    return record.erro;
  }
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    if (
      options?.treatOutdatedServer &&
      (record.error === 'Method Not Allowed' || record.error === 'Not Found')
    ) {
      return 'Servidor desatualizado. Reinicie o backend e tente novamente.';
    }
    return record.error;
  }
  return fallback;
}

export async function parseResponse<T>(
  response: Response,
  fallback = 'Não foi possível concluir a operação.',
  options?: { treatOutdatedServer?: boolean },
): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, fallback, options));
  }

  return data as T;
}

// Token da sessão atual, definido pelo AuthContext. Todas as rotas da API, exceto login,
// cadastro e recuperação de senha, exigem "Authorization: Bearer <token>".
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Chamado quando o servidor recusa o token (401): sessão expirada, revogada ou inválida. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401 && authToken && onUnauthorized) {
    onUnauthorized();
  }
  return response;
}
