import { apiFetch, extractErrorMessage, parseResponse } from './http';
import type {
  EstoqueItem,
  Quiosque,
  EstoqueItemPayload,
  QuiosquePayload,
} from '../types/quiosque';

export type { EstoqueItem, Quiosque, EstoqueItemPayload, QuiosquePayload };

function normalizeQuiosque(data: Quiosque): Quiosque {
  return {
    ...data,
    totalProdutos: Number(data.totalProdutos ?? 0),
    totalUnidades: Number(data.totalUnidades ?? 0),
    itens: (data.itens ?? []).map((item) => ({
      ...item,
      precoVenda: Number(item.precoVenda),
      quantidade: Number(item.quantidade),
    })),
  };
}

export async function listarQuiosques(empresaId: number): Promise<Quiosque[]> {
  const response = await apiFetch(`/api/barracas?empresaId=${empresaId}`);
  const lista = await parseResponse<Quiosque[]>(response);
  return lista.map(normalizeQuiosque);
}

export async function criarQuiosque(payload: QuiosquePayload): Promise<Quiosque> {
  const response = await apiFetch(`/api/barracas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return normalizeQuiosque(await parseResponse<Quiosque>(response));
}

export async function atualizarQuiosque(
  id: number,
  payload: QuiosquePayload,
): Promise<Quiosque> {
  const response = await apiFetch(`/api/barracas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return normalizeQuiosque(await parseResponse<Quiosque>(response));
}

export async function atualizarEstoque(
  id: number,
  itens: EstoqueItemPayload[],
): Promise<Quiosque> {
  const response = await apiFetch(`/api/barracas/${id}/estoque`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itens }),
  });
  return normalizeQuiosque(await parseResponse<Quiosque>(response));
}

export async function removerQuiosque(id: number, empresaId: number): Promise<void> {
  const response = await apiFetch(`/api/barracas/${id}?empresaId=${empresaId}`,
    { method: 'DELETE' },
  );

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(data as Record<string, unknown>, 'Não foi possível remover o quiosque.'),
    );
  }
}

export function formatarQuantidade(quantidade: number, unidade: string): string {
  const valor = Number.isInteger(quantidade)
    ? String(quantidade)
    : quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${valor} ${unidade}`;
}
