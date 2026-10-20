import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMPANY_COLORS } from '../../theme/theme';

export const BACK_BUTTON_SIZE = 32;
export const CHEVRON_SIZE = 18;

interface BackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  iconColor?: string;
}

export function BackButton({
  onPress,
  style,
  accessibilityLabel = 'Voltar',
  iconColor = COMPANY_COLORS.primary,
}: BackButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="chevron-back" size={CHEVRON_SIZE} color={iconColor} />
    </TouchableOpacity>
  );
}

export const backButtonSpacerStyle = {
  width: BACK_BUTTON_SIZE + 2,
  height: BACK_BUTTON_SIZE,
} as const;

const styles = StyleSheet.create({
  button: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: BACK_BUTTON_SIZE / 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
});
