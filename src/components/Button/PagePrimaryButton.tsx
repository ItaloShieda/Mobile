import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PagePrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  light?: boolean;
}

export function PagePrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  style,
  compact = false,
  light = false,
}: PagePrimaryButtonProps) {
  const contentColor = light ? '#FFF' : '#333';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        compact && styles.buttonCompact,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      {icon ? (
        <Ionicons name={icon} size={compact ? 18 : 22} color={contentColor} />
      ) : null}
      <Text style={[styles.label, compact && styles.labelCompact, { color: contentColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFAD19',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 20,
  },
  buttonCompact: {
    gap: 6,
    paddingVertical: 10,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  labelCompact: {
    fontSize: 14,
  },
});
