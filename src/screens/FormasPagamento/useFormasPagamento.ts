import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';
import { TipoCartao } from '../../services/cartaoPagamentoService';
import {
  FormaPagamentoSalva,
  TipoPagamento,
  criarFormaPagamento,
  definirFormaPagamentoPrincipal,
  listarFormasPagamento,
  removerFormaPagamento,
} from '../../services/formaPagamentoService';
import { isTipoCartao } from './formasHelpers';

export function useFormasPagamento() {

  const { user } = useAuth();
  const empresaId = user?.empresa?.id;
  const cnpjEmpresa = user?.empresa?.cnpj;
  const { confirm } = useConfirmDialog();

  const [formas, setFormas] = useState<FormaPagamentoSalva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPagamento>('pix');
  const [apelido, setApelido] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [modalErro, setModalErro] = useState('');
  const [cartoesModalVisible, setCartoesModalVisible] = useState(false);
  const [cartoesModalTipo, setCartoesModalTipo] = useState<TipoCartao>('credito');
  const [pixModalVisible, setPixModalVisible] = useState(false);

  const carregar = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    setError('');
    try {
      const lista = await listarFormasPagamento(empresaId);
      setFormas(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar formas de pagamento.');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const abrirModal = () => {
    setTipoSelecionado('pix');
    setApelido('');
    setModalErro('');
    setModalVisible(true);
  };

  const abrirCartoes = (tipo: TipoCartao) => {
    setCartoesModalTipo(tipo);
    setCartoesModalVisible(true);
  };

  const abrirPix = () => {
    setPixModalVisible(true);
  };

  const handlePressForma = (forma: FormaPagamentoSalva) => {
    if (forma.tipo === 'pix') {
      abrirPix();
      return;
    }
    if (isTipoCartao(forma.tipo)) {
      abrirCartoes(forma.tipo);
    }
  };

  const handleSelecionarTipo = (tipo: TipoPagamento) => {
    setTipoSelecionado(tipo);
  };

  const handleSalvar = async () => {
    if (!empresaId) return;

    const apelidoTrim = apelido.trim();
    if (!apelidoTrim) {
      setModalErro('Informe um apelido para a forma de pagamento.');
      return;
    }

    setSalvando(true);
    setModalErro('');
    try {
      await criarFormaPagamento({
        empresaId,
        tipo: tipoSelecionado,
        apelido: apelidoTrim,
      });
      setModalVisible(false);
      await carregar();
    } catch (err) {
      setModalErro(err instanceof Error ? err.message : 'Erro ao salvar forma de pagamento.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarRemocao = (forma: FormaPagamentoSalva) => {
    if (!empresaId) return;

    confirm({
      title: 'Remover forma de pagamento',
      message: `Deseja remover "${forma.apelido}"?`,
      confirmText: 'Remover',
      destructive: true,
      onConfirm: async () => {
        await removerFormaPagamento(forma.id, empresaId);
        await carregar();
      },
    });
  };

  const tornarPrincipal = async (forma: FormaPagamentoSalva) => {
    if (!empresaId || forma.principal) return;
    try {
      await definirFormaPagamentoPrincipal(forma.id, empresaId);
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao definir a forma principal.');
    }
  };

  return {
    user,
    empresaId,
    cnpjEmpresa,
    formas,
    loading,
    error,
    modalVisible,
    setModalVisible,
    tipoSelecionado,
    apelido,
    setApelido,
    salvando,
    modalErro,
    cartoesModalVisible,
    setCartoesModalVisible,
    cartoesModalTipo,
    pixModalVisible,
    setPixModalVisible,
    carregar,
    abrirModal,
    abrirPix,
    abrirCartoes,
    handlePressForma,
    handleSelecionarTipo,
    handleSalvar,
    confirmarRemocao,
    tornarPrincipal,
  };
}
