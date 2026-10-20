import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AUTH_GOLD, AUTH_NAVY } from '../../theme/authTheme';

export function AuthBrand({
  size = 'md',
  align = 'center',
  light = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  align?: 'center' | 'left';
  light?: boolean;
}) {
  const fontSize = size === 'lg' ? 40 : size === 'sm' ? 22 : 32;
  const quickColor = light ? '#FFF' : AUTH_NAVY;

  return (
    <View style={[styles.row, align === 'center' && styles.center]}>
      <Text style={[styles.quick, { fontSize, color: quickColor }]}>Stock</Text>
      <Text style={[styles.stock, { fontSize }]}>4event</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  center: {
    justifyContent: 'center',
  },
  quick: {
    fontWeight: '800',
  },
  stock: {
    fontWeight: '800',
    color: AUTH_GOLD,
  },
});
