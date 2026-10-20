import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackTitleHeader } from '../../components/Header/BackTitleHeader';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { styles } from './cadastroCamioneirosStyles';

interface Entrega {
  nomeCliente: string;
  cidade: string;
  rota: string;
  status: 'Em rota' | 'Carregando' | 'Entregue';
}

interface Caminhoneiro {
  id: number;
  nome: string;
  veiculo: string;
  rota: string;
  entregas: Entrega[];
}

const initialMotoristas: Caminhoneiro[] = [
  {
    id: 1,
    nome: 'Rafael Costa',
    veiculo: 'Truck 27',
    rota: 'São Paulo → Curitiba',
    entregas: [
      { nomeCliente: 'Ana Paula', cidade: 'Curitiba', rota: 'São Paulo → Curitiba', status: 'Em rota' },
      { nomeCliente: 'Beto Ltda', cidade: 'Londrina', rota: 'São Paulo → Curitiba', status: 'Carregando' },
    ],
  },
  {
    id: 2,
    nome: 'Marcos Silva',
    veiculo: 'Truck 11',
    rota: 'Campinas → Porto Alegre',
    entregas: [
      { nomeCliente: 'Maria Souza', cidade: 'Porto Alegre', rota: 'Campinas → Porto Alegre', status: 'Em rota' },
    ],
  },
];

export function CadastroCamioneirosScreen() {
  const goBack = useAppGoBack('Home');
  const [motoristas, setMotoristas] = useState<Caminhoneiro[]>(initialMotoristas);
  const [nome, setNome] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [rota, setRota] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteCidade, setClienteCidade] = useState('');

  const totalEntregas = useMemo(
    () => motoristas.reduce((acc, item) => acc + item.entregas.length, 0),
    [motoristas],
  );

  const cadastrarMotorista = () => {
    if (!nome.trim() || !veiculo.trim() || !rota.trim()) {
      Alert.alert('Atenção', 'Preencha nome, veículo e rota do caminhoneiro.');
      return;
    }

    const novoMotorista: Caminhoneiro = {
      id: Date.now(),
      nome: nome.trim(),
      veiculo: veiculo.trim(),
      rota: rota.trim(),
      entregas: clienteNome.trim()
        ? [
            {
              nomeCliente: clienteNome.trim(),
              cidade: clienteCidade.trim() || 'Local não informado',
              rota: rota.trim(),
              status: 'Carregando',
            },
          ]
        : [],
    };

    setMotoristas((prev) => [novoMotorista, ...prev]);
    setNome('');
    setVeiculo('');
    setRota('');
    setClienteNome('');
    setClienteCidade('');

    Alert.alert('Sucesso', 'Caminhoneiro cadastrado com sucesso.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BackTitleHeader title="Cadastro de caminhoneiros" onBack={goBack} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{motoristas.length}</Text>
          <Text style={styles.summaryLabel}>caminhoneiros ativos</Text>
          <Text style={styles.summarySub}>Total de entregas: {totalEntregas}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Dados do caminhoneiro</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

          <Text style={styles.label}>Veículo</Text>
          <TextInput style={styles.input} value={veiculo} onChangeText={setVeiculo} placeholder="Ex: Truck 22" />

          <Text style={styles.label}>Rota atual</Text>
          <TextInput
            style={styles.input}
            value={rota}
            onChangeText={setRota}
            placeholder="Ex: São Paulo → Rio"
          />

          <Text style={styles.sectionTitle}>Entrega vinculada</Text>

          <Text style={styles.label}>Nome do cliente</Text>
          <TextInput
            style={styles.input}
            value={clienteNome}
            onChangeText={setClienteNome}
            placeholder="Ex: João da Padaria"
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={clienteCidade}
            onChangeText={setClienteCidade}
            placeholder="Ex: Campinas"
          />

          <TouchableOpacity style={styles.button} onPress={cadastrarMotorista}>
            <Text style={styles.buttonText}>Salvar caminhoneiro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Caminhoneiros cadastrados</Text>

          {motoristas.map((motorista) => (
            <View key={motorista.id} style={styles.motoristaCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.motoristaNome}>{motorista.nome}</Text>
                <Text style={styles.vehicleTag}>{motorista.veiculo}</Text>
              </View>

              <Text style={styles.rotaText}>Rota: {motorista.rota}</Text>

              {motorista.entregas.length > 0 ? (
                <View style={styles.entregasList}>
                  {motorista.entregas.map((entrega, index) => (
                    <View key={`${motorista.id}-${index}`} style={styles.entregaItem}>
                      <View style={styles.dot} />
                      <View style={styles.entregaInfo}>
                        <Text style={styles.entregaCliente}>{entrega.nomeCliente}</Text>
                        <Text style={styles.entregaMeta}>{entrega.cidade} • {entrega.rota}</Text>
                        <Text style={styles.entregaStatus}>{entrega.status}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.semEntrega}>Sem entregas vinculadas.</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
