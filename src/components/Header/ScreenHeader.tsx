import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { HamburgerButton } from './HamburgerButton';
import { HeaderActions } from './HeaderActions';
import { BrandMark } from './BrandMark';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { COMPANY_COLORS } from '../../theme/theme';

interface ScreenHeaderProps {
  /** Nome exibido na saudação "Olá, {name}!" (tela inicial). */
  name?: string;
  /** Texto de apoio abaixo da saudação. */
  greeting?: string;
  showGreeting?: boolean;
  showCartBadge?: boolean;
  cartItemCount?: number;
  onCartPress?: () => void;
  title?: string;
  subtitle?: string;
  /** Ação extra à direita, antes do sino (ex.: botão "Gráficos"). */
  rightSlot?: React.ReactNode;
  /** Aumenta o espaço inferior para o primeiro card "subir" sobre o cabeçalho. */
  overlap?: boolean;
  /** Padding horizontal do contêiner pai, compensado para o cabeçalho ocupar a largura toda. */
  inset?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/** Cabeçalho das abas do fornecedor, com o mesmo layout das abas do cliente. */
export function ScreenHeader({
  name,
  greeting,
  showGreeting = false,
  showCartBadge,
  cartItemCount,
  onCartPress,
  title,
  subtitle,
  rightSlot,
  overlap = false,
  inset = 0,
  children,
  style,
}: ScreenHeaderProps) {
  const topPadding = useHeaderTopPadding(8);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPadding, marginHorizontal: -inset },
        overlap && styles.overlap,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <HamburgerButton />
          <BrandMark size={22} />
        </View>
        <View style={styles.rightGroup}>
          {rightSlot}
          <HeaderActions
            showCartBadge={showCartBadge}
            cartItemCount={cartItemCount}
            onCartPress={onCartPress}
          />
        </View>
      </View>

      {showGreeting ? (
        <>
          <Text style={styles.greeting} numberOfLines={2}>Olá, {name ?? 'Usuário'}!</Text>
          {greeting ? <Text style={styles.subtitle}>{greeting}</Text> : null}
        </>
      ) : null}

      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COMPANY_COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  overlap: {
    paddingBottom: 88,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 22,
  },
});
