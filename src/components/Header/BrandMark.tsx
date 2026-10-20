import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/theme';

/** Logo "Stock4event" para cabeçalhos com fundo escuro. */
export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.quick, { fontSize: size }]}>Stock</Text>
      <Text style={[styles.stock, { fontSize: size }]}>4event</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
  quick: { color: '#FFF', fontWeight: '800' },
  stock: { color: COLORS.primaryGold, fontWeight: '800' },
});
