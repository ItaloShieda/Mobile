import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/Header/ScreenHeader';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { Fornecedor, labelStatusPedido } from '../../services/marketplaceService';
import { formatarPreco } from '../../services/productService';
import { formatarDataCurta } from '../../utils/dateFormat';
import { styles } from './styles';
import { CARD_GAP, FEATURED_WIDTH } from './cartLayout';
import {
  FeaturedBanner,
  HorizontalCard,
  PartnerCard,
  StoreCard,
} from './components/MarketplaceCards';
import { useCart } from './useCart';
import { COMPANY_COLORS } from '../../theme/theme';

export function CartScreen() {
  const {
    navigation,
    itemCount,
    fornecedoresPorId,
    fornecedoresFiltrados,
    solicitacoes,
    loading,
    error,
    busca,
    setBusca,
    successBanner,
    setSuccessBanner,
    scrollBottomPadding,
    carregarDados,
    abrirFornecedor,
  } = useCart();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
        <ScreenHeader
          showCartBadge={itemCount > 0}
          cartItemCount={itemCount}
          onCartPress={() => navigation.navigate('Sacola')}
        />

        <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COMPANY_COLORS.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar distribuidora..."
              placeholderTextColor="#999"
              value={busca}
              onChangeText={setBusca}
          />
        </View>

        {successBanner ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successBanner}</Text>
            <TouchableOpacity onPress={() => setSuccessBanner('')}>
              <Ionicons name="close" size={18} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        ) : null}

        {fornecedoresFiltrados.length > 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Em destaque</Text>
              <Text style={styles.sectionSubtitle}>Distribuidoras para começar agora</Text>
            </View>
            <ScrollView
              horizontal
              pagingEnabled={false}
              decelerationRate="fast"
              snapToInterval={FEATURED_WIDTH + CARD_GAP}
              snapToAlignment="start"
              showsHorizontalScrollIndicator={false}
              style={styles.featuredScroll}
              contentContainerStyle={styles.featuredListPadding}
            >
              {fornecedoresFiltrados.map((fornecedor, index) => (
                <View
                  key={`destaque-${fornecedor.id}`}
                  style={[
                    styles.featuredItemWrap,
                    index === fornecedoresFiltrados.length - 1 && styles.featuredItemWrapLast,
                  ]}
                >
                  <FeaturedBanner
                    fornecedor={fornecedor}
                    onPress={() => abrirFornecedor(fornecedor)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={COMPANY_COLORS.primary} style={{ marginVertical: 24 }} />
        ) : error ? (
          <View style={styles.sectionCard}>
            <View style={styles.emptyBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={carregarDados}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Distribuidoras parceiras</Text>
                <Text style={styles.sectionSubtitle}>Explore o catálogo de cada loja</Text>
              </View>
              {fornecedoresFiltrados.length === 0 ? (
                <Text style={styles.emptyText}>
                  {busca.trim()
                    ? 'Nenhuma distribuidora encontrada para esta busca.'
                    : 'Nenhuma distribuidora disponível no momento.'}
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.partnerListPadding}
                >
                  {fornecedoresFiltrados.map((fornecedor) => (
                    <PartnerCard
                      key={fornecedor.id}
                      fornecedor={fornecedor}
                      onPress={() => abrirFornecedor(fornecedor)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Últimas solicitações</Text>
                <Text style={styles.sectionSubtitle}>Acompanhe seus pedidos recentes</Text>
              </View>
              {solicitacoes.length === 0 ? (
                <Text style={styles.emptyText}>Você ainda não enviou solicitações de compra.</Text>
              ) : (
                solicitacoes.slice(0, 5).map((solicitacao, index, lista) => {
                  const fornecedorInfo = fornecedoresPorId.get(solicitacao.fornecedorId);
                  const fornecedorCard: Fornecedor = fornecedorInfo ?? {
                    id: solicitacao.fornecedorId,
                    nome: solicitacao.fornecedorNome,
                    tipo: 'DISTRIBUIDOR',
                    totalProdutos: 0,
                  };
                  return (
                    <HorizontalCard
                      key={solicitacao.id}
                      fornecedor={fornecedorCard}
                      subtitle={`${formatarDataCurta(solicitacao.criadoEm)} · ${formatarPreco(solicitacao.valorTotal)} · ${solicitacao.statusLabel ?? labelStatusPedido(solicitacao.status)}`}
                      onPress={() => navigation.navigate('PedidoAcompanhamento', { pedidoId: solicitacao.id })}
                      isLast={index === lista.length - 1}
                    />
                  );
                })
              )}
            </View>

            {fornecedoresFiltrados.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Lojas</Text>
                  <Text style={styles.sectionSubtitle}>Todas as distribuidoras disponíveis</Text>
                </View>
                {fornecedoresFiltrados.map((fornecedor) => (
                  <StoreCard
                    key={fornecedor.id}
                    fornecedor={fornecedor}
                    onPress={() => abrirFornecedor(fornecedor)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      </SafeAreaView>

      <BottomTabBar activeRoute="Cart" />
    </View>
  );
}
