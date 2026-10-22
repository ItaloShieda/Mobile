import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { salvarChavePix } from '../../services/pixChaveService';
import {
  TipoChavePix,
  labelTipoChavePix,
  mascararChavePix,
  extrairUltimosDigitosPix,
  validarChavePix,
  formatarChavePixInput,
  placeholderChavePix,
} from '../../utils/pixUtils';

interface PixFormModalProps {
  visible: boolean;
  empresaId: number;
  cnpjEmpresa?: string;
  onClose: () => void;
  onSaved: () => void;
}

const TIPOS_CHAVE: { id: TipoChavePix; label: string }[] = [
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'cpf', label: 'CPF' },
  { id: 'email', label: 'E-mail' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'aleatoria', label: 'Aleatória' },
];

export function PixFormModal({
  visible,
  empresaId,
  cnpjEmpresa,
  onClose,
  onSaved,
}: PixFormModalProps) {
  const [tipoChave, setTipoChave] = useState<TipoChavePix>('cnpj');
  const [apelido, setApelido] = useState('');
  const [chave, setChave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTipoChave('cnpj');
    setApelido('');
    setChave(cnpjEmpresa ? formatarChavePixInput('cnpj', cnpjEmpresa) : '');
    setError('');
  }, [visible, cnpjEmpresa]);

  const handleTipoChange = (tipo: TipoChavePix) => {
    setTipoChave(tipo);
    if (tipo === 'cnpj' && cnpjEmpresa) {
      setChave(formatarChavePixInput('cnpj', cnpjEmpresa));
      if (!apelido.trim()) setApelido('CNPJ da empresa');
    } else {
      setChave('');
    }
  };

  const handleSave = async () => {
    setError('');

    if (!apelido.trim()) {
      setError('Informe um apelido para a chave PIX.');
      return;
    }
    if (!validarChavePix(tipoChave, chave)) {
      setError(`Informe uma chave PIX válida (${labelTipoChavePix(tipoChave)}).`);
      return;
    }

    setLoading(true);
    try {
      await salvarChavePix({
        empresaId,
        apelido: apelido.trim(),
        tipoChave,
        chaveMascarada: mascararChavePix(tipoChave, chave),
        ultimosDigitos: extrairUltimosDigitosPix(tipoChave, chave),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar chave PIX.');
    } finally {
      setLoading(false);
    }
  };

  const teclado =
    tipoChave === 'email' || tipoChave === 'aleatoria' ? 'default' : 'number-pad';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>Nova chave PIX</Text>
            <Text style={styles.subtitle}>
              Apenas a chave mascarada será armazenada no dispositivo.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Tipo de chave</Text>
              <View style={styles.tipoRow}>
                {TIPOS_CHAVE.map((tipo) => {
                  const selected = tipoChave === tipo.id;
                  return (
                    <TouchableOpacity
                      key={tipo.id}
                      style={[styles.tipoChip, selected && styles.tipoChipSelected]}
                      onPress={() => handleTipoChange(tipo.id)}
                    >
                      <Text style={[styles.tipoChipText, selected && styles.tipoChipTextSelected]}>
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Apelido</Text>
              <TextInput
                style={styles.input}
                value={apelido}
                onChangeText={setApelido}
                placeholder="Ex: PIX principal"
              />

              <Text style={styles.label}>Chave PIX</Text>
              <TextInput
                style={styles.input}
                value={chave}
                onChangeText={(v) => setChave(formatarChavePixInput(tipoChave, v))}
                placeholder={placeholderChavePix(tipoChave)}
                keyboardType={teclado}
                autoCapitalize={tipoChave === 'email' ? 'none' : 'sentences'}
                autoCorrect={false}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Salvar chave</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  keyboardWrap: { width: '100%' },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 8 },
  tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFAD19',
    backgroundColor: '#FFF',
  },
  tipoChipSelected: { backgroundColor: '#FFAD19' },
  tipoChipText: { fontSize: 12, fontWeight: '600', color: '#FFAD19' },
  tipoChipTextSelected: { color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  errorText: { color: '#D64545', marginTop: 10, textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#FFAD19',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: '#888', fontWeight: '600' },
});
