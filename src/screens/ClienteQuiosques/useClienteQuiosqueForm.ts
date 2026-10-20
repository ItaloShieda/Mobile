import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';
import { useProdutos } from '../../context/ProductsContext';
import { useQuiosques } from '../../context/QuiosqueContext';
import { atualizarProduto } from '../../services/productService';
import { criarQuiosque, atualizarQuiosque, removerQuiosque } from '../../services/barracaService';
import { listarSolicitacoes } from '../../services/marketplaceService';
import type { RootStackParamList } from '../../navigation/types';
import type { Produto } from '../../types/produto';
import type { SolicitacaoCompra } from '../../types/marketplace';
import {
  disponivelParaQuiosque,
  ErrosQuiosqueForm,
  LinhaQuiosqueForm,
  parseNumeroInput,
  precoPagoPorNome,
  validarQuiosqueForm,
} from '../../utils/estoqueQuiosque';

export interface LinhaProdutoView extends LinhaQuiosqueForm {
  produto: Produto;
  precoPago?: number;
}

function formatarPrecoInput(valor: number): string {
  return valor > 0 ? valor.toFixed(2).replace('.', ',') : '';
}

export function useClienteQuiosqueForm() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'ClienteQuiosqueForm'>>();
  const quiosqueId = route.params?.quiosqueId;
  const { user } = useAuth();
  const { confirm } = useConfirmDialog();
  const { produtos, loading: loadingProdutos, refresh: refreshProdutos } = useProdutos();
  const { quiosques, loading: loadingQuiosques, refresh: refreshQuiosques } = useQuiosques();

  const quiosque = quiosqueId ? quiosques.find((q) => q.id === quiosqueId) : undefined;
  const isEditing = !!quiosqueId;

  const [nome, setNome] = useState('');
  const [quantidades, setQuantidades] = useState<Record<number, string>>({});
  const [precos, setPrecos] = useState<Record<number, string>>({});
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompra[]>([]);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const inicializadoRef = useRef(false);

  const produtosCliente = useMemo(
    () =>
      produtos.filter(
        (p) =>
          p.ativo === 1 &&
          ((p.estoque ?? 0) > 0 || quiosque?.itens.some((item) => item.produtoId === p.id)),
      ),
    [produtos, quiosque],
  );

  useEffect(() => {
    if (inicializadoRef.current || loadingProdutos || loadingQuiosques) return;
    if (isEditing && !quiosque) return;

    const qtds: Record<number, string> = {};
    const valores: Record<number, string> = {};
    produtosCliente.forEach((p) => {
      valores[p.id] = formatarPrecoInput(p.precoVenda);
    });
    quiosque?.itens.forEach((item) => {
      qtds[item.produtoId] = String(item.quantidade);
    });

    setNome(quiosque?.nome ?? '');
    setQuantidades(qtds);
    setPrecos(valores);
    inicializadoRef.current = true;
  }, [isEditing, loadingProdutos, loadingQuiosques, produtosCliente, quiosque]);

  useEffect(() => {
    const empresaId = user?.empresa?.id;
    if (!empresaId) return;
    // A referência de preço pago é opcional: falhas aqui não bloqueiam o formulário.
    listarSolicitacoes(empresaId).then(setSolicitacoes).catch(() => setSolicitacoes([]));
  }, [user?.empresa?.id]);

  const linhas: LinhaProdutoView[] = useMemo(
    () =>
      produtosCliente.map((produto) => ({
        produto,
        produtoId: produto.id,
        quantidade: quantidades[produto.id] ?? '',
        precoVenda: precos[produto.id] ?? '',
        disponivel: disponivelParaQuiosque(produto, quiosques, quiosqueId),
        precoPago: precoPagoPorNome(produto.nome, solicitacoes),
      })),
    [produtosCliente, quantidades, precos, quiosques, quiosqueId, solicitacoes],
  );

  const validacao = useMemo(() => validarQuiosqueForm({ nome, linhas }), [nome, linhas]);

  // Erros de linha aparecem na hora; nome e "nenhum produto" só depois de tentar salvar.
  const erros: ErrosQuiosqueForm = tentouSalvar
    ? validacao.erros
    : { linhas: validacao.erros.linhas };
  const temErroLinha = !!validacao.erros.linhas;

  const totais = useMemo(
    () =>
      linhas.reduce(
        (acc, linha) => {
          const qtd = parseNumeroInput(linha.quantidade);
          const preco = parseNumeroInput(linha.precoVenda);
          if (Number.isNaN(qtd) || qtd <= 0) return acc;
          return {
            unidades: acc.unidades + qtd,
            valor: acc.valor + (Number.isNaN(preco) ? 0 : qtd * preco),
          };
        },
        { unidades: 0, valor: 0 },
      ),
    [linhas],
  );

  const setQuantidade = useCallback((produtoId: number, valor: string) => {
    setQuantidades((prev) => ({ ...prev, [produtoId]: valor.replace(/[^\d]/g, '') }));
  }, []);

  const alterarQuantidade = useCallback((produtoId: number, delta: number, maximo: number) => {
    setQuantidades((prev) => {
      const atual = parseNumeroInput(prev[produtoId] ?? '');
      const base = Number.isNaN(atual) ? 0 : atual;
      const novo = Math.min(maximo, Math.max(0, base + delta));
      return { ...prev, [produtoId]: novo > 0 ? String(novo) : '' };
    });
  }, []);

  const setPreco = useCallback((produtoId: number, valor: string) => {
    setPrecos((prev) => ({ ...prev, [produtoId]: valor.replace(/[^\d,.]/g, '') }));
  }, []);

  const salvar = useCallback(async () => {
    setTentouSalvar(true);
    setSaveError('');
    if (!validacao.valido || !user?.empresa?.id) return;

    const empresaId = user.empresa.id;
    const selecionadas = linhas.filter((l) => parseNumeroInput(l.quantidade) > 0);

    setSaving(true);
    try {
      for (const linha of selecionadas) {
        const novoPreco = parseNumeroInput(linha.precoVenda);
        if (Math.abs(novoPreco - linha.produto.precoVenda) < 0.005) continue;
        const { produto } = linha;
        await atualizarProduto(produto.id, {
          nome: produto.nome,
          precoVenda: novoPreco,
          unidade: produto.unidade,
          descricao: produto.descricao,
          imagemUrl: produto.imagemUrl,
          estoque: produto.estoque,
          empresaId: produto.empresaId,
        });
      }

      const payload = {
        nome: nome.trim(),
        empresaId,
        responsavelId: user.id,
        itens: selecionadas.map((l) => ({
          produtoId: l.produtoId,
          quantidade: parseNumeroInput(l.quantidade),
        })),
      };

      if (quiosqueId) {
        await atualizarQuiosque(quiosqueId, payload);
      } else {
        await criarQuiosque(payload);
      }

      await Promise.all([refreshProdutos(), refreshQuiosques()]);
      navigation.navigate('ClienteQuiosques');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Não foi possível salvar o quiosque.');
    } finally {
      setSaving(false);
    }
  }, [linhas, navigation, nome, quiosqueId, refreshProdutos, refreshQuiosques, user, validacao.valido]);

  const excluir = useCallback(() => {
    if (!quiosqueId || !user?.empresa?.id) return;
    const empresaId = user.empresa.id;
    confirm({
      title: 'Excluir quiosque',
      message: `Deseja excluir "${quiosque?.nome ?? 'este quiosque'}"? Os produtos voltam a ficar livres.`,
      confirmText: 'Excluir',
      destructive: true,
      onConfirm: async () => {
        try {
          await removerQuiosque(quiosqueId, empresaId);
          await refreshQuiosques();
          navigation.navigate('ClienteQuiosques');
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : 'Não foi possível excluir o quiosque.');
        }
      },
    });
  }, [confirm, navigation, quiosque?.nome, quiosqueId, refreshQuiosques, user?.empresa?.id]);

  return {
    isEditing,
    quiosqueNaoEncontrado: isEditing && !loadingQuiosques && !quiosque,
    loading: loadingProdutos || loadingQuiosques,
    nome,
    setNome,
    linhas,
    erros,
    temErroLinha,
    totais,
    saving,
    saveError,
    setQuantidade,
    alterarQuantidade,
    setPreco,
    salvar,
    excluir,
  };
}
