import type { MetodoPagamento } from './pagamento';

export interface Fornecedor {
  id: number;
  nome: string;
  descricao?: string;
  tipo: string;
  totalProdutos: number;
  logoUrl?: string;
  capaUrl?: string;
}

export interface ItemSolicitacao {
  produtoId: number;
  nome: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  imagemUrl?: string;
}

export interface EtapaPedido {
  codigo: string;
  label: string;
  ordem: number;
  concluida: boolean;
  ativa: boolean;
}

export interface SolicitacaoCompra {
  id: number;
  pedidoId?: number;
  fornecedorId: number;
  fornecedorNome: string;
  compradorId?: number;
  compradorNome?: string;
  status: string;
  statusLabel?: string;
  etapas?: EtapaPedido[];
  valorTotal: number;
  observacao?: string;
  metodoPagamento?: string;
  enderecoResumo?: string;
  taxaEntrega?: number;
  criadoEm: string;
  itens: ItemSolicitacao[];
  previsaoEntregaMinutos?: number;
  previsaoEntregaLabel?: string;
}

export interface ItemSolicitacaoPayload {
  produtoId: number;
  quantidade: number;
}

export interface SolicitacaoCompraPayload {
  empresaCompradoraId: number;
  empresaFornecedoraId: number;
  usuarioId: number;
  observacao?: string;
  metodoPagamento: MetodoPagamento;
  enderecoEntregaId: number;
  taxaEntrega?: number;
  pagamentoReferencia?: string;
  pagamentoDetalhes?: string;
  itens: ItemSolicitacaoPayload[];
}

export interface CartItem {
  produtoId: number;
  fornecedorId: number;
  fornecedorNome: string;
  nome: string;
  preco: number;
  unidade: string;
  quantidade: number;
  imagemUrl?: string;
}

export interface StoredPurchaseCart {
  itens: CartItem[];
}
