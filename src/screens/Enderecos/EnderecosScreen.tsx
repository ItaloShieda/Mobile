import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { TabScreenLayout } from '../../components/layout/TabScreenLayout';
import { PagePrimaryButton } from '../../components/Button/PagePrimaryButton';
import { BottomTabBar, useBottomTabBarHeight } from '../../components/layout/BottomTabBar';
import { BackButton } from '../../components/Header/BackButton';
import { EnderecoFormModal } from '../../components/Card/EnderecoFormModal';
import { useAuth } from '../../context/AuthContext';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { EnderecoEntrega, listarEnderecos } from '../../services/enderecoService';
import { clienteStyles, styles } from './styles';
import { CLIENTE_COLORS } from '../../theme/theme';

const PRIMARY = CLIENTE_COLORS.primary;

function EmptyIllustration() {
  return (
    <View style={clienteStyles.illustration}>
      <View style={clienteStyles.illustrationBg} />
      <Ionicons name="business-outline" size={36} color="#C5D4E8" />
      <View style={clienteStyles.pinWrap}>
        <Ionicons name="location" size={36} color={PRIMARY} />
      </View>
      <Ionicons name="car-outline" size={52} color={PRIMARY} style={{ marginTop: 28 }} />
    </View>
  );
}

export function EnderecosScreen() {
  const { user, perfilUso } = useAuth();
  const empresaId = user?.empresa?.id;
  const isCliente = perfilUso === 'Cliente';
  const goBack = useAppGoBack(isCliente ? 'Perfil' : 'Home');
  const topPadding = useHeaderTopPadding(8);
  const tabBarHeight = useBottomTabBarHeight();

  const [enderecos, setEnderecos] = useState<EnderecoEntrega[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const carregar = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    setError('');
    try {
      const lista = await listarEnderecos(empresaId);
      setEnderecos(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar endereços.');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const handleEnderecoSalvo = async () => {
    await carregar();
  };

  const modal = empresaId ? (
    <EnderecoFormModal
      visible={modalVisible}
      empresaId={empresaId}
      isFirstAddress={enderecos.length === 0}
      onClose={() => setModalVisible(false)}
      onSaved={handleEnderecoSalvo}
    />
  ) : null;

  if (isCliente) {
    return (
      <View style={clienteStyles.root}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 16 }}
        >
          <View style={[clienteStyles.header, { paddingTop: topPadding }]}>
            <View style={clienteStyles.headerTop}>
              <BackButton onPress={goBack} iconColor={PRIMARY} />
              <View style={clienteStyles.brandRow}>
                <Text style={clienteStyles.brandQuick}>Quick</Text>
                <Text style={clienteStyles.brandStock}>Stock</Text>
              </View>
              <View style={{ width: 32 }} />
            </View>
            <Text style={clienteStyles.title}>Endereços de entrega</Text>
            <Text style={clienteStyles.subtitle}>
              Gerencie onde seu negócio recebe os pedidos.
            </Text>
          </View>

          <View style={clienteStyles.sheet}>
            <TouchableOpacity
              style={clienteStyles.addButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={clienteStyles.addButtonText}>Adicionar endereço</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
            ) : error ? (
              <View style={clienteStyles.emptyCard}>
                <Text style={clienteStyles.errorText}>{error}</Text>
                <TouchableOpacity onPress={carregar}>
                  <Text style={clienteStyles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : enderecos.length === 0 ? (
              <>
                <View style={clienteStyles.emptyCard}>
                  <EmptyIllustration />
                  <Text style={clienteStyles.emptyTitle}>Nenhum endereço cadastrado</Text>
                  <Text style={clienteStyles.emptyText}>
                    Adicione um endereço para receber as bebidas do seu negócio.
                  </Text>
                </View>
                <View style={clienteStyles.infoCard}>
                  <View style={clienteStyles.infoIcon}>
                    <Ionicons name="information-circle" size={18} color={PRIMARY} />
                  </View>
                  <Text style={clienteStyles.infoText}>
                    Você poderá escolher o endereço ao finalizar o pedido.
                  </Text>
                </View>
              </>
            ) : (
              <View style={clienteStyles.listCard}>
                {enderecos.map((endereco) => (
                  <View key={endereco.id} style={clienteStyles.enderecoRow}>
                    <View style={clienteStyles.enderecoIcon}>
                      <Ionicons name="location-outline" size={20} color={PRIMARY} />
                    </View>
                    <View style={clienteStyles.enderecoInfo}>
                      <Text style={clienteStyles.enderecoApelido}>{endereco.apelido}</Text>
                      <Text style={clienteStyles.enderecoResumo} numberOfLines={2}>
                        {endereco.resumo}
                      </Text>
                      {endereco.principal ? (
                        <View style={clienteStyles.principalPill}>
                          <Text style={clienteStyles.principalText}>Principal</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <BottomTabBar activeRoute="Enderecos" />
        {modal}
      </View>
    );
  }

  return (
    <>
      <TabScreenLayout
        title="Endereços"
        subtitle="Gerencie os endereços de entrega usados nos seus pedidos."
        wrapContent={false}
        tabBar={<BottomTabBar activeRoute="Home" />}
      >
        <PagePrimaryButton
          label="Adicionar endereço"
          icon="add-circle-outline"
          onPress={() => setModalVisible(true)}
          compact
          light
          style={styles.addButton}
        />

        {loading ? (
          <ActivityIndicator color="#F8B125" style={{ marginTop: 24 }} />
        ) : error ? (
          <View style={styles.sectionCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={carregar}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : enderecos.length === 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="location-outline" size={22} color="#F8B125" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione um endereço para receber seus pedidos do marketplace.
            </Text>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cadastrados</Text>
              <Text style={styles.sectionSubtitle}>
                {enderecos.length} endereço(s) de entrega
              </Text>
            </View>
            {enderecos.map((endereco, index) => (
              <View
                key={endereco.id}
                style={[styles.enderecoCard, index === enderecos.length - 1 && styles.cardLast]}
              >
                <View style={styles.enderecoIconWrap}>
                  <Ionicons name="location-outline" size={22} color="#F8B125" />
                </View>
                <View style={styles.enderecoInfo}>
                  <Text style={styles.enderecoApelido}>{endereco.apelido}</Text>
                  <Text style={styles.enderecoResumo} numberOfLines={2}>
                    {endereco.resumo}
                  </Text>
                  <Text style={styles.enderecoCep}>CEP {endereco.cep}</Text>
                  {endereco.principal ? (
                    <View style={styles.principalPill}>
                      <Text style={styles.enderecoPrincipal}>Principal</Text>
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D4B56A" />
              </View>
            ))}
          </View>
        )}
      </TabScreenLayout>
      {modal}
    </>
  );
}
