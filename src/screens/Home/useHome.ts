import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useProdutos } from '../../context/ProductsContext';
import {
  formatarPreco,
  normalizarEstoque,
  Produto,
} from '../../services/productService';
import {
  buscarResumoFinanceiro,
  extrairTotaisFinanceiros,
  FinanceiroResumo,
} from '../../services/financeiroService';
import { useTabBarScrollPadding } from '../../components/layout/BottomTabBar';

export function useHome() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { produtos, loading, refresh } = useProdutos();
  const empresaId = user?.empresa?.id;

  const [resumoFinanceiro, setResumoFinanceiro] = useState<FinanceiroResumo | null>(null);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);

  const carregarFinanceiro = useCallback(async () => {
    if (!empresaId) return;
    setLoadingFinanceiro(true);
    try {
      const data = await buscarResumoFinanceiro(empresaId);
      setResumoFinanceiro(data);
    } catch {
      setResumoFinanceiro(null);
    } finally {
      setLoadingFinanceiro(false);
    }
  }, [empresaId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      carregarFinanceiro();
    }, [refresh, carregarFinanceiro]),
  );

  const totalCatalogo = produtos.length;
  const valorCatalogo = produtos.reduce((acc, item) => acc + item.precoVenda, 0);
  const totalUnidadesEstoque = produtos.reduce(
    (acc, item) => acc + normalizarEstoque(item.estoque),
    0,
  );

  const abrirDetalheProduto = useCallback(
    (produto: Produto) => {
      navigation.navigate('ProductDetail', {
        produtoId: produto.id,
        fornecedorId: user?.empresa?.id,
        fornecedorNome: user?.empresa?.nome ?? 'Minha empresa',
        productName: produto.nome,
        price: formatarPreco(produto.precoVenda),
        precoVenda: produto.precoVenda,
        descricao: produto.descricao,
        imagemUrl: produto.imagemUrl,
        unidade: produto.unidade,
        estoque: produto.estoque,
        codigo: produto.codigo,
        origem: 'catalogo',
      });
    },
    [navigation, user?.empresa?.id, user?.empresa?.nome],
  );

  const { totalCompras, totalVendas, lucroTotal, margemPercentual } = useMemo(
    () => extrairTotaisFinanceiros(resumoFinanceiro),
    [resumoFinanceiro],
  );

  const quickActions: {
    title: string;
    icon: 'cash-outline' | 'bus-outline' | 'person-add-outline' | 'cube-outline';
    screen: string;
    subtitle?: string;
  }[] = [
    { title: 'Vendas', subtitle: 'Resumo e pedidos', icon: 'cash-outline' as const, screen: 'EmpresaVendas' },
    { title: 'Caminhoneiros', subtitle: 'Sua frota', icon: 'bus-outline' as const, screen: 'Camioneiros' },
    { title: 'Cadastro', subtitle: 'Novo motorista', icon: 'person-add-outline' as const, screen: 'CadastroCamioneiros' },
    { title: 'Logística', subtitle: 'Status das entregas', icon: 'cube-outline' as const, screen: 'Logistica' },
  ];

  const scrollBottomPadding = useTabBarScrollPadding();

  return {
    navigation,
    user,
    produtos,
    loading,
    resumoFinanceiro,
    loadingFinanceiro,
    totalCatalogo,
    valorCatalogo,
    totalUnidadesEstoque,
    abrirDetalheProduto,
    totalCompras,
    totalVendas,
    lucroTotal,
    margemPercentual,
    quickActions,
    scrollBottomPadding,
  };
}
