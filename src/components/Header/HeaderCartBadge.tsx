import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACK_BUTTON_SIZE } from './BackButton';
import { COMPANY_COLORS } from '../../theme/theme';

interface HeaderCartBadgeProps {
  itemCount: number;
  onPress: () => void;
}

export function HeaderCartBadge({ itemCount, onPress }: HeaderCartBadgeProps) {
  if (itemCount <= 0) return null;

  return (
    <TouchableOpacity style={styles.cartBadge} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="cart" size={18} color="#FFF" />
      <Text style={styles.cartBadgeText}>{itemCount}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COMPANY_COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    minHeight: BACK_BUTTON_SIZE,
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
