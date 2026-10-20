import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackTitleHeader } from '../../components/Header/BackTitleHeader';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { styles } from './camioneirosStyles';

const motoristas = [
  {
    
    nome: 'Leandro Nogueira',
    rota: 'Recife → Salvador',
    veiculo: 'Truck 15',
    status: 'Atrasado',
    clientes: ['Casa da Feira'],
  },
];

export function CamioneirosScreen() {
  const navigation = useNavigation<any>();
  const goBack = useAppGoBack('Home');

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BackTitleHeader
          title="Caminhoneiros"
          onBack={goBack}
          rightSlot={
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('CadastroCamioneiros')}
            >
              <Text style={styles.headerButtonText}>+ Novo</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.summary}>
          <Text style={styles.summaryValue}>18</Text>
          <Text style={styles.summaryLabel}>motoristas ativos</Text>
        </View>

        {motoristas.map((motorista) => (
          <View key={motorista.nome} style={styles.card}>
            <View style={styles.headRow}>
              <View>
                <Text style={styles.name}>{motorista.nome}</Text>
                <Text style={styles.route}>Rota: {motorista.rota}</Text>
              </View>
              <View style={[styles.statusBadge, getStatusStyle(motorista.status)]}>
                <Text style={styles.statusText}>{motorista.status}</Text>
              </View>
            </View>

            <Text style={styles.vehicle}>Veículo: {motorista.veiculo}</Text>

            <Text style={styles.clientLabel}>Entregas:</Text>
            {motorista.clientes.map((cliente) => (
              <Text key={`${motorista.nome}-${cliente}`} style={styles.clientName}>• {cliente}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'Em rota':
      return styles.statusEmRota;
    case 'Carregando':
      return styles.statusCarregando;
    case 'Disponível':
      return styles.statusDisponivel;
    case 'Atrasado':
      return styles.statusAtrasado;
    default:
      return styles.statusPadrao;
  }
}
