import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BackButton, BACK_BUTTON_SIZE, backButtonSpacerStyle } from './BackButton';
import { BrandMark } from './BrandMark';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { COMPANY_COLORS } from '../../theme/theme';

interface BackTitleHeaderProps {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
  /** Padding horizontal do contêiner pai, compensado para o cabeçalho ocupar a largura toda. */
  inset?: number;
  style?: ViewStyle;
}

/** Cabeçalho sólido com voltar, no mesmo layout das telas internas do cliente. */
export function BackTitleHeader({
  title,
  onBack,
  rightSlot,
  inset = 16,
  style,
}: BackTitleHeaderProps) {
  const topPadding = useHeaderTopPadding(8);

  return (
    <View style={[styles.container, { paddingTop: topPadding, marginHorizontal: -inset }, style]}>
      <View style={styles.row}>
        <BackButton onPress={onBack} />
        <View style={styles.brand}>
          <BrandMark />
        </View>
        {rightSlot ?? <View style={backButtonSpacerStyle} />}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COMPANY_COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: BACK_BUTTON_SIZE,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 8,
  },
});
