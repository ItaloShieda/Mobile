import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { BackTitleHeader } from '../../components/Header/BackTitleHeader';
import { HeaderCartBadge } from '../../components/Header/HeaderCartBadge';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { usePurchaseCart } from '../../context/PurchaseCartContext';
import { RemoteImage } from '../../components/media/RemoteImage';
import { getImageUrl } from '../../config/api';
import {
  labelTipoFornecedor,
  listarProdutosFornecedor,
} from '../../services/marketplaceService';
import { formatarPreco, Produto, labelEstoque, corEstoque, normalizarEstoque } from '../../services/productService';
import { styles } from './styles';
import { useAuth } from '../../context/AuthContext';
import { ClienteQuiosqueVitrine } from './ClienteQuiosqueVitrine';
import { COMPANY_COLORS } from '../../theme/theme';

const ACCENT = COMPANY_COLORS.primary;

export function StoreVitrineScreen() {
  const navigation = useNavigation<any>();
  const { perfilUso } = useAuth();
  const goBack = useAppGoBack(perfilUso === 'Cliente' ? 'Explorar' : 'Cart');
  const route = useRoute<any>();
  const { itemCount } = usePurchaseCart();

  const fornecedorId = route.params?.fornecedorId as number;
  const fornecedorNome = route.params?.fornecedorNome as string ?? 'Distribuidora';
  const descricao = route.params?.descricao as string | undefined;
  const logoUrl = route.params?.logoUrl as string | undefined;
  const capaUrl = route.params?.capaUrl as string | undefined;
  const tipo = route.params?.tipo as string | undefined;

  const [search, setSearch] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carregarProdutos = useCallback(async () => {
    if (!fornecedorId) return;
    setLoading(true);
    try {
      const lista = await listarProdutosFornecedor(fornecedorId);
      setProdutos(lista);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar produtos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fornecedorId]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos]),
  );

  const produtosFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [produtos, search]);

  const abrirProduto = (produto: Produto) => {
    navigation.navigate('ProductDetail', {
      produtoId: produto.id,
      fornecedorId,
      fornecedorNome,
      productName: produto.nome,
      price: formatarPreco(produto.precoVenda),
      descricao: produto.descricao,
      imagemUrl: produto.imagemUrl,
      unidade: produto.unidade,
      precoVenda: produto.precoVenda,
      estoque: produto.estoque,
      codigo: produto.codigo,
      fornecedorDescricao: descricao,
      fornecedorLogoUrl: logoUrl,
      fornecedorTipo: tipo,
    });
  };

  if (perfilUso === 'Cliente') {
    return (
      <ClienteQuiosqueVitrine
        fornecedorId={fornecedorId}
        fornecedorNome={fornecedorNome}
        descricao={descricao}
        logoUrl={logoUrl}
        capaUrl={capaUrl}
        tipo={tipo}
        produtos={produtos}
        loading={loading}
        error={error}
        search={search}
        setSearch={setSearch}
        onBack={goBack}
        onOpenProduct={abrirProduto}
      />
    );
  }

  const highlights = produtosFiltrados.slice(0, 3);

  const renderProduct = (produto: Produto, key: string, featured = false) => {
    const estoqueQtd = normalizarEstoque(produto.estoque);
    const esgotado = estoqueQtd <= 0;

    return (
    <TouchableOpacity
      key={key}
      style={[
        styles.productSmall,
        featured && styles.productFeatured,
        esgotado && styles.productSmallDisabled,
      ]}
      activeOpacity={0.85}
      onPress={() => abrirProduto(produto)}
    >
      <View style={styles.imageBox}>
        {produto.imagemUrl ? (
          <RemoteImage
            uri={getImageUrl(produto.imagemUrl)}
            style={styles.productImage}
            fallbackLabel={produto.nome}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="beer-outline" size={32} color="#999" />
        )}
        <View style={[styles.stockPill, { backgroundColor: corEstoque(estoqueQtd) }]}>
          <Text style={styles.stockPillText} numberOfLines={1}>
            {esgotado ? 'Esgotado' : `${estoqueQtd} un.`}
          </Text>
        </View>
      </View>
      <Text style={styles.price}>{formatarPreco(produto.precoVenda)}</Text>
      <Text style={styles.name} numberOfLines={2}>{produto.nome}</Text>
      <Text style={styles.productCode}>
        {produto.codigo ? `ID ${produto.codigo}` : `#${produto.id}`}
      </Text>
      <Text style={[styles.stockHint, { color: corEstoque(estoqueQtd) }]}>
        {labelEstoque(estoqueQtd)}
      </Text>
    </TouchableOpacity>
  );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BackTitleHeader
          title={fornecedorNome}
          onBack={goBack}
          inset={0}
          rightSlot={
            itemCount > 0 ? (
              <HeaderCartBadge
                itemCount={itemCount}
                onPress={() => navigation.navigate('Sacola')}
              />
            ) : undefined
          }
        />

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={ACCENT} />
          <TextInput
            placeholder="Procure o produto"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.banner}>
          {getImageUrl(capaUrl) ? (
            <RemoteImage
              uri={getImageUrl(capaUrl)!}
              style={styles.bannerImage}
              fallbackLabel={fornecedorNome}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[COMPANY_COLORS.primary, COMPANY_COLORS.primaryMuted]}
              style={styles.bannerImage}
            />
          )}
        </View>

        <View style={styles.storeCard}>
          <RemoteImage
            uri={getImageUrl(logoUrl)}
            style={styles.storeLogo}
            fallbackLabel={fornecedorNome}
            resizeMode="cover"
          />

          <Text style={styles.storeTitle} numberOfLines={1}>
            {fornecedorNome}
          </Text>

          <Text style={styles.delivery}>
            {descricao || 'Distribuidora parceira de bebidas para revenda.'}
          </Text>

          <Text style={styles.deliveryMeta}>
            {produtos.length} {produtos.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
            {' · '}
            {labelTipoFornecedor(tipo ?? 'DISTRIBUIDOR')}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 24 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : produtosFiltrados.length === 0 ? (
          <Text style={styles.errorText}>Nenhum produto disponível nesta distribuidora.</Text>
        ) : (
          <>
            {highlights.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Destaques</Text>
                  <Text style={styles.sectionSubtitle}>Os primeiros itens da loja</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.highlightsRow}
                >
                  {highlights.map((item) => renderProduct(item, `highlight-${item.id}`, true))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Produtos</Text>
                <Text style={styles.sectionSubtitle}>
                  {produtosFiltrados.length} item(ns) no catálogo
                </Text>
              </View>
              <View style={styles.twoColumns}>
                {produtosFiltrados.map((item) => renderProduct(item, `product-${item.id}`))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.cartButton}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(itemCount > 0 ? 'Sacola' : 'Cart')}
      >
        <Text style={styles.cartText}>
          {itemCount > 0 ? `Ver carrinho (${itemCount})` : 'Ver marketplace'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
