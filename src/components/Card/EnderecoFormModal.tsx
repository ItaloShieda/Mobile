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
import { criarEndereco, consultarCep, EnderecoEntrega } from '../../services/enderecoService';
import {
  cepValido,
  formatarCepInput,
  normalizarCep,
} from '../../utils/cepUtils';

interface EnderecoFormModalProps {
  visible: boolean;
  empresaId: number;
  isFirstAddress?: boolean;
  onClose: () => void;
  onSaved: (endereco: EnderecoEntrega) => void;
}

const EMPTY = {
  apelido: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export function EnderecoFormModal({
  visible,
  empresaId,
  isFirstAddress = false,
  onClose,
  onSaved,
}: EnderecoFormModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepAviso, setCepAviso] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setForm({
      ...EMPTY,
      apelido: isFirstAddress ? 'Principal' : '',
    });
    setError('');
    setCepAviso('');
  }, [visible, isFirstAddress]);

  const update = (field: keyof typeof EMPTY, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepChange = (value: string) => {
    const formatted = formatarCepInput(value);
    update('cep', formatted);
    setCepAviso('');

    if (cepValido(formatted)) {
      buscarEnderecoPorCep(formatted);
    }
  };

  const buscarEnderecoPorCep = async (cep: string) => {
    setLoadingCep(true);
    setCepAviso('');
    try {
      const dados = await consultarCep(cep);
      if (!dados) {
        setCepAviso('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }
      setForm((prev) => ({
        ...prev,
        cep: normalizarCep(cep),
        logradouro: dados.logradouro || prev.logradouro,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.cidade || prev.cidade,
        uf: dados.uf || prev.uf,
      }));
    } catch {
      setCepAviso('Não foi possível consultar o CEP. Preencha manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSave = async () => {
    setError('');

    if (!form.apelido.trim()) {
      setError('Informe um nome para o endereço (ex.: Casa, Depósito).');
      return;
    }
    if (!cepValido(form.cep)) {
      setError('Informe um CEP válido com 8 números.');
      return;
    }
    if (!form.logradouro.trim() || !form.numero.trim()) {
      setError('Preencha rua e número.');
      return;
    }
    if (!form.bairro.trim() || !form.cidade.trim() || !form.uf.trim()) {
      setError('Preencha bairro, cidade e UF.');
      return;
    }
    if (form.uf.trim().length !== 2) {
      setError('UF deve ter 2 letras (ex.: SP).');
      return;
    }

    setLoading(true);
    try {
      const endereco = await criarEndereco({
        empresaId,
        apelido: form.apelido.trim(),
        cep: normalizarCep(form.cep),
        logradouro: form.logradouro.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim() || undefined,
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        uf: form.uf.trim().toUpperCase(),
        principal: isFirstAddress,
      });
      onSaved(endereco);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar endereço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>
              {isFirstAddress ? 'Cadastrar endereço de entrega' : 'Novo endereço'}
            </Text>
            <Text style={styles.subtitle}>
              Seu endereço ficará salvo para os próximos pedidos.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Nome do endereço</Text>
              <TextInput
                style={styles.input}
                value={form.apelido}
                onChangeText={(v) => update('apelido', v)}
                placeholder="Casa, Depósito, Loja..."
              />

              <Text style={styles.label}>CEP</Text>
              <View style={styles.cepRow}>
                <TextInput
                  style={[styles.input, styles.cepInput]}
                  value={form.cep}
                  onChangeText={handleCepChange}
                  placeholder="00000-000"
                  keyboardType="number-pad"
                  maxLength={9}
                />
                {loadingCep ? (
                  <ActivityIndicator color="#FFAD19" style={styles.cepLoader} />
                ) : null}
              </View>
              {cepAviso ? <Text style={styles.cepAviso}>{cepAviso}</Text> : null}

              <Text style={styles.label}>Rua / Avenida</Text>
              <TextInput
                style={styles.input}
                value={form.logradouro}
                onChangeText={(v) => update('logradouro', v)}
                placeholder="Nome da rua"
              />

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>Número</Text>
                  <TextInput
                    style={styles.input}
                    value={form.numero}
                    onChangeText={(v) => update('numero', v)}
                    placeholder="123"
                  />
                </View>
                <View style={styles.rowItemWide}>
                  <Text style={styles.label}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    value={form.complemento}
                    onChangeText={(v) => update('complemento', v)}
                    placeholder="Apto, galpão..."
                  />
                </View>
              </View>

              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                value={form.bairro}
                onChangeText={(v) => update('bairro', v)}
                placeholder="Bairro"
              />

              <View style={styles.row}>
                <View style={styles.rowItemWide}>
                  <Text style={styles.label}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cidade}
                    onChangeText={(v) => update('cidade', v)}
                    placeholder="Cidade"
                  />
                </View>
                <View style={styles.rowItemNarrow}>
                  <Text style={styles.label}>UF</Text>
                  <TextInput
                    style={styles.input}
                    value={form.uf}
                    onChangeText={(v) => update('uf', v.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

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
                <Text style={styles.saveBtnText}>Salvar endereço</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  cepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cepInput: { flex: 1 },
  cepLoader: { marginRight: 4 },
  cepAviso: { fontSize: 12, color: '#888', marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  rowItem: { flex: 1 },
  rowItemWide: { flex: 2 },
  rowItemNarrow: { flex: 0.7 },
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
