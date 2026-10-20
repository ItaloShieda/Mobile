import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackTitleHeader } from '../../components/Header/BackTitleHeader';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { styles } from './logisticaStyles';

const processos = [
  { nome: 'Pedido confirmado', concluido: true, horario: '08:10' },
  { nome: 'Separação no estoque', concluido: true, horario: '08:40' },
  { nome: 'Carregamento', concluido: true, horario: '09:15' },
  { nome: 'Em trânsito', concluido: true, horario: '10:25' },
  { nome: 'Entrega prevista', concluido: false, horario: '12:00' },
];

export function LogisticaScreen() {
  const goBack = useAppGoBack('Home');

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BackTitleHeader title="Logística e envio" onBack={goBack} />

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Status da entrega</Text>
          <Text style={styles.heroValue}>Em trânsito</Text>
          <Text style={styles.heroSubtitle}>Tempo estimado: 2h 15min</Text>
        </View>

        <View style={styles.timelineCard}>
          {processos.map((processo, index) => (
            <View key={processo.nome} style={styles.stepRow}>
              <View style={styles.stepMarkerWrap}>
                <View style={[styles.stepMarker, processo.concluido ? styles.stepMarkerDone : styles.stepMarkerPending]} />
                {index < processos.length - 1 ? <View style={styles.stepLine} /> : null}
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepName}>{processo.nome}</Text>
                <Text style={styles.stepTime}>{processo.horario}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pedido</Text>
            <Text style={styles.metricValue}>#1049</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Motorista</Text>
            <Text style={styles.metricValue}>Rafael</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Rota</Text>
            <Text style={styles.metricValue}>SP → PR</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
