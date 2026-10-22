import { parseNumeroInput } from './estoqueQuiosque';
import type { FormaPagamentoPdv, ItemCarrinhoPdv, ProdutoPdv, VendaPdvPayload } from '../types/pdv';

/**
 * Regras do carrinho do PDV, em funções puras. Valores em centavos (inteiros) para não
 * acumular erro de ponto flutuante. O total exibido é uma prévia: o backend recalcula
 * tudo com os preços cadastrados e é o valor que vale na venda.
 */

export interface ResultadoCarrinho {
  carrinho: ItemCarrinhoPdv[];
  aviso?: string;
}

const CASAS_QUANTIDADE = 1000; // o backend aceita até 3 casas decimais

export function arredondarQuantidade(valor: number): number {
  return Math.round(valor * CASAS_QUANTIDADE) / CASAS_QUANTIDADE;
}

export function emCentavos(valor: number): number {
  return Math.round(valor * 100);
}

/** Subtotal do item arredondado ao centavo (meio para cima), como no backend. */
export function subtotalCentavos(item: Pick<ItemCarrinhoPdv, 'precoUnitario' | 'quantidade'>): number {
  return Math.round(emCentavos(item.precoUnitario) * item.quantidade + 1e-9);
}

export function totalCentavos(carrinho: ItemCarrinhoPdv[]): number {
  return carrinho.reduce((soma, item) => soma + subtotalCentavos(item), 0);
}

export function quantidadeDeItens(carrinho: ItemCarrinhoPdv[]): number {
  return carrinho.length;
}

function avisoEstoque(item: Pick<ItemCarrinhoPdv, 'nome' | 'disponivel' | 'unidade'>): string {
  return `Estoque disponível de ${item.nome}: ${item.disponivel} ${item.unidade}.`;
}

/** Adiciona (ou soma) um produto, sem passar do disponível no ponto de venda. */
export function adicionarAoCarrinho(
  carrinho: ItemCarrinhoPdv[],
  produto: ProdutoPdv,
  quantidade = 1,
): ResultadoCarrinho {
  if (produto.disponivel <= 0) {
    return { carrinho, aviso: `${produto.nome} está sem estoque neste ponto de venda.` };
  }
  const existente = carrinho.find((i) => i.produtoId === produto.id);
  const desejada = arredondarQuantidade((existente?.quantidade ?? 0) + quantidade);
  const final = Math.min(desejada, produto.disponivel);
  const aviso = desejada > produto.disponivel ? avisoEstoque({ ...produto }) : undefined;

  if (existente) {
    return {
      carrinho: carrinho.map((i) =>
        i.produtoId === produto.id
          ? { ...i, quantidade: final, disponivel: produto.disponivel, precoUnitario: produto.precoVenda }
          : i,
      ),
      aviso,
    };
  }
  const novo: ItemCarrinhoPdv = {
    produtoId: produto.id,
    codigo: produto.codigo,
    nome: produto.nome,
    unidade: produto.unidade,
    precoUnitario: produto.precoVenda,
    quantidade: final,
    disponivel: produto.disponivel,
  };
  return { carrinho: [...carrinho, novo], aviso };
}

/** Define a quantidade do item; zero remove, acima do disponível fica no máximo disponível. */
export function alterarQuantidade(
  carrinho: ItemCarrinhoPdv[],
  produtoId: number,
  quantidade: number,
): ResultadoCarrinho {
  const item = carrinho.find((i) => i.produtoId === produtoId);
  if (!item) return { carrinho };
  if (!Number.isFinite(quantidade) || quantidade < 0) {
    return { carrinho, aviso: 'Quantidade inválida.' };
  }
  const q = arredondarQuantidade(quantidade);
  if (q <= 0) return { carrinho: removerDoCarrinho(carrinho, produtoId) };
  if (q > item.disponivel) {
    return {
      carrinho: carrinho.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: i.disponivel } : i)),
      aviso: avisoEstoque(item),
    };
  }
  return { carrinho: carrinho.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: q } : i)) };
}

export function removerDoCarrinho(carrinho: ItemCarrinhoPdv[], produtoId: number): ItemCarrinhoPdv[] {
  return carrinho.filter((i) => i.produtoId !== produtoId);
}

/** Valor digitado ("50", "50,5") em centavos; vazio = 0; inválido = NaN. */
export function parseValorEmCentavos(texto: string): number {
  const valor = parseNumeroInput(texto);
  return Number.isNaN(valor) ? NaN : emCentavos(valor);
}

/** Troco em centavos, ou null quando o valor recebido não cobre o total. */
export function calcularTrocoCentavos(totalEmCentavos: number, recebidoEmCentavos: number): number | null {
  if (!Number.isFinite(recebidoEmCentavos) || recebidoEmCentavos < totalEmCentavos) return null;
  return recebidoEmCentavos - totalEmCentavos;
}

/** Mesmo critério do backend: vazio (não identificado), CPF (11) ou CNPJ (14 dígitos). */
export function documentoClienteValido(documento: string): boolean {
  const digitos = documento.replace(/\D/g, '');
  return digitos.length === 0 || digitos.length === 11 || digitos.length === 14;
}

export function podeFinalizar(params: {
  carrinho: ItemCarrinhoPdv[];
  forma: FormaPagamentoPdv | null;
  valorRecebidoTexto: string;
  clienteDocumento: string;
}): string | null {
  if (params.carrinho.length === 0) return 'Adicione produtos ao carrinho.';
  if (!params.forma) return 'Selecione a forma de pagamento.';
  if (!documentoClienteValido(params.clienteDocumento)) return 'CPF ou CNPJ do cliente incompleto.';
  if (params.forma === 'dinheiro') {
    const recebido = parseValorEmCentavos(params.valorRecebidoTexto);
    if (!params.valorRecebidoTexto.trim() || Number.isNaN(recebido)) return 'Informe o valor recebido.';
    if (calcularTrocoCentavos(totalCentavos(params.carrinho), recebido) === null) {
      return 'Valor recebido é menor que o total.';
    }
  }
  return null;
}

/** Monta o corpo da venda: só ids e quantidades (preços e total são do servidor). */
export function montarVendaPayload(params: {
  carrinho: ItemCarrinhoPdv[];
  barracaId: number;
  chaveVenda: string;
  forma: FormaPagamentoPdv;
  valorRecebidoTexto: string;
  clienteNome: string;
  clienteDocumento: string;
}): VendaPdvPayload {
  const payload: VendaPdvPayload = {
    barracaId: params.barracaId,
    chaveVenda: params.chaveVenda,
    formaPagamento: params.forma,
    itens: params.carrinho.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
  };
  if (params.forma === 'dinheiro') {
    payload.valorRecebido = parseValorEmCentavos(params.valorRecebidoTexto) / 100;
  }
  const nome = params.clienteNome.trim();
  const doc = params.clienteDocumento.replace(/\D/g, '');
  if (nome) payload.clienteNome = nome;
  if (doc) payload.clienteDocumento = doc;
  return payload;
}

/** Filtro local (mesmo critério do backend: nome ou código, sem acento nem maiúsculas). */
export function normalizarBusca(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export function filtrarProdutos(produtos: ProdutoPdv[], busca: string): ProdutoPdv[] {
  const termo = normalizarBusca(busca);
  if (!termo) return produtos;
  return produtos.filter(
    (p) => normalizarBusca(p.nome).includes(termo) || normalizarBusca(p.codigo ?? '').includes(termo),
  );
}

/** Chave única por tentativa de venda (idempotência no backend). */
export function gerarChaveVenda(): string {
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${['8', '9', 'a', 'b'][Math.floor(Math.random() * 4)]}${hex(3)}-${hex(12)}`;
}
