import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../../config/api';
import { RemoteImage } from '../../../components/media/RemoteImage';
import { Quiosque, EstoqueItem, formatarQuantidade } from '../../../services/barracaService';
import { formatarPreco } from '../../../services/productService';
import { useProdutos } from '../../../context/ProductsContext';
import { formatarDiaSemana } from '../../../utils/dateFormat';
import { COMPANY_COLORS } from '../../../theme/theme';

interface BarracaCardProps {
  quiosque: Quiosque;
  onPress: () => void;
  onDelete: () => void;
}

const CollapsedItem = ({
  item,
  imagemUrl,
}: {
  item: EstoqueItem;
  imagemUrl?: string;
}) => (
  <View style={styles.stockItemCardCollapsed}>
    <RemoteImage
      uri={getImageUrl(imagemUrl)}
      style={styles.thumbnail}
      fallbackLabel={item.nome}
      resizeMode="cover"
    />
    <Text style={styles.stockItemName} numberOfLines={2}>
      {item.nome}
    </Text>
    <Text style={styles.stockItemPrice}>{formatarPreco(item.precoVenda)}</Text>
    <View style={styles.qtyBadge}>
      <Text style={styles.qtyBadgeText}>
        {formatarQuantidade(item.quantidade, item.unidade)}
      </Text>
    </View>
  </View>
);

const ExpandedItem = ({
  item,
  imagemUrl,
}: {
  item: EstoqueItem;
  imagemUrl?: string;
}) => (
  <View style={styles.stockItemCardExpanded}>
    <RemoteImage
      uri={getImageUrl(imagemUrl)}
      style={styles.expandedThumbnail}
      fallbackLabel={item.nome}
      resizeMode="cover"
    />
    <Text style={styles.stockItemNameExpanded} numberOfLines={2}>
      {item.nome}
    </Text>
    <Text style={styles.stockItemPrice}>{formatarPreco(item.precoVenda)}</Text>
    <Text style={styles.stockItemTotal}>
      Estoque:{' '}
      <Text style={styles.stockItemTotalNumber}>
        {formatarQuantidade(item.quantidade, item.unidade)}
      </Text>
    </Text>
  </View>
);

export function BarracaCard({ quiosque, onPress, onDelete }: BarracaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { produtos } = useProdutos();
  const imagemPorProdutoId = useMemo(() => {
    const map = new Map<number, string | undefined>();
    produtos.forEach((produto) => map.set(produto.id, produto.imagemUrl));
    return map;
  }, [produtos]);

  const resolverImagem = (item: EstoqueItem) =>
    item.imagemUrl ?? imagemPorProdutoId.get(item.produtoId);

  const itensComEstoque = quiosque.itens.filter((item) => item.quantidade > 0);
  const dataLabel = formatarDiaSemana(quiosque.atualizadoEm);
  const resumo = `${quiosque.totalProdutos} produto(s) · ${quiosque.totalUnidades} un disponíveis`;

  return (
    <View style={styles.mainCard}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded(!expanded)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <View style={styles.dot} />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {quiosque.nome}
            </Text>
          </View>
          <View style={styles.datePillCard}>
            <Text style={styles.dateTextCard}>{dataLabel}</Text>
            <Ionicons name="calendar-outline" size={13} color={COMPANY_COLORS.primary} />
          </View>
        </View>

        {expanded ? (
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{resumo}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Evento: {quiosque.eventoNome}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.summaryText}>{resumo}</Text>
        )}

        {!expanded && itensComEstoque.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {itensComEstoque.map((item) => (
              <CollapsedItem
                key={item.produtoId}
                item={item}
                imagemUrl={resolverImagem(item)}
              />
            ))}
          </ScrollView>
        ) : null}

        {!expanded && itensComEstoque.length === 0 ? (
          <Text style={styles.emptyItemsText}>Nenhum produto com estoque registrado.</Text>
        ) : null}

        <View style={styles.expandHintRow}>
          <Text style={styles.expandHintText}>
            {expanded ? 'Toque para recolher' : 'Toque para expandir'}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#999"
          />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
              <Ionicons name="create-outline" size={18} color={COMPANY_COLORS.primary} />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <Pressable
              style={({ pressed }) => [styles.actionButtonDanger, pressed && styles.actionButtonDangerPressed]}
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#D64545" />
              <Text style={styles.actionButtonDangerText}>Remover</Text>
            </Pressable>
          </View>

          {itensComEstoque.length > 0 ? (
            <View style={styles.gridContainer}>
              {itensComEstoque.map((item) => (
                <ExpandedItem
                  key={item.produtoId}
                  item={item}
                  imagemUrl={resolverImagem(item)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyItemsText}>Nenhum produto com estoque registrado.</Text>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COMPANY_COLORS.primary,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flexShrink: 1,
  },
  datePillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#F0E6CC',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateTextCard: {
    color: COMPANY_COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  expandHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  expandHintText: {
    fontSize: 11,
    color: '#999',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    color: COMPANY_COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  actionButtonDangerPressed: {
    opacity: 0.65,
  },
  actionButtonDangerText: {
    color: '#D64545',
    fontWeight: '600',
    fontSize: 13,
  },
  horizontalScroll: {
    marginHorizontal: -2,
  },
  horizontalScrollContent: {
    paddingVertical: 2,
    gap: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  stockItemCardCollapsed: {
    width: 108,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  stockItemCardExpanded: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  expandedThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  stockItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    minHeight: 32,
  },
  stockItemNameExpanded: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    minHeight: 34,
  },
  stockItemPrice: {
    fontSize: 11,
    color: COMPANY_COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  qtyBadge: {
    marginTop: 6,
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#F0E6CC',
  },
  qtyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COMPANY_COLORS.primary,
  },
  stockItemTotal: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  stockItemTotalNumber: {
    color: COMPANY_COLORS.primary,
    fontWeight: '700',
  },
  emptyItemsText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 8,
  },
});
