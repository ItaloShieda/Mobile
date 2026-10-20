import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatarDiaSemana } from '../../utils/dateFormat';
import { CalendarModal } from './CalendarModal';
import { COMPANY_COLORS } from '../../theme/theme';

interface CalendarDatePillProps {
  compact?: boolean;
  style?: ViewStyle;
}

export function CalendarDatePill({ compact, style }: CalendarDatePillProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[compact ? styles.pillCompact : styles.pill, style]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={compact ? styles.textCompact : styles.text}>{formatarDiaSemana()}</Text>
        <Ionicons
          name="calendar-outline"
          size={compact ? 14 : 16}
          color={COMPANY_COLORS.primary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
      <CalendarModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  text: { color: COMPANY_COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  textCompact: { color: COMPANY_COLORS.primary, fontSize: 11, fontWeight: 'bold' },
});
