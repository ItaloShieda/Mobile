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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getImageUrl } from '../../../config/api';
import { RemoteImage } from '../../../components/media/RemoteImage';
import { useProdutos } from '../../../context/ProductsContext';
import { COMPANY_COLORS } from '../../../theme/theme';
import {
  Quiosque,
  QuiosquePayload,
  atualizarQuiosque,
  criarQuiosque,
} from '../../../services/barracaService';

interface BarracaFormModalProps {
  visible: boolean;
  empresaId: number;
  responsavelId: number;
  quiosque?: Quiosque | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BarracaFormModal({
  visible,
  empresaId,
  responsavelId,
  quiosque,
  onClose,
  onSaved,
}: BarracaFormModalProps) {
  const isEditing = !!quiosque;
  const { produtos } = useProdutos();

  const [nome, setNome] = useState('');
  const [quantidades, setQuantidades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;

    setNome(quiosque?.nome ?? '');
    const initial: Record<number, string> = {};
    quiosque?.itens.forEach((item) => {
      initial[item.produtoId] = String(item.quantidade);
    });
    setQuantidades(initial);
    setError('');
  }, [visible, quiosque]);

  const handleSave = async () => {
    setError('');

    if (!nome.trim()) {
      setError('Informe o nome do quiosque.');
      return;
    }

    const itens = Object.entries(quantidades)
      .filter(([, qty]) => qty.trim() !== '')
      .map(([produtoId, qty]) => ({
        produtoId: Number(produtoId),
        quantidade: Number(qty.replace(',', '.')),
      }))
      .filter((item) => !Number.isNaN(item.quantidade) && item.quantidade >= 0);

    const payload: QuiosquePayload = {
      nome: nome.trim(),
      empresaId: Number(empresaId),
      responsavelId: Number(responsavelId),
      itens,
    };

    setLoading(true);
    try {
      if (isEditing && quiosque) {
        await atualizarQuiosque(quiosque.id, payload);
      } else {
        await criarQuiosque(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar quiosque.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Editar Quiosque' : 'Novo Quiosque'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nome do Quiosque</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: barr Shopping"
            />

            <Text style={styles.sectionTitle}>Estoque por produto</Text>
            {produtos.length === 0 ? (
              <Text style={styles.hintText}>
                Cadastre produtos pelo botão + antes de registrar estoque.
              </Text>
            ) : (
              produtos.map((produto) => (
                <View key={produto.id} style={styles.productRow}>
                  <RemoteImage
                    uri={getImageUrl(produto.imagemUrl)}
                    style={styles.productThumb}
                    fallbackLabel={produto.nome}
                    resizeMode="cover"
                  />
                  <Text style={styles.productName} numberOfLines={2}>
                    {produto.nome}
                  </Text>
                  <TextInput
                    style={styles.qtyInput}
                    value={quantidades[produto.id] ?? ''}
                    onChangeText={(text) =>
                      setQuantidades((prev) => ({ ...prev, [produto.id]: text }))
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitLabel}>{produto.unidade}</Text>
                </View>
              ))
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Salvar alterações' : 'Cadastrar Quiosque'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  hintText: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  qtyInput: {
    width: 72,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  unitLabel: {
    width: 36,
    fontSize: 12,
    color: '#888',
  },
  errorText: {
    color: '#D64545',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COMPANY_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
