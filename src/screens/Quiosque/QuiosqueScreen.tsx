import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { TabScreenLayout } from '../../components/layout/TabScreenLayout';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { BarracaCard } from './components/BarracaCard';
import { BarracaFormModal } from './components/BarracaFormModal';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';
import { useQuiosques } from '../../context/QuiosqueContext';
import { useProdutos } from '../../context/ProductsContext';
import { Quiosque, removerQuiosque } from '../../services/barracaService';
import { styles } from './styles';
import { COMPANY_COLORS } from '../../theme/theme';

export function QuiosqueScreen() {
  const { user } = useAuth();
  const { quiosques, loading, error, refresh } = useQuiosques();
  const { refresh: refreshProdutos } = useProdutos();
  const { confirm } = useConfirmDialog();
  const empresaId = user?.empresa?.id;
  const responsavelId = user?.id;

  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [quiosqueEmEdicao, setQuiosqueEmEdicao] = useState<Quiosque | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshProdutos();
    }, [refresh, refreshProdutos]),
  );

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return quiosques;
    return quiosques.filter((item) => item.nome.toLowerCase().includes(termo));
  }, [quiosques, busca]);

  const abrirNova = () => {
    setQuiosqueEmEdicao(null);
    setModalVisible(true);
  };

  const abrirEdicao = (quiosque: Quiosque) => {
    setQuiosqueEmEdicao(quiosque);
    setModalVisible(true);
  };

  const confirmarRemocao = (quiosque: Quiosque) => {
    if (!empresaId) return;

    confirm({
      title: 'Remover quiosque',
      message: `Deseja remover "${quiosque.nome}"?`,
      confirmText: 'Remover',
      destructive: true,
      onConfirm: async () => {
        await removerQuiosque(quiosque.id, empresaId);
        await refresh();
      },
    });
  };

  return (
    <>
      <TabScreenLayout
        title="Quiosques"
        subtitle="Filiais e quiosques da empresa com estoque disponível."
        wrapContent={false}
        scrollContentStyle={styles.scrollContent}
        tabBar={<BottomTabBar activeRoute="Quiosque" />}
        headerContent={
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COMPANY_COLORS.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar quiosque..."
              placeholderTextColor="#999"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
        }
      >

        <TouchableOpacity style={styles.addButton} onPress={abrirNova} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#FFF" />
          <Text style={styles.addButtonText}>Adicionar Quiosque</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color={COMPANY_COLORS.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-offline-outline" size={40} color={COMPANY_COLORS.primary} />
            <Text style={styles.errorTitle}>Não foi possível carregar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : listaFiltrada.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {busca.trim()
                ? 'Nenhum quiosque encontrado para a busca.'
                : 'Nenhum quiosque cadastrado.'}
            </Text>
            {!busca.trim() ? (
              <TouchableOpacity onPress={abrirNova}>
                <Text style={styles.retryText}>Cadastrar primeiro quiosque</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          listaFiltrada.map((quiosque) => (
            <BarracaCard
              key={quiosque.id}
              quiosque={quiosque}
              onPress={() => abrirEdicao(quiosque)}
              onDelete={() => confirmarRemocao(quiosque)}
            />
          ))
        )}
      </TabScreenLayout>

      {empresaId && responsavelId ? (
        <BarracaFormModal
          visible={modalVisible}
          empresaId={empresaId}
          responsavelId={responsavelId}
          quiosque={quiosqueEmEdicao}
          onClose={() => setModalVisible(false)}
          onSaved={refresh}
        />
      ) : null}
    </>
  );
}
