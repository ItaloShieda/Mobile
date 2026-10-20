import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackTitleHeader } from '../../components/Header/BackTitleHeader';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { COMPANY_COLORS } from '../../theme/theme';

type Periodo = 'Dia' | 'Mês' | 'Ano';

const dadosGrafico: Record<Periodo, { label: string; valor: number }[]> = {
  Dia: [
    { label: 'Seg', valor: 40 },
    { label: 'Ter', valor: 60 },
    { label: 'Qua', valor: 50 },
    { label: 'Qui', valor: 90 },
    { label: 'Sex', valor: 75 },
    { label: 'Sáb', valor: 85 },
    { label: 'Dom', valor: 55 },
  ],
  Mês: [
    { label: 'Jan', valor: 40 },
    { label: 'Fev', valor: 62 },
    { label: 'Mar', valor: 58 },
    { label: 'Abr', valor: 80 },
    { label: 'Mai', valor: 70 },
    { label: 'Jun', valor: 95 },
  ],
  Ano: [
    { label: '2020', valor: 55 },
    { label: '2021', valor: 68 },
    { label: '2022', valor: 74 },
    { label: '2023', valor: 86 },
    { label: '2024', valor: 92 },
    { label: '2025', valor: 100 },
  ],
};

export function EmpresaGraficosScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('Dia');
  const goBack = useAppGoBack('Home');

  const dados = useMemo(() => dadosGrafico[periodo], [periodo]);
  const valorMaximo = Math.max(...dados.map((item) => item.valor));

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BackTitleHeader title="Gráficos da empresa" onBack={goBack} />

        <View style={styles.segmentedControl}>
          {(['Dia', 'Mês', 'Ano'] as Periodo[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segmentButton, periodo === item && styles.segmentButtonSelected]}
              onPress={() => setPeriodo(item)}
            >
              <Text
                style={[styles.segmentText, periodo === item && styles.segmentTextSelected]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Vendas por {periodo.toLowerCase()}</Text>

          <View style={styles.chartArea}>
            {dados.map((item) => (
              <View key={item.label} style={styles.barColumn}>
                <View style={styles.barValueLabelWrap}>
                  <Text style={styles.barValueLabel}>{item.valor}k</Text>
                </View>
                <View
                  style={[
                    styles.bar,
                    { height: `${(item.valor / valorMaximo) * 100}%` },
                  ]}
                />
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Receita</Text>
            <Text style={styles.metricValue}>R$ 64.800</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ticket médio</Text>
            <Text style={styles.metricValue}>R$ 498</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Meta</Text>
            <Text style={styles.metricValue}>84%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#F0E6CC',
    marginTop: 8,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentButtonSelected: {
    backgroundColor: COMPANY_COLORS.primary,
  },
  segmentText: {
    color: '#666',
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: '#FFF',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 14,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 220,
    borderTopWidth: 1,
    borderTopColor: COMPANY_COLORS.primaryBorder,
    paddingTop: 12,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueLabelWrap: {
    height: 24,
    justifyContent: 'center',
  },
  barValueLabel: {
    fontSize: 10,
    color: '#888',
  },
  bar: {
    width: 22,
    maxWidth: 32,
    minHeight: 28,
    backgroundColor: COMPANY_COLORS.primary,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  barLabel: {
    marginTop: 8,
    color: '#666',
    fontSize: 11,
  },
  summaryGrid: {
    marginTop: 18,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
  },
  metricLabel: {
    color: '#666',
    fontSize: 12,
  },
  metricValue: {
    marginTop: 6,
    color: '#222',
    fontWeight: '800',
    fontSize: 22,
  },
});
