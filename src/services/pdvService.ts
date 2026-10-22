import { apiFetch, NETWORK_ERROR_MESSAGE, parseResponse } from './http';
import type { ProdutoPdv, VendaPdv, VendaPdvPayload } from '../types/pdv';

export type { ProdutoPdv, VendaPdv, VendaPdvPayload };

async function requisitar(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await apiFetch(path, init);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

function normalizarVenda(v: VendaPdv): VendaPdv {
  return {
    ...v,
    total: Number(v.total),
    valorRecebido: v.valorRecebido != null ? Number(v.valorRecebido) : null,
    troco: v.troco != null ? Number(v.troco) : null,
    itens: v.itens.map((i) => ({
      ...i,
      quantidade: Number(i.quantidade),
      precoUnitario: Number(i.precoUnitario),
      subtotal: Number(i.subtotal),
    })),
  };
}

/** Produtos do ponto de venda (quiosque), buscando por nome ou código. */
export async function buscarProdutosPdv(barracaId: number, busca = ''): Promise<ProdutoPdv[]> {
  const query = busca.trim() ? `&busca=${encodeURIComponent(busca.trim())}` : '';
  const response = await requisitar(`/api/pdv/produtos?barracaId=${barracaId}${query}`);
  const lista = await parseResponse<ProdutoPdv[]>(response, 'Não foi possível carregar os produtos.');
  return lista.map((p) => ({ ...p, precoVenda: Number(p.precoVenda), disponivel: Number(p.disponivel) }));
}

/** Registra a venda. Reenviar a mesma chaveVenda devolve a venda já registrada, sem duplicar. */
export async function finalizarVendaPdv(payload: VendaPdvPayload): Promise<VendaPdv> {
  const response = await requisitar('/api/pdv/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return normalizarVenda(await parseResponse<VendaPdv>(response, 'Não foi possível finalizar a venda.'));
}

export async function buscarVendaPdv(id: number): Promise<VendaPdv> {
  const response = await requisitar(`/api/pdv/vendas/${id}`);
  return normalizarVenda(await parseResponse<VendaPdv>(response, 'Não foi possível carregar a venda.'));
}
