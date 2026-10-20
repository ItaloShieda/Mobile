import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatarPreco } from '../../../services/productService';
import { COMPANY_COLORS } from '../../../theme/theme';

interface FinancialDonutChartProps {
  totalCompras: number;
  totalVendas: number;
  lucroTotal: number;
  margemPercentual: number;
  loading?: boolean;
}

const SIZE_COLLAPSED = 180;
const SIZE_EXPANDED = 260;

export function FinancialDonutChart({
  totalCompras,
  totalVendas,
  lucroTotal,
  margemPercentual,
  loading = false,
}: FinancialDonutChartProps) {
  const [expanded, setExpanded] = useState(false);

  const chartSize = expanded ? SIZE_EXPANDED : SIZE_COLLAPSED;
  const borderWidth = expanded ? 32 : 25;

  const semMovimentacao =
    totalCompras === 0 && totalVendas === 0 && lucroTotal === 0;

  const { gastoDeg, comprasPct, lucroPct } = useMemo(() => {
    const lucroPositivo = Math.max(lucroTotal, 0);
    const base = totalCompras + lucroPositivo;
    if (base <= 0) {
      return { gastoDeg: 0, comprasPct: 0, lucroPct: 0 };
    }
    const pct = (totalCompras / base) * 100;
    return {
      gastoDeg: (pct / 100) * 180,
      comprasPct: pct,
      lucroPct: 100 - pct,
    };
  }, [totalCompras, lucroTotal]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COMPANY_COLORS.primary} size="large" />
      </View>
    );
  }

  if (semMovimentacao) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="analytics-outline" size={40} color="#CCC" />
        <Text style={styles.emptyText}>Nenhuma movimentação ainda</Text>
        <Text style={styles.emptyHint}>
          Compras e vendas aparecerão aqui conforme você usar a conta.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpanded((prev) => !prev)}
        style={[styles.chartTouchable, { width: chartSize, height: chartSize }]}
      >
        <View
          style={[
            styles.circleBase,
            {
              width: chartSize,
              height: chartSize,
              borderRadius: chartSize / 2,
              borderWidth,
              borderColor: '#32CD32',
            },
          ]}
        />
        <View
          style={[
            styles.circleBase,
            styles.circleRed,
            {
              width: chartSize,
              height: chartSize,
              borderRadius: chartSize / 2,
              borderWidth,
              transform: [{ rotate: `${gastoDeg}deg` }],
            },
          ]}
        />
        <View style={styles.chartTextContainer}>
          <Text style={[styles.chartTextGreen, expanded && styles.chartTextGreenExpanded]}>
            {formatarPreco(lucroTotal)}
          </Text>
          <Text style={styles.chartLabelGreen}>lucro</Text>
          <Text style={[styles.chartTextRed, expanded && styles.chartTextRedExpanded]}>
            {formatarPreco(totalCompras)}
          </Text>
          <Text style={styles.chartLabelRed}>compras</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.hintRow}>
        <Text style={styles.hintText}>
          {expanded ? 'Toque para recolher' : 'Toque para ver detalhes'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#999"
        />
      </View>

      {expanded ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Resumo financeiro real</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapRed}>
              <Ionicons name="cart-outline" size={18} color="#D64545" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Total em compras (B2B)</Text>
              <Text style={styles.detailValue}>{formatarPreco(totalCompras)}</Text>
              <Text style={styles.detailHint}>{comprasPct.toFixed(0)}% do volume</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapGreen}>
              <Ionicons name="trending-up-outline" size={18} color="#2E7D32" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Total em vendas</Text>
              <Text style={styles.detailValue}>{formatarPreco(totalVendas)}</Text>
              <Text style={styles.detailHint}>Receita acumulada da conta</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapGold}>
              <Ionicons name="wallet-outline" size={18} color={COMPANY_COLORS.primary} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Lucro total</Text>
              <Text style={[styles.detailValue, styles.detailValueProfit]}>
                {formatarPreco(lucroTotal)}
              </Text>
              <Text style={styles.detailHint}>
                Margem de {margemPercentual}% · {lucroPct.toFixed(0)}% vs compras
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  chartTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBase: {
    position: 'absolute',
  },
  circleRed: {
    borderColor: 'transparent',
    borderTopColor: '#FF6666',
    borderRightColor: '#FF6666',
  },
  chartTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  chartTextGreen: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 15,
  },
  chartTextGreenExpanded: {
    fontSize: 18,
  },
  chartLabelGreen: {
    color: '#2E7D32',
    fontSize: 11,
    marginBottom: 6,
  },
  chartTextRed: {
    color: '#D64545',
    fontWeight: '700',
    fontSize: 15,
  },
  chartTextRedExpanded: {
    fontSize: 18,
  },
  chartLabelRed: {
    color: '#D64545',
    fontSize: 11,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
  },
  detailCard: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 16,
    backgroundColor: COMPANY_COLORS.primarySoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  detailIconWrapRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailIconWrapGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailIconWrapGold: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  detailValueProfit: {
    color: COMPANY_COLORS.primary,
  },
  detailHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});
