import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMPANY_COLORS } from '../../theme/theme';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarModal({ visible, onClose }: CalendarModalProps) {
  const hoje = new Date();
  const [viewMonth, setViewMonth] = useState(hoje.getMonth());
  const [viewYear, setViewYear] = useState(hoje.getFullYear());
  const [selected, setSelected] = useState(hoje);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    return cells;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedLabel = selected.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekday}>{day}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              const isToday = isSameDay(date, hoje);
              const isSelected = isSameDay(date, selected);
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.dayCell,
                    isToday && styles.dayToday,
                    isSelected && styles.daySelected,
                  ]}
                  onPress={() => setSelected(date)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.selectedLabel}>{selectedLabel}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayToday: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primary,
  },
  daySelected: {
    borderRadius: 20,
    backgroundColor: COMPANY_COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextToday: {
    color: COMPANY_COLORS.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
    gap: 10,
  },
  selectedLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  closeBtn: {
    backgroundColor: COMPANY_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
