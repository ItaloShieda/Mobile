import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BrandLogo } from '../brand/BrandLogo';

export function AuthBrand({
  size = 'md',
  align = 'center',
  light = false,
  slogan = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  align?: 'center' | 'left';
  light?: boolean;
  /** Mostra o slogan "Compras e estoque para eventos" abaixo do nome. */
  slogan?: boolean;
}) {
  const height = size === 'lg' ? 64 : size === 'sm' ? 32 : 44;
  const variant = slogan ? (light ? 'sloganBranco' : 'slogan') : light ? 'branco' : 'padrao';

  return (
    <View style={[styles.row, align === 'center' && styles.center]}>
      <BrandLogo variant={variant} height={slogan ? Math.round(height * 1.3) : height} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
  },
});
