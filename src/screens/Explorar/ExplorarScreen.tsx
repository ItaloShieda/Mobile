import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '../../components/media/RemoteImage';
import { NotificationsModal } from '../../components/Card/NotificationsModal';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { getImageUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { CATEGORIAS } from './useExplorar';
import { PRIMARY, styles } from './styles';
import { useExplorar } from './useExplorar';

export function ExplorarScreen() {
  const { user } = useAuth();
  const topPadding = useHeaderTopPadding(8);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    loading,
    busca,
    setBusca,
    categoria,
    toggleCategoria,
    limparFiltros,
    produtosDestaque,
    lojasDestaque,
    tabBarHeight,
    distanciaDaLoja,
    abrirLoja,
    abrirProduto,
    adicionarProduto,
    formatarPreco,
    normalizarEstoque,
  } = useExplorar();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
      >
        <View style={[styles.header, { paddingTop: topPadding }]}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <Text style={styles.brandQuick}>Quick</Text>
              <Text style={styles.brandStock}>Stock</Text>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => setNotificationsOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Produtos</Text>
          <Text style={styles.subtitle}>Bebidas de fornecedores para o seu negócio.</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#9AA3B2" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar bebidas ou quiosques"
              placeholderTextColor="#9AA3B2"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <TouchableOpacity onPress={limparFiltros} activeOpacity={0.8}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIAS.map((item) => {
                const selected = categoria === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: item.color },
                      selected && styles.categorySelected,
                    ]}
                    onPress={() => toggleCategoria(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.categoryLeft}>
                      <View style={styles.categoryIconWrap}>
                        <Ionicons name={item.icon} size={22} color={PRIMARY} />
                      </View>
                      <Text style={styles.categoryLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produtos em destaque</Text>
              <TouchableOpacity onPress={limparFiltros} activeOpacity={0.8}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator color={PRIMARY} style={{ marginVertical: 16 }} />
            ) : produtosDestaque.length === 0 ? (
              <Text style={styles.empty}>Nenhum produto encontrado.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsRow}>
                {produtosDestaque.map((produto) => {
                  const emEstoque = normalizarEstoque(produto.estoque) > 0;
                  return (
                    <TouchableOpacity
                      key={`${produto.empresaId}-${produto.id}`}
                      style={styles.productCard}
                      onPress={() => abrirProduto(produto)}
                      activeOpacity={0.85}
                    >
                      <RemoteImage
                        uri={getImageUrl(produto.imagemUrl)}
                        style={styles.productImage}
                        fallbackLabel={produto.nome}
                        resizeMode="cover"
                      />
                      <Text style={styles.productName} numberOfLines={2}>
                        {produto.nome}
                      </Text>
                      <Text style={styles.productUnit}>
                        {produto.unidade || 'un'}
                      </Text>
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice} numberOfLines={1}>
                          {formatarPreco(produto.precoVenda)}
                        </Text>
                        <TouchableOpacity
                          style={[styles.addButton, !emEstoque && { opacity: 0.4 }]}
                          onPress={() => adicionarProduto(produto)}
                          disabled={!emEstoque}
                        >
                          <Ionicons name="add" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.stockLabel, !emEstoque && { color: '#C62828' }]}>
                        {emEstoque ? 'Em estoque' : 'Esgotado'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quiosques de fornecedores</Text>
              <TouchableOpacity onPress={limparFiltros} activeOpacity={0.8}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {lojasDestaque.length === 0 ? (
              <Text style={styles.empty}>Nenhum quiosque disponível no momento.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesRow}>
                {lojasDestaque.map((loja, index) => (
                  <TouchableOpacity
                    key={loja.id}
                    style={styles.storeCard}
                    onPress={() => abrirLoja(loja)}
                    activeOpacity={0.85}
                  >
                    <RemoteImage
                      uri={getImageUrl(loja.capaUrl || loja.logoUrl)}
                      style={styles.storeCover}
                      fallbackLabel={loja.nome}
                      resizeMode="cover"
                    />
                    <View style={styles.storeCopy}>
                      <Text style={styles.storeName} numberOfLines={1}>
                        {loja.nome}
                      </Text>
                      <Text style={styles.storeHint} numberOfLines={1}>
                        {loja.descricao || 'Bebidas e quiosque'}
                      </Text>
                      <View style={styles.storeMeta}>
                        <Ionicons name="location-outline" size={12} color="#8A93A3" />
                        <Text style={styles.storeDistance}>{distanciaDaLoja(index)}</Text>
                        <View style={styles.verQuiosque}>
                          <Text style={styles.verQuiosqueText}>Ver quiosque</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeRoute="Explorar" />

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        empresaId={user?.empresa?.id}
      />
    </View>
  );
}
