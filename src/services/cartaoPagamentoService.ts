import { API_BASE_URL } from '../config/api';
import { apiFetch, extractErrorMessage, parseResponse } from './http';
import type { TipoCartao, CartaoSalvo, CartaoSalvoPayload } from '../types/pagamento';

export type { TipoCartao, CartaoSalvo, CartaoSalvoPayload };

export function labelCartao(cartao: CartaoSalvo): string {
  if (cartao.apelido?.trim()) return cartao.apelido.trim();
  return `${cartao.bandeira} · •••• ${cartao.ultimosDigitos}`;
}

export async function listarCartoes(empresaId: number): Promise<CartaoSalvo[]> {
  const response = await apiFetch(`/api/cartoes-pagamento?empresaId=${empresaId}`);
  return parseResponse<CartaoSalvo[]>(
    response,
    'Não foi possível carregar os cartões.',
    { treatOutdatedServer: true },
  );
}

export async function listarCartoesPorTipo(
  empresaId: number,
  tipo: TipoCartao,
): Promise<CartaoSalvo[]> {
  const response = await apiFetch(`/api/cartoes-pagamento?empresaId=${empresaId}&tipo=${tipo}`,
  );
  const lista = await parseResponse<CartaoSalvo[]>(
    response,
    'Não foi possível carregar os cartões.',
    { treatOutdatedServer: true },
  );
  return lista;
}

export async function salvarCartao(payload: CartaoSalvoPayload): Promise<CartaoSalvo> {
  const body: Record<string, unknown> = {
    empresaId: payload.empresaId,
    tipo: payload.tipo,
    bandeira: payload.bandeira,
    ultimosDigitos: payload.ultimosDigitos,
    validade: payload.validade,
    titular: payload.titular,
  };

  const apelido = payload.apelido?.trim();
  if (apelido) {
    body.apelido = apelido;
  }

  let response: Response;
  try {
    response = await apiFetch(`/api/cartoes-pagamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique se o backend está rodando.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, 'Não foi possível salvar o cartão.', { treatOutdatedServer: true }),
    );
  }

  return data as CartaoSalvo;
}

export async function removerCartao(empresaId: number, cartaoId: number): Promise<void> {
  const response = await apiFetch(`/api/cartoes-pagamento/${cartaoId}?empresaId=${empresaId}`,
    { method: 'DELETE' },
  );

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(data, 'Não foi possível remover o cartão.', { treatOutdatedServer: true }),
    );
  }
}
