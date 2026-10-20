import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/theme';

/** Logo "QuickStock" para cabeçalhos com fundo escuro. */
export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.quick, { fontSize: size }]}>Quick</Text>
      <Text style={[styles.stock, { fontSize: size }]}>Stock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
  quick: { color: '#FFF', fontWeight: '800' },
  stock: { color: COLORS.primaryGold, fontWeight: '800' },
});
