import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Fornecedor, listarFornecedores } from '../../services/marketplaceService';
import { useBottomTabBarHeight } from '../../components/layout/BottomTabBar';

const DISTANCIAS = ['1,2 km', '2,4 km', '3,1 km', '0,8 km', '4,5 km'];

export function useClienteHome() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const empresaId = user?.empresa?.id;
  const tabBarHeight = useBottomTabBarHeight();

  const [lojas, setLojas] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarLojas = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    try {
      const lista = await listarFornecedores(empresaId);
      setLojas(lista);
    } catch {
      setLojas([]);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useFocusEffect(
    useCallback(() => {
      carregarLojas();
    }, [carregarLojas]),
  );

  const lojasEmDestaque = useMemo(() => lojas.slice(0, 4), [lojas]);

  const distanciaDaLoja = (index: number) => DISTANCIAS[index % DISTANCIAS.length];

  const abrirMarketplace = () => navigation.navigate('Explorar');
  const verTodasDistribuidoras = () => navigation.navigate('ExplorarLista', { tipo: 'distribuidoras' });
  const abrirSacola = () => navigation.navigate('Reservas');
  const abrirPedidos = () => navigation.navigate('Pedidos');

  const abrirLoja = (loja: Fornecedor) => {
    navigation.navigate('StoreVitrine', {
      fornecedorId: loja.id,
      fornecedorNome: loja.nome,
      descricao: loja.descricao,
      logoUrl: loja.logoUrl,
      capaUrl: loja.capaUrl,
      tipo: loja.tipo,
    });
  };

  return {
    lojasEmDestaque,
    loading,
    tabBarHeight,
    distanciaDaLoja,
    abrirMarketplace,
    verTodasDistribuidoras,
    abrirSacola,
    abrirPedidos,
    abrirLoja,
  };
}
