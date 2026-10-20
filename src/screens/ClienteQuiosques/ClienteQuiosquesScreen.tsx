import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabBar, useBottomTabBarHeight } from '../../components/layout/BottomTabBar';
import { useProdutos } from '../../context/ProductsContext';
import { useQuiosques } from '../../context/QuiosqueContext';
import { formatarPreco } from '../../services/productService';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { quiosqueExcedeEstoque, resumoEstoque } from '../../utils/estoqueQuiosque';
import { PRIMARY, styles } from './styles';

export function ClienteQuiosquesScreen() {
  const navigation = useNavigation<any>();
  const topPadding = useHeaderTopPadding(8);
  const tabBarHeight = useBottomTabBarHeight();
  const { produtos, loading: loadingProdutos, error: errorProdutos, refresh: refreshProdutos } = useProdutos();
  const { quiosques, loading: loadingQuiosques, error: errorQuiosques, refresh: refreshQuiosques } = useQuiosques();

  const produtosCliente = useMemo(
    () => produtos.filter((p) => p.ativo === 1 && (p.estoque ?? 0) > 0),
    [produtos],
  );
  const resumo = useMemo(() => resumoEstoque(produtosCliente, quiosques), [produtosCliente, quiosques]);

  const loading = loadingProdutos || loadingQuiosques;
  const error = errorProdutos || errorQuiosques;
  const semProdutos = produtosCliente.length === 0;

  const tentarNovamente = () => {
    void refreshProdutos();
    void refreshQuiosques();
  };
  const novoQuiosque = () => navigation.navigate('ClienteQuiosqueForm');

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
      >
        <View style={[styles.header, { paddingTop: topPadding }]}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <Text style={styles.brandQuick}>Quick</Text>
              <Text style={styles.brandStock}>Stock</Text>
            </View>
          </View>
          <Text style={styles.title}>Meus quiosques</Text>
          <Text style={styles.subtitle}>Monte o estoque dos seus eventos com o que você comprou.</Text>
          {!semProdutos && !error ? (
            <TouchableOpacity style={styles.headerButton} onPress={novoQuiosque} activeOpacity={0.85}>
              <Ionicons name="add" size={16} color={PRIMARY} />
              <Text style={styles.headerButtonText}>Novo quiosque</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.sheet}>
          {loading && quiosques.length === 0 && produtos.length === 0 ? (
            <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
          ) : error ? (
            <View style={[styles.card, styles.empty]}>
              <Ionicons name="cloud-offline-outline" size={40} color={PRIMARY} />
              <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity onPress={tentarNovamente} activeOpacity={0.8}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : semProdutos && quiosques.length === 0 ? (
            <View style={[styles.card, styles.empty]}>
              <Ionicons name="cube-outline" size={44} color={PRIMARY} />
              <Text style={styles.emptyTitle}>Você ainda não tem produtos recebidos</Text>
              <Text style={styles.emptyText}>
                Compre de um fornecedor para montar seu quiosque. Os produtos aparecem aqui quando o pedido é entregue.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Explorar')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Ver produtos</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Seu estoque</Text>
                <Text style={styles.cardHint}>Produtos recebidos das suas compras</Text>
                <View style={styles.resumoRow}>
                  <View style={styles.resumoItem}>
                    <Text style={styles.resumoValor}>{resumo.comprado}</Text>
                    <Text style={styles.resumoLabel}>un. compradas</Text>
                  </View>
                  <View style={styles.resumoItem}>
                    <Text style={styles.resumoValor}>{resumo.alocado}</Text>
                    <Text style={styles.resumoLabel}>nos quiosques</Text>
                  </View>
                  <View style={styles.resumoItem}>
                    <Text style={styles.resumoValor}>{resumo.livre}</Text>
                    <Text style={styles.resumoLabel}>livres</Text>
                  </View>
                </View>
              </View>

              {quiosques.length === 0 ? (
                <View style={[styles.card, styles.empty]}>
                  <Ionicons name="storefront-outline" size={44} color={PRIMARY} />
                  <Text style={styles.emptyTitle}>Crie seu primeiro quiosque</Text>
                  <Text style={styles.emptyText}>
                    Escolha os produtos e as quantidades que vão para o evento.
                  </Text>
                  <TouchableOpacity style={styles.primaryButton} onPress={novoQuiosque} activeOpacity={0.85}>
                    <Ionicons name="add" size={16} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Novo quiosque</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                quiosques.map((q) => {
                  const unidades = q.itens.reduce((acc, item) => acc + item.quantidade, 0);
                  const valor = q.itens.reduce((acc, item) => acc + item.quantidade * item.precoVenda, 0);
                  const excede = quiosqueExcedeEstoque(q, produtos, quiosques);
                  return (
                    <TouchableOpacity
                      key={q.id}
                      style={[styles.card, styles.quiosqueCard]}
                      onPress={() => navigation.navigate('ClienteQuiosqueForm', { quiosqueId: q.id })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.quiosqueIcon}>
                        <Ionicons name="storefront" size={22} color={PRIMARY} />
                      </View>
                      <View style={styles.quiosqueCopy}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{q.nome}</Text>
                        <View style={styles.quiosqueMeta}>
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>
                              {q.itens.length} {q.itens.length === 1 ? 'produto' : 'produtos'}
                            </Text>
                          </View>
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>{unidades} un.</Text>
                          </View>
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>{formatarPreco(valor)}</Text>
                          </View>
                          {excede ? (
                            <View style={[styles.chip, styles.warningChip]}>
                              <Text style={[styles.chipText, styles.warningChipText]}>
                                Estoque acima do disponível
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#9AA3B2" />
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}
        </View>
      </ScrollView>

      <BottomTabBar activeRoute="ClienteQuiosques" />
    </View>
  );
}
