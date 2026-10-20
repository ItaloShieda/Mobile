import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../../../config/api';
import { RemoteImage } from '../../../components/media/RemoteImage';
import { Produto, corEstoque, formatarPreco, formatarQuantidadeEstoque, labelEstoque, normalizarEstoque } from '../../../services/productService';
import { COMPANY_COLORS } from '../../../theme/theme';

interface ProductCardProps { produto: Produto; onPress?: () => void; }

export function ProductStockCard({ produto, onPress }: ProductCardProps) {
  const estoque = normalizarEstoque(produto.estoque);
  const content = <View style={styles.card}>
    <View style={styles.imageBox}>
      <RemoteImage uri={getImageUrl(produto.imagemUrl)} style={styles.image} fallbackLabel={produto.nome} resizeMode="cover" />
      <View style={[styles.stockPill, { backgroundColor: corEstoque(estoque) }]}><Text style={styles.stockText}>{estoque <= 0 ? 'Esgotado' : formatarQuantidadeEstoque(produto)}</Text></View>
    </View>
    <Text style={styles.price}>{formatarPreco(produto.precoVenda)}</Text>
    <Text style={styles.name} numberOfLines={2}>{produto.nome}</Text>
    <Text style={styles.code}>{produto.codigo ? `ID ${produto.codigo}` : `#${produto.id}`}</Text>
    <Text style={[styles.hint, { color: corEstoque(estoque) }]}>{labelEstoque(estoque)}</Text>
  </View>;
  return onPress ? <TouchableOpacity activeOpacity={0.85} onPress={onPress}>{content}</TouchableOpacity> : content;
}

export function ProductHorizontalCard({ produto, subtitle, onPress }: { produto: Produto; subtitle?: string; onPress?: () => void }) {
  return <TouchableOpacity style={styles.horizontal} activeOpacity={0.85} onPress={onPress} disabled={!onPress}>
    <RemoteImage uri={getImageUrl(produto.imagemUrl)} style={styles.horizontalImage} fallbackLabel={produto.nome} resizeMode="cover" />
    <View><Text style={styles.horizontalTitle} numberOfLines={2}>{produto.nome}</Text><Text style={styles.horizontalSubtitle}>{subtitle ?? formatarPreco(produto.precoVenda)}</Text></View>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    marginRight: 12,
    backgroundColor: COMPANY_COLORS.primarySoft,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
  },
  imageBox: {
    width: '100%',
    height: 108,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  stockPill: { position: 'absolute', bottom: 6, left: 6, right: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  stockText: { color: '#FFF', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  price: { fontSize: 15, fontWeight: '800', color: COMPANY_COLORS.primary },
  name: { fontSize: 12, fontWeight: '700', color: '#333', marginTop: 4, minHeight: 32 },
  code: { fontSize: 10, color: '#888', fontWeight: '600', marginTop: 2 },
  hint: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  horizontal: { width: 160, backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: COMPANY_COLORS.primaryBorder },
  horizontalImage: { width: '100%', height: 80, borderRadius: 12, marginBottom: 8, backgroundColor: '#F5F5F5' },
  horizontalTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  horizontalSubtitle: { fontSize: 12, color: COMPANY_COLORS.primary, fontWeight: '600', marginTop: 4 },
});
