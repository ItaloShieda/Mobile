import { API_BASE_URL } from '../config/api';
import { Produto } from './productService';
import { parseResponse } from './http';
import type {
  Fornecedor,
  ItemSolicitacao,
  EtapaPedido,
  SolicitacaoCompra,
  MetodoPagamento,
  ItemSolicitacaoPayload,
  SolicitacaoCompraPayload,
} from '../types';

export type {
  Fornecedor,
  ItemSolicitacao,
  EtapaPedido,
  SolicitacaoCompra,
  MetodoPagamento,
  ItemSolicitacaoPayload,
  SolicitacaoCompraPayload,
};

function normalizeProduto(data: Produto): Produto {
  return {
    ...data,
    precoVenda: Number(data.precoVenda),
    estoque: data.estoque != null ? Number(data.estoque) : undefined,
  };
}

function normalizeSolicitacao(data: SolicitacaoCompra): SolicitacaoCompra {
  return {
    ...data,
    pedidoId: data.pedidoId != null ? Number(data.pedidoId) : undefined,
    valorTotal: Number(data.valorTotal),
    taxaEntrega: data.taxaEntrega != null ? Number(data.taxaEntrega) : undefined,
    previsaoEntregaMinutos:
      data.previsaoEntregaMinutos != null ? Number(data.previsaoEntregaMinutos) : undefined,
    itens: (data.itens ?? []).map((item) => ({
      ...item,
      quantidade: Number(item.quantidade),
      precoUnitario: Number(item.precoUnitario),
      subtotal: Number(item.subtotal),
    })),
  };
}

export function obterPrevisaoEntrega(pedido: SolicitacaoCompra): string {
  if (pedido.previsaoEntregaLabel) return pedido.previsaoEntregaLabel;

  switch (pedido.status) {
    case 'entregue':
      return 'Pedido entregue';
    case 'em_rota':
      return 'Chegada em até 15 min';
    default:
      return 'Previsão de entrega: 40–55 min';
  }
}

export function calcularProgressoPedido(pedido: SolicitacaoCompra): number {
  const etapas = pedido.etapas ?? [];
  if (etapas.length === 0) {
    if (pedido.status === 'entregue') return 1;
    if (pedido.status === 'em_rota') return 0.75;
    return 0.35;
  }
  const concluidas = etapas.filter((e) => e.concluida).length;
  return Math.min(1, concluidas / etapas.length);
}

export async function listarFornecedores(empresaCompradoraId?: number): Promise<Fornecedor[]> {
  const query = empresaCompradoraId ? `?empresaCompradoraId=${empresaCompradoraId}` : '';
  const response = await fetch(`${API_BASE_URL}/api/marketplace/fornecedores${query}`);
  return parseResponse<Fornecedor[]>(response);
}

export async function listarProdutosFornecedor(fornecedorId: number): Promise<Produto[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/marketplace/fornecedores/${fornecedorId}/produtos`,
  );
  const lista = await parseResponse<Produto[]>(response);
  return lista.map(normalizeProduto);
}

export async function criarSolicitacaoCompra(
  payload: SolicitacaoCompraPayload,
): Promise<SolicitacaoCompra> {
  const response = await fetch(`${API_BASE_URL}/api/solicitacoes-compra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return normalizeSolicitacao(await parseResponse<SolicitacaoCompra>(response));
}

export async function listarSolicitacoes(
  empresaCompradoraId: number,
): Promise<SolicitacaoCompra[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/solicitacoes-compra?empresaCompradoraId=${empresaCompradoraId}`,
  );
  const lista = await parseResponse<SolicitacaoCompra[]>(response);
  return lista.map(normalizeSolicitacao);
}

export async function buscarSolicitacao(
  pedidoId: number,
  empresaCompradoraId: number,
): Promise<SolicitacaoCompra> {
  const response = await fetch(
    `${API_BASE_URL}/api/solicitacoes-compra/${pedidoId}?empresaCompradoraId=${empresaCompradoraId}`,
  );
  return normalizeSolicitacao(await parseResponse<SolicitacaoCompra>(response));
}

/** Pedidos recebidos pelo fornecedor. */
export async function listarSolicitacoesRecebidas(
  empresaFornecedoraId: number,
): Promise<SolicitacaoCompra[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/solicitacoes-compra/recebidas?empresaFornecedoraId=${empresaFornecedoraId}`,
  );
  const lista = await parseResponse<SolicitacaoCompra[]>(
    response,
    'Não foi possível carregar os pedidos recebidos.',
    { treatOutdatedServer: true },
  );
  return lista.map(normalizeSolicitacao);
}

export type StatusPedidoFornecedor = 'em_rota' | 'entregue' | 'cancelada';

export async function atualizarStatusSolicitacao(
  pedidoId: number,
  empresaFornecedoraId: number,
  status: StatusPedidoFornecedor,
): Promise<SolicitacaoCompra> {
  const response = await fetch(`${API_BASE_URL}/api/solicitacoes-compra/${pedidoId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empresaFornecedoraId, status }),
  });
  return normalizeSolicitacao(
    await parseResponse<SolicitacaoCompra>(
      response,
      'Não foi possível atualizar o pedido.',
      { treatOutdatedServer: true },
    ),
  );
}

/** Comprador cancela enquanto o pedido ainda não saiu para entrega. */
export async function cancelarSolicitacao(
  pedidoId: number,
  empresaCompradoraId: number,
): Promise<SolicitacaoCompra> {
  const response = await fetch(
    `${API_BASE_URL}/api/solicitacoes-compra/${pedidoId}/cancelar?empresaCompradoraId=${empresaCompradoraId}`,
    { method: 'PATCH' },
  );
  return normalizeSolicitacao(
    await parseResponse<SolicitacaoCompra>(
      response,
      'Não foi possível cancelar o pedido.',
      { treatOutdatedServer: true },
    ),
  );
}

export function labelStatusPedido(status: string): string {
  switch (status) {
    case 'aguardando_liberacao':
      return 'Aguardando liberação da distribuidora';
    case 'em_rota':
      return 'Saindo para rota de entrega';
    case 'entregue':
      return 'Pedido entregue';
    case 'cancelada':
      return 'Pedido cancelado';
    default:
      return 'Pedido em andamento';
  }
}

export function labelMetodoPagamento(metodo?: string): string {
  switch (metodo) {
    case 'pix':
      return 'PIX';
    case 'credito':
      return 'Cartão de crédito';
    case 'debito':
      return 'Cartão de débito';
    case 'dinheiro':
      return 'Dinheiro';
    default:
      return metodo ?? '—';
  }
}

export function labelTipoFornecedor(tipo: string): string {
  if (tipo === 'PLATAFORMA') return 'Plataforma';
  if (tipo === 'DISTRIBUIDOR') return 'Distribuidora';
  return tipo;
}
