import { listarSolicitacoes } from './marketplaceService';
import { formatarDiaSemana } from '../utils/dateFormat';
import { apiFetch, extractErrorMessage, parseResponse } from './http';
import type {
  MesValor,
  MesLucro,
  MesPedidos,
  FormaPagamento,
  FinanceiroResumo,
  TotaisFinanceiros,
  MovimentoStockDia,
  StockDia,
} from '../types/financeiro';

export type {
  MesValor,
  MesLucro,
  MesPedidos,
  FormaPagamento,
  FinanceiroResumo,
  TotaisFinanceiros,
  MovimentoStockDia,
  StockDia,
};

/** Deriva totais fidedignos: lucro = vendas PDV − compras B2B (ignora lucro fake legado). */
export function extrairTotaisFinanceiros(resumo: FinanceiroResumo | null): TotaisFinanceiros {
  if (!resumo) {
    return { totalCompras: 0, totalVendas: 0, lucroTotal: 0, margemPercentual: 0 };
  }

  const sumCompras = (items: MesValor[]) => items.reduce((acc, m) => acc + m.valor, 0);
  const sumVendas = (items: MesValor[]) => items.reduce((acc, m) => acc + m.valor, 0);

  let totalCompras = resumo.totalComprasAcumulado ?? sumCompras(resumo.comprasMensais);
  let totalVendas = resumo.totalVendasAcumulado ?? sumVendas(resumo.vendasMensais ?? []);

  // API legada (sem vendasMensais): só confia em lucrosMensais quando gastos = compras do mês
  if (resumo.vendasMensais == null && resumo.totalVendasAcumulado == null) {
    totalVendas = 0;
    resumo.lucrosMensais.forEach((m, i) => {
      const compra = resumo.comprasMensais[i]?.valor ?? 0;
      if (Math.abs((m.gastos ?? 0) - compra) < 0.02) {
        totalVendas += compra + m.lucro;
      }
    });
    totalCompras = sumCompras(resumo.comprasMensais);
    const lucroTotal = totalVendas - totalCompras;
    const margemPercentual =
      totalVendas > 0 ? Math.round((lucroTotal / totalVendas) * 100) : 0;
    return { totalCompras, totalVendas, lucroTotal, margemPercentual };
  }

  const lucroTotal = totalVendas - totalCompras;
  const margemPercentual =
    totalVendas > 0 ? Math.round((lucroTotal / totalVendas) * 100) : 0;

  return { totalCompras, totalVendas, lucroTotal, margemPercentual };
}

function normalizeResumo(data: FinanceiroResumo): FinanceiroResumo {
  return {
    ...data,
    lucroTotal: Number(data.lucroTotal),
    lucroMesAtual: Number(data.lucroMesAtual),
    mediaLucroMensal: Number(data.mediaLucroMensal),
    totalComprasMesAtual: Number(data.totalComprasMesAtual),
    mediaComprasMensais: Number(data.mediaComprasMensais),
    totalVendasAcumulado:
      data.totalVendasAcumulado != null ? Number(data.totalVendasAcumulado) : undefined,
    totalComprasAcumulado:
      data.totalComprasAcumulado != null ? Number(data.totalComprasAcumulado) : undefined,
    lucrosMensais: (data.lucrosMensais ?? []).map((m) => ({
      ...m,
      lucro: Number(m.lucro),
      gastos: Number(m.gastos),
    })),
    comprasMensais: (data.comprasMensais ?? []).map((m) => ({
      ...m,
      valor: Number(m.valor),
    })),
    vendasMensais: (data.vendasMensais ?? []).map((m) => ({
      ...m,
      valor: Number(m.valor),
    })),
    pedidosMensais: data.pedidosMensais ?? [],
    formasPagamento: (data.formasPagamento ?? []).map((f) => ({
      ...f,
      valor: Number(f.valor),
    })),
  };
}

export async function buscarResumoFinanceiro(
  empresaCompradoraId: number,
): Promise<FinanceiroResumo> {
  const response = await apiFetch(`/api/financeiro/resumo?empresaCompradoraId=${empresaCompradoraId}`,
  );
  const data = await parseResponse<FinanceiroResumo>(
    response,
    'Não foi possível carregar estatísticas.',
  );
  return normalizeResumo(data);
}

function normalizeStockDia(data: StockDia): StockDia {
  return {
    ...data,
    totalCompras: Number(data.totalCompras),
    totalVendas: Number(data.totalVendas),
    lucro: Number(data.lucro),
    margemPercentual: Number(data.margemPercentual ?? 0),
    quantidadeCompras: Number(data.quantidadeCompras ?? 0),
    quantidadeVendas: Number(data.quantidadeVendas ?? 0),
    movimentos: (data.movimentos ?? []).map((m) => ({
      ...m,
      valor: Number(m.valor),
    })),
  };
}

function isDataHoje(isoDate: string): boolean {
  const data = new Date(isoDate);
  const hoje = new Date();
  return (
    data.getFullYear() === hoje.getFullYear()
    && data.getMonth() === hoje.getMonth()
    && data.getDate() === hoje.getDate()
  );
}

function formatarHorario(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Fallback quando o endpoint /stock-dia ainda não está no backend em execução. */
async function montarStockDiaLocal(empresaCompradoraId: number): Promise<StockDia> {
  const solicitacoes = await listarSolicitacoes(empresaCompradoraId);
  const comprasHoje = solicitacoes.filter((s) => isDataHoje(s.criadoEm));

  const totalCompras = comprasHoje.reduce(
    (acc, s) => acc + s.valorTotal + (s.taxaEntrega ?? 0),
    0,
  );
  const movimentos: MovimentoStockDia[] = [];

  for (const solicitacao of comprasHoje) {
    const horario = formatarHorario(solicitacao.criadoEm);
    for (const item of solicitacao.itens ?? []) {
      movimentos.push({
        tipo: 'compra',
        nome: item.nome,
        horario,
        quantidade: `${item.quantidade} ${item.unidade}`,
        valor: item.subtotal,
        origem: solicitacao.fornecedorNome,
      });
    }
  }

  const totalVendas = 0;
  const lucro = totalVendas - totalCompras;
  const hoje = new Date();

  movimentos.sort((a, b) => a.horario.localeCompare(b.horario));

  return {
    data: hoje.toISOString().slice(0, 10),
    dataLabel: `${formatarDiaSemana()}, ${hoje.toLocaleDateString('pt-BR')}`,
    totalCompras,
    totalVendas,
    lucro,
    margemPercentual: 0,
    quantidadeCompras: comprasHoje.length,
    quantidadeVendas: 0,
    movimentos,
  };
}

export async function buscarStockDia(empresaCompradoraId: number): Promise<StockDia> {
  try {
    const response = await apiFetch(`/api/financeiro/stock-dia?empresaCompradoraId=${empresaCompradoraId}`,
    );
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return normalizeStockDia(data as StockDia);
    }

    if (response.status === 404 || response.status === 405) {
      return montarStockDiaLocal(empresaCompradoraId);
    }

    throw new Error(
      extractErrorMessage(data, 'Não foi possível carregar o stock do dia.'),
    );
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Não foi possível')) {
      throw err;
    }
    return montarStockDiaLocal(empresaCompradoraId);
  }
}
