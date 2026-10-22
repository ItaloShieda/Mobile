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
  PixSalvo,
  garantirChaveCnpjInicial,
  removerChavePix,
} from '../../services/pixChaveService';
import { labelTipoChavePix } from '../../utils/pixUtils';
import { PixFormModal } from './PixFormModal';
import { IconActionButton } from '../Button/IconActionButton';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';

interface PixCadastradosModalProps {
  visible: boolean;
  empresaId: number;
  cnpjEmpresa?: string;
  onClose: () => void;
}

export function PixCadastradosModal({
  visible,
  empresaId,
  cnpjEmpresa,
  onClose,
}: PixCadastradosModalProps) {
  const [chaves, setChaves] = useState<PixSalvo[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const { confirm } = useConfirmDialog();

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await garantirChaveCnpjInicial(empresaId, cnpjEmpresa);
      setChaves(lista);
    } finally {
      setLoading(false);
    }
  }, [empresaId, cnpjEmpresa]);

  useEffect(() => {
    if (visible) {
      carregar();
    } else {
      setFormVisible(false);
    }
  }, [visible, carregar]);

  const confirmarRemocao = (chave: PixSalvo) => {
    confirm({
      title: 'Remover chave PIX',
      message: `Deseja remover "${chave.apelido}"?`,
      confirmText: 'Remover',
      destructive: true,
      onConfirm: async () => {
        await removerChavePix(empresaId, chave.id);
        await carregar();
      },
    });
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.content}>
            <Text style={styles.title}>Chaves PIX</Text>
            <Text style={styles.subtitle}>
              Dados protegidos — exibimos apenas chaves mascaradas.
            </Text>

            {loading ? (
              <ActivityIndicator color="#FFAD19" style={styles.loader} />
            ) : chaves.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait-outline" size={48} color="#FFAD19" />
                <Text style={styles.emptyTitle}>Nenhuma chave cadastrada</Text>
                <Text style={styles.emptyText}>
                  Adicione uma chave PIX para vincular a esta forma de pagamento.
                </Text>
              </View>
            ) : (
              chaves.map((chave) => (
                <View key={chave.id} style={styles.pixCard}>
                  <View style={styles.pixIconWrap}>
                    <Ionicons name="phone-portrait-outline" size={22} color="#FFAD19" />
                  </View>
                  <View style={styles.pixInfo}>
                    <Text style={styles.pixApelido}>{chave.apelido}</Text>
                    <Text style={styles.pixChave}>{chave.chaveMascarada}</Text>
                    <Text style={styles.pixMeta}>{labelTipoChavePix(chave.tipoChave)}</Text>
                  </View>
                  <IconActionButton
                    name="trash-outline"
                    accessibilityLabel="Remover chave PIX"
                    onPress={() => confirmarRemocao(chave)}
                  />
                </View>
              ))
            )}

            <TouchableOpacity style={styles.addBtn} onPress={() => setFormVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#FFAD19" />
              <Text style={styles.addBtnText}>Adicionar chave PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PixFormModal
        visible={formVisible}
        empresaId={empresaId}
        cnpjEmpresa={cnpjEmpresa}
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
  pixCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  pixIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pixInfo: {
    flex: 1,
  },
  pixApelido: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  pixChave: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  pixMeta: {
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
