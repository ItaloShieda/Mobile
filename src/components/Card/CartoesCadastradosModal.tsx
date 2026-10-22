import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CartaoSalvo,
  TipoCartao,
  labelCartao,
  listarCartoesPorTipo,
  removerCartao,
} from '../../services/cartaoPagamentoService';
import { formatarCartaoExibicao } from '../../utils/cartaoUtils';
import { CartaoFormModal } from './CartaoFormModal';
import { IconActionButton } from '../Button/IconActionButton';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';

interface CartoesCadastradosModalProps {
  visible: boolean;
  empresaId: number;
  tipo: TipoCartao;
  onClose: () => void;
}

export function CartoesCadastradosModal({
  visible,
  empresaId,
  tipo,
  onClose,
}: CartoesCadastradosModalProps) {
  const [cartoes, setCartoes] = useState<CartaoSalvo[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const { confirm } = useConfirmDialog();

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await listarCartoesPorTipo(empresaId, tipo);
      setCartoes(lista);
    } finally {
      setLoading(false);
    }
  }, [empresaId, tipo]);

  useEffect(() => {
    if (visible) {
      carregar();
    } else {
      setFormVisible(false);
    }
  }, [visible, carregar]);

  const confirmarRemocao = (cartao: CartaoSalvo) => {
    confirm({
      title: 'Remover cartão',
      message: `Deseja remover "${labelCartao(cartao)}"?`,
      confirmText: 'Remover',
      destructive: true,
      onConfirm: async () => {
        await removerCartao(empresaId, cartao.id);
        await carregar();
      },
    });
  };

  const titulo = tipo === 'credito' ? 'Cartões de crédito' : 'Cartões de débito';

  return (
    <>
      <Modal visible={visible && !formVisible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.content}>
            <Text style={styles.title}>{titulo}</Text>
            <Text style={styles.subtitle}>
              Número completo e CVV não são armazenados.
            </Text>

            {loading ? (
              <ActivityIndicator color="#FFAD19" style={styles.loader} />
            ) : cartoes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#FFAD19" />
                <Text style={styles.emptyTitle}>Nenhum cartão cadastrado</Text>
                <Text style={styles.emptyText}>
                  Adicione um cartão para vincular a esta forma de pagamento.
                </Text>
              </View>
            ) : (
              cartoes.map((cartao) => (
                <View key={cartao.id} style={styles.cartaoCard}>
                  <View style={styles.cartaoIconWrap}>
                    <Ionicons name="card-outline" size={22} color="#FFAD19" />
                  </View>
                  <View style={styles.cartaoInfo}>
                    <Text style={styles.cartaoApelido}>{labelCartao(cartao)}</Text>
                    <Text style={styles.cartaoNumero}>
                      {cartao.numeroMascarado || formatarCartaoExibicao(cartao.ultimosDigitos)}
                    </Text>
                    <Text style={styles.cartaoMeta}>
                      {cartao.bandeira} · {cartao.titular} · Val. {cartao.validade}
                    </Text>
                  </View>
                  <IconActionButton
                    name="trash-outline"
                    accessibilityLabel="Remover cartão"
                    onPress={() => confirmarRemocao(cartao)}
                  />
                </View>
              ))
            )}

            <TouchableOpacity style={styles.addBtn} onPress={() => setFormVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#FFAD19" />
              <Text style={styles.addBtnText}>Adicionar cartão</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CartaoFormModal
        visible={formVisible}
        empresaId={empresaId}
        tipo={tipo}
        onClose={() => setFormVisible(false)}
        onSaved={carregar}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '80%',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  cartaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  cartaoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartaoInfo: {
    flex: 1,
  },
  cartaoApelido: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  cartaoNumero: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  cartaoMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFAD19',
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFAD19',
    fontWeight: '700',
    fontSize: 14,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  closeBtnText: {
    color: '#888',
    fontWeight: '600',
  },
});
