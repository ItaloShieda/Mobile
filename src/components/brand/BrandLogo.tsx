import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

/**
 * Logo oficial da Stock4event (nova identidade visual).
 * - padrao: caixa e "Stock" em azul, para fundos claros
 * - branco: caixa e "Stock" em branco, para fundos azuis
 * - azul:   tudo em azul, para fundos âmbar (telas do cliente)
 */
const LOGOS = {
  padrao: { src: require('../../assets/brand/logo.png'), ratio: 900 / 289 },
  branco: { src: require('../../assets/brand/logo-branco.png'), ratio: 900 / 289 },
  azul: { src: require('../../assets/brand/logo-azul.png'), ratio: 900 / 289 },
  slogan: { src: require('../../assets/brand/logo-horizontal.png'), ratio: 1200 / 385 },
  sloganBranco: { src: require('../../assets/brand/logo-horizontal-branco.png'), ratio: 1200 / 385 },
} as const;

export type BrandLogoVariant = keyof typeof LOGOS;

export function BrandLogo({
  variant = 'padrao',
  height = 28,
  style,
}: {
  variant?: BrandLogoVariant;
  height?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const logo = LOGOS[variant];
  return (
    <Image
      source={logo.src}
      style={[{ height, width: height * logo.ratio }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Stock4event"
    />
  );
}
