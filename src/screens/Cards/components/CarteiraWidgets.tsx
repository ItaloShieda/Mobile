import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatarPreco } from '../../../services/productService';
import {
  FinanceiroResumo,
  MovimentoStockDia,
  StockDia,
  extrairTotaisFinanceiros,
} from '../../../services/financeiroService';
import { styles } from '../styles';
import { COMPANY_COLORS } from '../../../theme/theme';

export type AbaCarteira = 'stockDia' | 'estatisticas';

export function ResumoCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[styles.resumoCard, { borderLeftColor: accent }]}>
      <View style={[styles.resumoIconWrap, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.resumoLabel}>{label}</Text>
      <Text style={[styles.resumoValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

export function BarChart({
  title,
  items,
  valueKey,
  formatValue,
}: {
  title: string;
  items: Array<{ label: string; [key: string]: any }>;
  valueKey: string;
  formatValue?: (v: number) => string;
}) {
  const valores = items.map((i) => Number(i[valueKey]));
  const max = Math.max(...valores, 1);

  return (
    <View style={styles.chartBlock}>
      <Text style={styles.chartBlockTitle}>{title}</Text>
      <View style={styles.barChartRow}>
        {items.map((item) => {
          const valor = Number(item[valueKey]);
          const altura = Math.max(8, (valor / max) * 100);
          return (
            <View key={item.label} style={styles.barColumn}>
              <View style={[styles.bar, { height: altura }]} />
              <Text style={styles.barLabel}>{item.label}</Text>
              {formatValue ? (
                <Text style={styles.barValue} numberOfLines={1}>
                  {formatValue(valor)}
                </Text>
              ) : (
                <Text style={styles.barValue}>{valor}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function iconePagamento(metodo: string): keyof typeof Ionicons.glyphMap {
  if (metodo === 'pix') return 'phone-portrait-outline';
  if (metodo === 'credito' || metodo === 'debito') return 'card-outline';
  return 'cash-outline';
}

export function MovimentoRow({ movimento }: { movimento: MovimentoStockDia }) {
  const isVenda = movimento.tipo === 'venda';

  return (
    <View style={styles.movimentoRow}>
      <View style={[styles.movimentoIcon, isVenda ? styles.movimentoIconVenda : styles.movimentoIconCompra]}>
        <MaterialCommunityIcons
          name={isVenda ? 'cart-arrow-up' : 'cart-arrow-down'}
          size={20}
          color={isVenda ? '#2E7D32' : '#D64545'}
        />
      </View>
      <View style={styles.movimentoInfo}>
        <Text style={styles.movimentoNome} numberOfLines={1}>{movimento.nome}</Text>
        <Text style={styles.movimentoMeta}>
          {isVenda ? 'Venda' : 'Compra'} · {movimento.origem} · {movimento.horario}
        </Text>
      </View>
      <View style={styles.movimentoValores}>
        <Text style={[styles.movimentoQty, { color: isVenda ? '#2E7D32' : '#D64545' }]}>
          {isVenda ? '+' : '-'} {movimento.quantidade}
        </Text>
        <Text style={styles.movimentoValor}>{formatarPreco(movimento.valor)}</Text>
      </View>
    </View>
  );
}

export function StockDoDiaTab({
  stock,
  loading,
  error,
  onRetry,
}: {
  stock: StockDia | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={COMPANY_COLORS.primary} size="large" />
        <Text style={styles.loadingHint}>Carregando stock do dia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Ionicons name="alert-circle-outline" size={40} color="#D64545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.emptyText}>Nenhum dado disponível para hoje.</Text>
      </View>
    );
  }

  const lucroPositivo = stock.lucro >= 0;

  return (
    <View style={styles.stockSection}>
      <View style={styles.datePill}>
        <Ionicons name="calendar-outline" size={16} color={COMPANY_COLORS.primary} />
        <Text style={styles.datePillText}>{stock.dataLabel}</Text>
      </View>

      <View style={styles.lucroHero}>
        <Text style={styles.lucroHeroLabel}>Lucro do dia</Text>
        <Text style={[styles.lucroHeroValue, lucroPositivo ? styles.lucroPositivo : styles.lucroNegativo]}>
          {formatarPreco(stock.lucro)}
        </Text>
        <Text style={styles.lucroHeroSub}>
          Margem {stock.margemPercentual}% · {stock.quantidadeVendas} vendas · {stock.quantidadeCompras} compras
        </Text>
      </View>

      <View style={styles.resumoGrid}>
        <ResumoCard
          label="Compras (B2B)"
          value={formatarPreco(stock.totalCompras)}
          accent="#D64545"
          icon="arrow-down-circle-outline"
        />
        <ResumoCard
          label="Vendas"
          value={formatarPreco(stock.totalVendas)}
          accent="#2E7D32"
          icon="arrow-up-circle-outline"
        />
      </View>

      <View style={styles.movimentosCard}>
        <Text style={styles.movimentosTitle}>Movimentações do dia</Text>
        {stock.movimentos.length === 0 ? (
          <View style={styles.movimentosEmpty}>
            <MaterialCommunityIcons name="package-variant" size={40} color={COMPANY_COLORS.primary} />
            <Text style={styles.movimentosEmptyText}>
              Nenhuma compra ou venda registrada hoje.
            </Text>
          </View>
        ) : (
          stock.movimentos.map((movimento, index) => (
            <MovimentoRow key={`${movimento.tipo}-${movimento.nome}-${index}`} movimento={movimento} />
          ))
        )}
      </View>
    </View>
  );
}

export function EstatisticasTab({
  resumo,
  loading,
  error,
  onRetry,
}: {
  resumo: FinanceiroResumo | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={COMPANY_COLORS.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!resumo) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.emptyText}>Nenhum dado financeiro disponível.</Text>
      </View>
    );
  }

  const totais = extrairTotaisFinanceiros(resumo);
  const idxMesAtual = resumo.comprasMensais.length - 1;
  const compraMesAtual = resumo.comprasMensais[idxMesAtual]?.valor ?? 0;
  const vendaMesAtual = resumo.vendasMensais?.[idxMesAtual]?.valor;
  const lucroMesAtual =
    vendaMesAtual != null
      ? vendaMesAtual - compraMesAtual
      : (() => {
          const m = resumo.lucrosMensais[idxMesAtual];
          if (m && Math.abs((m.gastos ?? 0) - compraMesAtual) < 0.02) return m.lucro;
          return -compraMesAtual;
        })();

  const lucrosChart = resumo.lucrosMensais.map((m, i) => {
    const compra = resumo.comprasMensais[i]?.valor ?? 0;
    const venda = resumo.vendasMensais?.[i]?.valor;
    if (venda != null) {
      return { ...m, lucro: venda - compra };
    }
    if (Math.abs((m.gastos ?? 0) - compra) < 0.02) {
      return m;
    }
    return { ...m, lucro: -compra };
  });

  return (
    <View style={styles.statsSection}>
      <View style={styles.resumoGrid}>
        <ResumoCard
          label="Lucro do mês"
          value={formatarPreco(lucroMesAtual)}
          accent="#2E7D32"
          icon="trending-up-outline"
        />
        <ResumoCard
          label="Lucro total"
          value={formatarPreco(totais.lucroTotal)}
          accent={COMPANY_COLORS.primary}
          icon="wallet-outline"
        />
        <ResumoCard
          label="Média pedidos/mês"
          value={String(resumo.mediaPedidosMensais)}
          accent="#5DB4CD"
          icon="receipt-outline"
        />
        <ResumoCard
          label="Média lucro/mês"
          value={formatarPreco(resumo.mediaLucroMensal)}
          accent="#E89510"
          icon="stats-chart-outline"
        />
      </View>

      <View style={styles.margemPill}>
        <Text style={styles.margemText}>
          Margem de lucro: {totais.margemPercentual}%
        </Text>
        <Text style={styles.margemSub}>
          Compras no mês: {formatarPreco(compraMesAtual)} ·{' '}
          {resumo.totalPedidosMesAtual} pedidos
        </Text>
      </View>

      <BarChart
        title="Lucros mensais"
        items={lucrosChart}
        valueKey="lucro"
        formatValue={(v) => formatarPreco(v)}
      />

      <BarChart
        title="Compras mensais (B2B)"
        items={resumo.comprasMensais}
        valueKey="valor"
        formatValue={(v) => formatarPreco(v)}
      />

      <BarChart
        title="Pedidos mensais"
        items={resumo.pedidosMensais}
        valueKey="quantidade"
      />

      <Text style={styles.sectionTitleDark}>Formas de pagamento</Text>
      {resumo.formasPagamento.length === 0 ? (
        <Text style={styles.pagamentoEmpty}>Nenhum pagamento PDV registrado no período.</Text>
      ) : (
        resumo.formasPagamento.map((forma) => (
          <View key={forma.metodo} style={styles.pagamentoRow}>
            <View style={styles.pagamentoLeft}>
              <View style={styles.pagamentoIconWrap}>
                <Ionicons name={iconePagamento(forma.metodo)} size={20} color={COMPANY_COLORS.primary} />
              </View>
              <View style={styles.pagamentoInfo}>
                <Text style={styles.pagamentoLabel}>{forma.label}</Text>
                <Text style={styles.pagamentoValor}>{formatarPreco(forma.valor)}</Text>
              </View>
            </View>
            <View style={styles.pagamentoBarBg}>
              <View style={[styles.pagamentoBarFill, { width: `${forma.percentual}%` }]} />
            </View>
            <Text style={styles.pagamentoPct}>{forma.percentual}%</Text>
          </View>
        ))
      )}
    </View>
  );
}

