import type { Produto } from '../types/produto';
import type { Quiosque } from '../types/quiosque';
import type { SolicitacaoCompra } from '../types/marketplace';

export interface ResumoEstoque {
  comprado: number;
  alocado: number;
  livre: number;
}

export interface LinhaQuiosqueForm {
  produtoId: number;
  quantidade: string;
  precoVenda: string;
  disponivel: number;
}

export interface ErrosLinha {
  quantidade?: string;
  precoVenda?: string;
}

export interface ErrosQuiosqueForm {
  nome?: string;
  geral?: string;
  linhas?: Record<number, ErrosLinha>;
}

/** Converte texto digitado ("7,50", "10") em número; vazio vira 0 e inválido vira NaN. */
export function parseNumeroInput(valor: string): number {
  const texto = valor.trim().replace(',', '.');
  if (!texto) return 0;
  return /^\d+(\.\d+)?$/.test(texto) ? Number(texto) : NaN;
}

export function quantidadeAlocada(
  produtoId: number,
  quiosques: Quiosque[],
  ignorarQuiosqueId?: number,
): number {
  return quiosques
    .filter((q) => q.id !== ignorarQuiosqueId)
    .reduce(
      (total, q) =>
        total +
        q.itens
          .filter((item) => item.produtoId === produtoId)
          .reduce((acc, item) => acc + item.quantidade, 0),
      0,
    );
}

export function disponivelParaQuiosque(
  produto: Produto,
  quiosques: Quiosque[],
  ignorarQuiosqueId?: number,
): number {
  const estoque = produto.estoque ?? 0;
  return Math.max(0, estoque - quantidadeAlocada(produto.id, quiosques, ignorarQuiosqueId));
}

export function resumoEstoque(produtos: Produto[], quiosques: Quiosque[]): ResumoEstoque {
  const comprado = produtos.reduce((acc, p) => acc + (p.estoque ?? 0), 0);
  const alocado = quiosques.reduce(
    (acc, q) => acc + q.itens.reduce((soma, item) => soma + item.quantidade, 0),
    0,
  );
  return { comprado, alocado, livre: Math.max(0, comprado - alocado) };
}

export function quiosqueExcedeEstoque(
  quiosque: Quiosque,
  produtos: Produto[],
  quiosques: Quiosque[],
): boolean {
  return quiosque.itens.some((item) => {
    if (item.quantidade <= 0) return false;
    const produto = produtos.find((p) => p.id === item.produtoId);
    if (!produto) return true;
    return item.quantidade > disponivelParaQuiosque(produto, quiosques, quiosque.id);
  });
}

export function validarQuiosqueForm({
  nome,
  linhas,
}: {
  nome: string;
  linhas: LinhaQuiosqueForm[];
}): { valido: boolean; erros: ErrosQuiosqueForm } {
  const erros: ErrosQuiosqueForm = {};
  const errosLinhas: Record<number, ErrosLinha> = {};
  let totalItens = 0;

  if (!nome.trim()) {
    erros.nome = 'Informe o nome do quiosque.';
  }

  linhas.forEach((linha) => {
    const quantidade = parseNumeroInput(linha.quantidade);
    const erro: ErrosLinha = {};

    if (Number.isNaN(quantidade)) {
      erro.quantidade = 'Quantidade inválida.';
    } else if (quantidade > linha.disponivel) {
      erro.quantidade = `Máximo ${linha.disponivel} un. disponíveis.`;
    } else if (quantidade > 0) {
      totalItens += 1;
      const preco = parseNumeroInput(linha.precoVenda);
      if (Number.isNaN(preco) || preco <= 0) {
        erro.precoVenda = 'Informe o preço de venda.';
      }
    }

    if (erro.quantidade || erro.precoVenda) {
      errosLinhas[linha.produtoId] = erro;
    }
  });

  if (Object.keys(errosLinhas).length > 0) {
    erros.linhas = errosLinhas;
  } else if (totalItens === 0) {
    erros.geral = 'Adicione ao menos um produto ao quiosque.';
  }

  return { valido: Object.keys(erros).length === 0, erros };
}

function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Preço unitário pago no pedido entregue mais recente que tenha um item com o mesmo nome. */
export function precoPagoPorNome(
  nomeProduto: string,
  solicitacoes: SolicitacaoCompra[],
): number | undefined {
  const alvo = normalizarNome(nomeProduto);
  const entregues = solicitacoes
    .filter((s) => s.status === 'entregue')
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  for (const solicitacao of entregues) {
    const item = solicitacao.itens.find((i) => normalizarNome(i.nome) === alvo);
    if (item) return item.precoUnitario;
  }
  return undefined;
}
