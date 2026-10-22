import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const confirm = useCallback((options: ConfirmOptions) => {
    setActionError('');
    setConfig(options);
  }, []);

  const close = useCallback(() => {
    if (!loading) setConfig(null);
  }, [loading]);

  const handleConfirm = useCallback(async () => {
    if (!config || loading) return;
    setLoading(true);
    try {
      await config.onConfirm();
      setConfig(null);
      setActionError('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível concluir a ação.');
    } finally {
      setLoading(false);
    }
  }, [config, loading]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <Modal visible={!!config} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{config?.title}</Text>
            <Text style={styles.message}>{config?.message}</Text>
            {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancel} onPress={close} disabled={loading}>
                <Text style={styles.cancelText}>{config?.cancelText ?? 'Cancelar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirm, config?.destructive && styles.destructive]}
                onPress={() => void handleConfirm()}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.confirmText}>{config?.confirmText ?? 'Confirmar'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error('useConfirmDialog deve ser usado dentro de ConfirmDialogProvider.');
  return context;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 340, backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 20 },
  error: { color: '#D64545', fontSize: 13, marginTop: -12, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  cancel: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  confirm: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFAD19', alignItems: 'center' },
  destructive: { backgroundColor: '#D64545' },
  confirmText: { color: '#FFF', fontWeight: '700' },
});