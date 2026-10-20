import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DANGER = '#C62828';

interface Props {
  onPress: () => void;
  loading: boolean;
}

/** Cancelamento pelo comprador, disponível enquanto o pedido não sai para entrega. */
export function CancelarPedidoButton({ onPress, loading }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading} activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={DANGER} />
      ) : (
        <>
          <Ionicons name="close-circle-outline" size={18} color={DANGER} />
          <Text style={styles.text}>Cancelar pedido</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0A3A3',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: DANGER,
    fontWeight: '700',
    fontSize: 14,
  },
});
