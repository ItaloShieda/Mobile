import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { TabScreenLayout } from '../../components/layout/TabScreenLayout';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { ProductFormModal } from './components/ProductFormModal';
import { RemoteImage } from '../../components/media/RemoteImage';
import { IconActionButton } from '../../components/Button/IconActionButton';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';
import { useProdutos } from '../../context/ProductsContext';
import { getImageUrl } from '../../config/api';
import { formatarPreco, formatarQuantidadeEstoque, Produto, removerProduto } from '../../services/productService';
import { styles } from './styles';
import { COMPANY_COLORS } from '../../theme/theme';

export function ManageProductsScreen() {
  const { user } = useAuth();
  const { produtos, loading, error, refresh } = useProdutos();
  const { confirm } = useConfirmDialog();
  const empresaId = user?.empresa?.id;

  const [modalVisible, setModalVisible] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const abrirNovo = () => {
    setProdutoEmEdicao(null);
    setModalVisible(true);
  };

  const abrirEdicao = (produto: Produto) => {
    setProdutoEmEdicao(produto);
    setModalVisible(true);
  };

  const confirmarRemocao = (produto: Produto) => {
    confirm({
      title: 'Remover produto',
      message: `Deseja remover "${produto.nome}" do catálogo?`,
      confirmText: 'Remover',
      destructive: true,
      onConfirm: async () => {
        await removerProduto(produto.id, empresaId);
        await refresh();
      },
    });
  };

  return (
    <>
      <TabScreenLayout
        title="Gerenciar produtos"
        subtitle="Cadastre, edite ou remova os produtos exibidos no app."
        wrapContent={false}
        tabBar={<BottomTabBar activeRoute="AddItem" />}
      >
        <TouchableOpacity style={styles.addButton} onPress={abrirNovo} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#FFF" />
          <Text style={styles.addButtonText}>Adicionar produto</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color={COMPANY_COLORS.primary} style={styles.loader} />
        ) : error ? (
          <View style={[styles.sectionCard, { alignItems: 'center', paddingVertical: 24 }]}>
            <Ionicons name="cloud-offline-outline" size={40} color={COMPANY_COLORS.primary} />
            <Text style={styles.errorTitle}>Não foi possível carregar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : produtos.length === 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cube-outline" size={22} color={COMPANY_COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione o primeiro item para exibir no estoque e no catálogo.
            </Text>
            <TouchableOpacity onPress={abrirNovo}>
              <Text style={styles.retryText}>Cadastrar primeiro produto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Catálogo</Text>
              <Text style={styles.sectionSubtitle}>
                {produtos.length} produto(s) cadastrado(s)
              </Text>
            </View>
            {produtos.map((item, index) => (
              <View
                key={item.id}
                style={[styles.productCard, index === produtos.length - 1 && styles.productCardLast]}
              >
                <TouchableOpacity
                  style={styles.productMain}
                  activeOpacity={0.85}
                  onPress={() => abrirEdicao(item)}
                >
                  <View style={styles.thumbnailWrap}>
                    <RemoteImage
                      uri={getImageUrl(item.imagemUrl)}
                      style={styles.thumbnail}
                      fallbackLabel={item.nome}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.nome}
                    </Text>
                    <Text style={styles.productCode}>
                      {item.codigo ? `ID ${item.codigo}` : `#${item.id}`}
                    </Text>
                    <Text style={styles.productPrice}>{formatarPreco(item.precoVenda)}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.stockPill}>
                        <Text style={styles.stockPillText}>
                          {formatarQuantidadeEstoque(item)}
                        </Text>
                      </View>
                      {item.unidade ? (
                        <Text style={styles.productUnit}>{item.unidade}</Text>
                      ) : null}
                    </View>
                    {item.descricao ? (
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {item.descricao}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <View style={styles.productActions}>
                  <IconActionButton
                    name="trash-outline"
                    accessibilityLabel="Remover produto"
                    onPress={() => confirmarRemocao(item)}
                  />
                  <Ionicons name="chevron-forward" size={16} color={COMPANY_COLORS.primaryMuted} />
                </View>
              </View>
            ))}
          </View>
        )}
      </TabScreenLayout>

      {empresaId ? (
        <ProductFormModal
          visible={modalVisible}
          empresaId={empresaId}
          produto={produtoEmEdicao}
          onClose={() => setModalVisible(false)}
          onSaved={refresh}
        />
      ) : null}
    </>
  );
}
