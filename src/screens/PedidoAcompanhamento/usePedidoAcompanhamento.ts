import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { useAuth } from '../../context/AuthContext';
import { useProdutos } from '../../context/ProductsContext';
import {
  SolicitacaoCompra,
  buscarSolicitacao,
  cancelarSolicitacao,
  calcularProgressoPedido,
  obterPrevisaoEntrega,
  labelStatusPedido,
} from '../../services/marketplaceService';
import {
  ETAPAS_PADRAO,
  ACCENT,
  POLL_INTERVAL_MS,
  SUCCESS,
  SUCCESS_LIGHT,
} from './components/PedidoParts';
import { COMPANY_COLORS } from '../../theme/theme';

export function usePedidoAcompanhamento() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, perfilUso } = useAuth();
  const goBack = useAppGoBack(perfilUso === 'Cliente' ? 'Pedidos' : 'Cart');
  const { refresh: refreshProdutos } = useProdutos();

  const pedidosIds: number[] = route.params?.pedidosIds ?? [route.params?.pedidoId];
  const [pedidoAtivoId, setPedidoAtivoId] = useState<number>(route.params?.pedidoId);
  const pedidoInicial: SolicitacaoCompra | undefined =
    route.params?.pedidoInicial?.id === pedidoAtivoId ? route.params.pedidoInicial : undefined;

  const [pedido, setPedido] = useState<SolicitacaoCompra | null>(pedidoInicial ?? null);
  const [loading, setLoading] = useState(!pedidoInicial);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const entregueCreditadoRef = useRef(false);

  const carregarPedido = useCallback(async (silencioso = false) => {
    if (!user?.empresa?.id || !pedidoAtivoId) return;

    if (!silencioso) setLoading(true);
    setError('');

    try {
      const dados = await buscarSolicitacao(pedidoAtivoId, user.empresa.id);
      setPedido(dados);
      if (dados.status === 'entregue' && !entregueCreditadoRef.current) {
        entregueCreditadoRef.current = true;
        await refreshProdutos();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedido.');
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, [pedidoAtivoId, refreshProdutos, user?.empresa?.id]);

  useEffect(() => {
    setPedido(null);
    setLoading(true);
    carregarPedido(false);
  }, [carregarPedido, pedidoAtivoId]);

  useEffect(() => {
    if (!pedidoAtivoId || !user?.empresa?.id) return;

    pollRef.current = setInterval(() => {
      carregarPedido(true);
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [carregarPedido, pedidoAtivoId, user?.empresa?.id]);

  const [cancelando, setCancelando] = useState(false);
  const podeCancelar = pedido?.status === 'aguardando_liberacao';

  const confirmarCancelamento = useCallback(() => {
    if (!pedido || !user?.empresa?.id) return;
    const empresaId = user.empresa.id;
    Alert.alert('Cancelar pedido', `Cancelar o pedido #${pedido.id}?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar pedido',
        style: 'destructive',
        onPress: async () => {
          setCancelando(true);
          try {
            setPedido(await cancelarSolicitacao(pedido.id, empresaId));
          } catch (err) {
            Alert.alert('Pedido', err instanceof Error ? err.message : 'Não foi possível cancelar o pedido.');
          } finally {
            setCancelando(false);
          }
        },
      },
    ]);
  }, [pedido, user?.empresa?.id]);

  const etapas = pedido?.etapas?.length ? pedido.etapas : ETAPAS_PADRAO;
  const previsaoLabel = pedido ? obterPrevisaoEntrega(pedido) : '';
  const progresso = pedido ? calcularProgressoPedido(pedido) : 0.25;
  const entregue = pedido?.status === 'entregue';
  const emRota = pedido?.status === 'em_rota';
  const headerTitle = entregue ? 'Compra realizada' : 'Acompanhar pedido';

  const tituloHero = useMemo(() => {
    if (!pedido) return 'Acompanhar pedido';
    if (pedido.status === 'cancelada') return 'Pedido cancelado';
    if (entregue) return 'Entrega concluída';
    if (emRota) return 'Pedido a caminho';
    return 'Preparando seu pedido';
  }, [pedido, entregue, emRota]);

  const subtituloHero = useMemo(() => {
    if (!pedido) return '';
    if (entregue) {
      return `Seus produtos de ${pedido.fornecedorNome} já estão no seu estoque.`;
    }
    return labelStatusPedido(pedido.status);
  }, [pedido, entregue]);

  const heroIcon = useMemo<{
    name: 'check-decagram' | 'truck-fast' | 'timer-outline';
    color: string;
    bg: string;
  }>(() => {
    if (entregue) return { name: 'check-decagram', color: SUCCESS, bg: SUCCESS_LIGHT };
    if (emRota) return { name: 'truck-fast', color: ACCENT, bg: COMPANY_COLORS.primarySoft };
    return { name: 'timer-outline', color: ACCENT, bg: COMPANY_COLORS.primarySoft };
  }, [entregue, emRota]);

  return {
    navigation,
    goBack,
    pedidosIds,
    pedidoAtivoId,
    setPedidoAtivoId,
    pedido,
    loading,
    error,
    carregarPedido,
    etapas,
    previsaoLabel,
    progresso,
    entregue,
    headerTitle,
    tituloHero,
    subtituloHero,
    heroIcon,
    ACCENT,
    perfilUso,
    podeCancelar,
    cancelando,
    confirmarCancelamento,
  };
}
