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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TipoCartao, salvarCartao } from '../../services/cartaoPagamentoService';
import {
  detectarBandeira,
  extrairUltimosDigitos,
  formatarNumeroCartaoInput,
  formatarValidadeInput,
  formatarCvvInput,
  numeroCartaoValido,
  validadeValida,
  cvvValido,
} from '../../utils/cartaoUtils';

interface CartaoFormModalProps {
  visible: boolean;
  empresaId: number;
  tipo: TipoCartao;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY = {
  apelido: '',
  numero: '',
  validade: '',
  cvv: '',
  titular: '',
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

function LabelObrigatorio({ children }: { children: string }) {
  return (
    <Text style={styles.label}>
      {children} <Text style={styles.obrigatorio}>*</Text>
    </Text>
  );
}

function LabelOpcional({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function CartaoFormModal({
  visible,
  empresaId,
  tipo,
  onClose,
  onSaved,
}: CartaoFormModalProps) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sheetMaxHeight = SCREEN_HEIGHT * 0.92 - insets.top;

  useEffect(() => {
    if (!visible) return;
    setForm(EMPTY);
    setError('');
  }, [visible, tipo]);

  const update = (field: keyof typeof EMPTY, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError('');

    if (!numeroCartaoValido(form.numero)) {
      setError('Número do cartão é obrigatório e deve ser válido.');
      return;
    }
    if (!validadeValida(form.validade)) {
      setError('Validade é obrigatória (formato MM/AA).');
      return;
    }
    if (!form.cvv.trim()) {
      setError('CVV é obrigatório.');
      return;
    }
    if (!cvvValido(form.cvv, form.numero)) {
      const bandeira = detectarBandeira(form.numero);
      setError(
        bandeira === 'Amex'
          ? 'CVV (CID) deve ter 4 dígitos.'
          : 'CVV deve ter 3 dígitos.',
      );
      return;
    }
    if (!form.titular.trim()) {
      setError('Nome do titular é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const ultimosDigitos = extrairUltimosDigitos(form.numero);
      await salvarCartao({
        empresaId,
        apelido: form.apelido.trim() || undefined,
        tipo,
        bandeira: detectarBandeira(form.numero),
        ultimosDigitos,
        validade: form.validade.trim(),
        titular: form.titular.trim(),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão.');
    } finally {
      setLoading(false);
    }
  };

  const titulo = tipo === 'credito' ? 'Novo cartão de crédito' : 'Novo cartão de débito';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Fechar"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.sheetContainer, { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom }]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{titulo}</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            bounces
            nestedScrollEnabled
          >
            <LabelOpcional>Apelido</LabelOpcional>
            <TextInput
              style={styles.input}
              value={form.apelido}
              onChangeText={(v) => update('apelido', v)}
              placeholder="Ex: Cartão principal"
            />

            <LabelObrigatorio>Número do cartão</LabelObrigatorio>
            <TextInput
              style={styles.input}
              value={form.numero}
              onChangeText={(v) => update('numero', formatarNumeroCartaoInput(v))}
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              maxLength={19}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <LabelObrigatorio>Validade</LabelObrigatorio>
                <TextInput
                  style={styles.input}
                  value={form.validade}
                  onChangeText={(v) => update('validade', formatarValidadeInput(v))}
                  placeholder="MM/AA"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.rowItem}>
                <LabelObrigatorio>CVV</LabelObrigatorio>
                <TextInput
                  style={styles.input}
                  value={form.cvv}
                  onChangeText={(v) => update('cvv', formatarCvvInput(v))}
                  placeholder="123"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <LabelObrigatorio>Titular</LabelObrigatorio>
            <TextInput
              style={styles.input}
              value={form.titular}
              onChangeText={(v) => update('titular', v)}
              placeholder="Nome impresso no cartão"
              autoCapitalize="characters"
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
              <Text style={styles.saveBtnText}>Salvar cartão</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  obrigatorio: {
    color: '#D64545',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  errorText: {
    color: '#D64545',
    marginTop: 10,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#FFAD19',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  cancelBtnText: {
    color: '#888',
    fontWeight: '600',
  },
});
