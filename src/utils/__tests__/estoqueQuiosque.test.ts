import {
  disponivelParaQuiosque,
  precoPagoPorNome,
  quantidadeAlocada,
  quiosqueExcedeEstoque,
  resumoEstoque,
  validarQuiosqueForm,
} from '../estoqueQuiosque';
import type { Produto } from '../../types/produto';
import type { Quiosque } from '../../types/quiosque';
import type { SolicitacaoCompra } from '../../types/marketplace';

function produto(id: number, estoque: number, nome = `Produto ${id}`): Produto {
  return { id, empresaId: 1, nome, precoVenda: 5, unidade: 'un', ativo: 1, estoque };
}

function quiosque(id: number, itens: { produtoId: number; quantidade: number }[]): Quiosque {
  return {
    id,
    nome: `Quiosque ${id}`,
    eventoId: 0,
    eventoNome: '',
    ativa: 1,
    totalProdutos: itens.length,
    totalUnidades: itens.reduce((acc, item) => acc + item.quantidade, 0),
    itens: itens.map((item) => ({ ...item, nome: '', unidade: 'un', precoVenda: 5 })),
  };
}

function solicitacao(
  id: number,
  status: string,
  criadoEm: string,
  itens: { nome: string; precoUnitario: number }[],
): SolicitacaoCompra {
  return {
    id,
    fornecedorId: 1,
    fornecedorNome: 'Fornecedor',
    status,
    valorTotal: 0,
    criadoEm,
    itens: itens.map((item, index) => ({
      produtoId: index + 1,
      nome: item.nome,
      unidade: 'un',
      quantidade: 1,
      precoUnitario: item.precoUnitario,
      subtotal: item.precoUnitario,
    })),
  };
}

describe('quantidadeAlocada', () => {
  const quiosques = [
    quiosque(1, [{ produtoId: 10, quantidade: 30 }]),
    quiosque(2, [{ produtoId: 10, quantidade: 20 }, { produtoId: 11, quantidade: 5 }]),
  ];

  it('soma o produto em todos os quiosques', () => {
    expect(quantidadeAlocada(10, quiosques)).toBe(50);
  });

  it('ignora o quiosque em edição', () => {
    expect(quantidadeAlocada(10, quiosques, 1)).toBe(20);
  });
});

describe('disponivelParaQuiosque', () => {
  const quiosques = [
    quiosque(1, [{ produtoId: 10, quantidade: 30 }]),
    quiosque(2, [{ produtoId: 10, quantidade: 20 }]),
  ];

  it('desconta o que já está em outros quiosques', () => {
    expect(disponivelParaQuiosque(produto(10, 100), quiosques)).toBe(50);
  });

  it('não desconta o próprio quiosque em edição', () => {
    expect(disponivelParaQuiosque(produto(10, 100), quiosques, 2)).toBe(70);
  });

  it('nunca fica negativo', () => {
    expect(disponivelParaQuiosque(produto(10, 40), quiosques)).toBe(0);
  });

  it('trata estoque ausente como zero', () => {
    expect(disponivelParaQuiosque({ ...produto(10, 0), estoque: undefined }, [])).toBe(0);
  });
});

describe('resumoEstoque', () => {
  it('calcula comprado, alocado e livre', () => {
    const produtos = [produto(10, 100), produto(11, 50)];
    const quiosques = [quiosque(1, [{ produtoId: 10, quantidade: 30 }, { produtoId: 11, quantidade: 10 }])];
    expect(resumoEstoque(produtos, quiosques)).toEqual({ comprado: 150, alocado: 40, livre: 110 });
  });

  it('livre nunca fica negativo', () => {
    const quiosques = [quiosque(1, [{ produtoId: 10, quantidade: 80 }])];
    expect(resumoEstoque([produto(10, 50)], quiosques).livre).toBe(0);
  });
});

describe('quiosqueExcedeEstoque', () => {
  it('é falso quando cabe no estoque', () => {
    const quiosques = [
      quiosque(1, [{ produtoId: 10, quantidade: 60 }]),
      quiosque(2, [{ produtoId: 10, quantidade: 40 }]),
    ];
    expect(quiosqueExcedeEstoque(quiosques[0], [produto(10, 100)], quiosques)).toBe(false);
  });

  it('é verdadeiro quando a soma passa do estoque', () => {
    const quiosques = [
      quiosque(1, [{ produtoId: 10, quantidade: 70 }]),
      quiosque(2, [{ produtoId: 10, quantidade: 40 }]),
    ];
    expect(quiosqueExcedeEstoque(quiosques[0], [produto(10, 100)], quiosques)).toBe(true);
  });

  it('é verdadeiro quando o produto não existe mais', () => {
    const quiosques = [quiosque(1, [{ produtoId: 99, quantidade: 1 }])];
    expect(quiosqueExcedeEstoque(quiosques[0], [], quiosques)).toBe(true);
  });
});

describe('validarQuiosqueForm', () => {
  const linhaOk = { produtoId: 10, quantidade: '10', precoVenda: '7,50', disponivel: 20 };

  it('aceita um formulário válido', () => {
    expect(validarQuiosqueForm({ nome: 'Barraca 1', linhas: [linhaOk] })).toEqual({ valido: true, erros: {} });
  });

  it('exige nome', () => {
    const r = validarQuiosqueForm({ nome: '  ', linhas: [linhaOk] });
    expect(r.valido).toBe(false);
    expect(r.erros.nome).toBe('Informe o nome do quiosque.');
  });

  it('exige ao menos um produto com quantidade', () => {
    const r = validarQuiosqueForm({ nome: 'Barraca', linhas: [{ ...linhaOk, quantidade: '' }] });
    expect(r.valido).toBe(false);
    expect(r.erros.geral).toBe('Adicione ao menos um produto ao quiosque.');
  });

  it('bloqueia quantidade acima do disponível', () => {
    const r = validarQuiosqueForm({ nome: 'Barraca', linhas: [{ ...linhaOk, quantidade: '21' }] });
    expect(r.erros.linhas?.[10]?.quantidade).toBe('Máximo 20 un. disponíveis.');
  });

  it('bloqueia quantidade inválida', () => {
    const r = validarQuiosqueForm({ nome: 'Barraca', linhas: [{ ...linhaOk, quantidade: 'abc' }, linhaOk] });
    expect(r.erros.linhas?.[10]?.quantidade).toBe('Quantidade inválida.');
  });

  it('exige preço quando há quantidade', () => {
    const r = validarQuiosqueForm({ nome: 'Barraca', linhas: [{ ...linhaOk, precoVenda: '0' }] });
    expect(r.erros.linhas?.[10]?.precoVenda).toBe('Informe o preço de venda.');
  });

  it('não exige preço quando a quantidade é zero', () => {
    const r = validarQuiosqueForm({
      nome: 'Barraca',
      linhas: [linhaOk, { produtoId: 11, quantidade: '0', precoVenda: '', disponivel: 5 }],
    });
    expect(r.valido).toBe(true);
  });
});

describe('precoPagoPorNome', () => {
  const solicitacoes = [
    solicitacao(1, 'entregue', '2026-09-01T10:00:00', [{ nome: 'Coca-Cola Lata', precoUnitario: 3 }]),
    solicitacao(2, 'entregue', '2026-09-20T10:00:00', [{ nome: 'Coca-Cola Lata', precoUnitario: 3.5 }]),
    solicitacao(3, 'em_rota', '2026-09-25T10:00:00', [{ nome: 'Coca-Cola Lata', precoUnitario: 9 }]),
  ];

  it('usa o pedido entregue mais recente', () => {
    expect(precoPagoPorNome('Coca-Cola Lata', solicitacoes)).toBe(3.5);
  });

  it('ignora maiúsculas e espaços', () => {
    expect(precoPagoPorNome('  coca-cola   LATA ', solicitacoes)).toBe(3.5);
  });

  it('ignora pedidos não entregues', () => {
    expect(precoPagoPorNome('Coca-Cola Lata', [solicitacoes[2]])).toBeUndefined();
  });

  it('retorna undefined quando não encontra', () => {
    expect(precoPagoPorNome('Guaraná', solicitacoes)).toBeUndefined();
  });
});
