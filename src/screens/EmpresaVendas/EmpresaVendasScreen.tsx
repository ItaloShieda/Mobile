import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../../components/Header/ScreenHeader';
import { styles } from './styles';
import { BottomTabBar } from '../../components/layout/BottomTabBar';

export function EmpresaVendasScreen() {
  const navigation = useNavigation<any>();

  // Estado para armazenar vendas
  const [vendasRecentes, setVendasRecentes] = useState([
    { id: '1007', cliente: 'Ateliê Jardim', valor: 'R$ 2.680,00', status: 'Entregue', hora: '08:30' },
  ]);

  // Estado para métricas
  const [metricas, setMetricas] = useState({
    hoje: { valor: 'R$ 18.450', delta: '+12,4% vs. ontem' },
    mes: { valor: 'R$ 172.380', delta: '+8,1% no mês' },
    pedidos: { valor: '258', delta: '34 em andamento' },
  });

  // Exemplo de atualização simulada (poderia ser chamada de API)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMetricas({
        hoje: { valor: 'R$ 20.000', delta: '+15% vs. ontem' },
        mes: { valor: 'R$ 180.000', delta: '+9% no mês' },
        pedidos: { valor: '270', delta: '40 em andamento' },
      });

      setVendasRecentes(prev => [
        ...prev,
        { id: '1008', cliente: 'Loja Nova', valor: 'R$ 1.200,00', status: 'Em rota', hora: '10:15' },
      ]);
    }, 5000); // atualiza após 5 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Vendas"
          subtitle="Acompanhe o faturamento e os pedidos da empresa."
          inset={16}
          style={{ marginBottom: 16 }}
          rightSlot={
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('EmpresaGraficos')}>
              <Text style={styles.headerButtonText}>Gráficos</Text>
            </TouchableOpacity>
          }
        />
        {/* Métricas */}
        <View style={styles.summaryGrid}>
          <View style={[styles.metricCard, styles.positiveCard]}>
            <Text style={styles.metricLabel}>Hoje</Text>
            <Text style={styles.metricValue}>{metricas.hoje.valor}</Text>
            <Text style={styles.metricDelta}>{metricas.hoje.delta}</Text>
          </View>
          <View style={[styles.metricCard, styles.primaryCard]}>
            <Text style={styles.metricLabel}>Mês</Text>
            <Text style={styles.metricValue}>{metricas.mes.valor}</Text>
            <Text style={styles.metricDelta}>{metricas.mes.delta}</Text>
          </View>
          <View style={[styles.metricCard, styles.warningCard]}>
            <Text style={styles.metricLabel}>Pedidos</Text>
            <Text style={styles.metricValue}>{metricas.pedidos.valor}</Text>
            <Text style={styles.metricDelta}>{metricas.pedidos.delta}</Text>
          </View>
        </View>

        {/* Últimas vendas */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Últimas vendas</Text>
          {vendasRecentes.map((venda) => (
            <View key={venda.id} style={styles.saleRow}>
              <View>
                <Text style={styles.saleClient}>{venda.cliente}</Text>
                <Text style={styles.saleMeta}>Pedido {venda.id} • {venda.hora}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleValue}>{venda.valor}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{venda.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
    <BottomTabBar activeRoute="EmpresaVendas" />
    </View>
  );
}
