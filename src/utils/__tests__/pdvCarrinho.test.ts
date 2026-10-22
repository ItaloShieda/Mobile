import {
  adicionarAoCarrinho,
  alterarQuantidade,
  calcularTrocoCentavos,
  documentoClienteValido,
  filtrarProdutos,
  gerarChaveVenda,
  montarVendaPayload,
  parseValorEmCentavos,
  podeFinalizar,
  removerDoCarrinho,
  subtotalCentavos,
  totalCentavos,
} from '../pdvCarrinho';
import { gerarHtmlComprovante } from '../comprovantePdv';
import type { ItemCarrinhoPdv, ProdutoPdv, VendaPdv } from '../../types/pdv';

const cerveja: ProdutoPdv = { id: 1, codigo: 'MKT-CC-001', nome: 'Cerveja Heineken Long Neck', unidade: 'UN', precoVenda: 5.99, disponivel: 10 };
const agua: ProdutoPdv = { id: 2, codigo: 'EMP-4-0002', nome: 'Água Mineral 500ml', unidade: 'UN', precoVenda: 2.25, disponivel: 3 };
const esgotado: ProdutoPdv = { id: 3, codigo: 'EMP-4-0003', nome: 'Gelo', unidade: 'KG', precoVenda: 8, disponivel: 0 };

function carrinhoCom(...itens: [ProdutoPdv, number][]): ItemCarrinhoPdv[] {
  return itens.reduce<ItemCarrinhoPdv[]>((c, [p, q]) => adicionarAoCarrinho(c, p, q).carrinho, []);
}

describe('busca de produtos', () => {
  const lista = [cerveja, agua, esgotado];
  it('encontra por nome sem acento nem maiúsculas', () => {
    expect(filtrarProdutos(lista, 'agua').map((p) => p.id)).toEqual([2]);
    expect(filtrarProdutos(lista, 'HEINEKEN').map((p) => p.id)).toEqual([1]);
  });
  it('encontra por código', () => {
    expect(filtrarProdutos(lista, 'mkt-cc').map((p) => p.id)).toEqual([1]);
  });
  it('busca vazia devolve tudo e termo sem resultado devolve nada', () => {
    expect(filtrarProdutos(lista, '  ')).toHaveLength(3);
    expect(filtrarProdutos(lista, 'vodka')).toHaveLength(0);
  });
});

describe('alterações no carrinho', () => {
  it('adiciona e soma o mesmo produto em um item só', () => {
    const c = carrinhoCom([cerveja, 1], [cerveja, 2], [agua, 1]);
    expect(c).toHaveLength(2);
    expect(c.find((i) => i.produtoId === 1)?.quantidade).toBe(3);
  });

  it('não passa do estoque disponível e avisa', () => {
    const r = adicionarAoCarrinho(carrinhoCom([agua, 3]), agua, 1);
    expect(r.carrinho[0].quantidade).toBe(3);
    expect(r.aviso).toContain('Estoque disponível');
  });

  it('não adiciona produto sem estoque', () => {
    const r = adicionarAoCarrinho([], esgotado);
    expect(r.carrinho).toHaveLength(0);
    expect(r.aviso).toContain('sem estoque');
  });

  it('altera quantidade, limita ao disponível e remove ao zerar', () => {
    let c = carrinhoCom([cerveja, 1]);
    c = alterarQuantidade(c, 1, 4).carrinho;
    expect(c[0].quantidade).toBe(4);
    const acima = alterarQuantidade(c, 1, 99);
    expect(acima.carrinho[0].quantidade).toBe(10);
    expect(acima.aviso).toBeTruthy();
    expect(alterarQuantidade(c, 1, 0).carrinho).toHaveLength(0);
  });

  it('recusa quantidade inválida sem mudar o carrinho', () => {
    const c = carrinhoCom([cerveja, 2]);
    const r = alterarQuantidade(c, 1, Number.NaN);
    expect(r.carrinho).toBe(c);
    expect(r.aviso).toBe('Quantidade inválida.');
    expect(alterarQuantidade(c, 1, -1).carrinho).toBe(c);
  });

  it('arredonda quantidades a 3 casas como o backend', () => {
    const c = alterarQuantidade(carrinhoCom([agua, 1]), 2, 1.23456).carrinho;
    expect(c[0].quantidade).toBe(1.235);
  });

  it('remove item', () => {
    const c = removerDoCarrinho(carrinhoCom([cerveja, 1], [agua, 1]), 1);
    expect(c.map((i) => i.produtoId)).toEqual([2]);
  });
});

describe('totais e troco', () => {
  it('calcula subtotal e total em centavos sem erro de arredondamento', () => {
    const c = carrinhoCom([cerveja, 3], [agua, 2]);
    expect(subtotalCentavos(c[0])).toBe(1797);   // 3 × 5,99
    expect(subtotalCentavos(c[1])).toBe(450);    // 2 × 2,25
    expect(totalCentavos(c)).toBe(2247);
  });

  it('arredonda meio centavo para cima, como o backend', () => {
    expect(subtotalCentavos({ precoUnitario: 2.25, quantidade: 0.5 })).toBe(113);  // 1,125 → 1,13
    expect(totalCentavos(carrinhoCom([cerveja, 0.1]))).toBe(60);                   // 0,599 → 0,60
  });

  it('calcula troco e recusa valor insuficiente', () => {
    expect(calcularTrocoCentavos(1350, 2000)).toBe(650);
    expect(calcularTrocoCentavos(1350, 1350)).toBe(0);
    expect(calcularTrocoCentavos(1350, 1349)).toBeNull();
    expect(calcularTrocoCentavos(1350, Number.NaN)).toBeNull();
  });

  it('lê valores digitados com vírgula', () => {
    expect(parseValorEmCentavos('50')).toBe(5000);
    expect(parseValorEmCentavos('13,5')).toBe(1350);
    expect(parseValorEmCentavos('abc')).toBeNaN();
  });
});

describe('finalização', () => {
  const base = { carrinho: carrinhoCom([cerveja, 2]), valorRecebidoTexto: '', clienteDocumento: '' };

  it('exige itens, forma de pagamento e valor recebido em dinheiro', () => {
    expect(podeFinalizar({ ...base, carrinho: [], forma: 'pix' })).toBe('Adicione produtos ao carrinho.');
    expect(podeFinalizar({ ...base, forma: null })).toBe('Selecione a forma de pagamento.');
    expect(podeFinalizar({ ...base, forma: 'dinheiro' })).toBe('Informe o valor recebido.');
    expect(podeFinalizar({ ...base, forma: 'dinheiro', valorRecebidoTexto: '11' })).toBe('Valor recebido é menor que o total.');
    expect(podeFinalizar({ ...base, forma: 'dinheiro', valorRecebidoTexto: '11,98' })).toBeNull();
    expect(podeFinalizar({ ...base, forma: 'pix' })).toBeNull();
  });

  it('cliente é opcional, mas CPF/CNPJ informado precisa estar completo', () => {
    expect(documentoClienteValido('')).toBe(true);
    expect(documentoClienteValido('123.456.789-09')).toBe(true);
    expect(documentoClienteValido('12.345.678/0001-95')).toBe(true);
    expect(documentoClienteValido('123.456')).toBe(false);
    expect(podeFinalizar({ ...base, forma: 'pix', clienteDocumento: '123' })).toContain('CPF ou CNPJ');
  });

  it('envia só ids e quantidades, nunca preço ou total', () => {
    const payload = montarVendaPayload({
      carrinho: carrinhoCom([cerveja, 2], [agua, 1]), barracaId: 7, chaveVenda: 'abc12345-chave',
      forma: 'dinheiro', valorRecebidoTexto: '20,00', clienteNome: '  Ana ', clienteDocumento: '123.456.789-09',
    });
    expect(payload).toEqual({
      barracaId: 7, chaveVenda: 'abc12345-chave', formaPagamento: 'dinheiro', valorRecebido: 20,
      clienteNome: 'Ana', clienteDocumento: '12345678909',
      itens: [{ produtoId: 1, quantidade: 2 }, { produtoId: 2, quantidade: 1 }],
    });
    expect(JSON.stringify(payload)).not.toMatch(/preco|total|subtotal/i);
  });

  it('não envia valor recebido fora do dinheiro nem cliente vazio', () => {
    const payload = montarVendaPayload({
      carrinho: carrinhoCom([cerveja, 1]), barracaId: 1, chaveVenda: 'abc12345', forma: 'pix',
      valorRecebidoTexto: '100', clienteNome: ' ', clienteDocumento: '',
    });
    expect(payload).not.toHaveProperty('valorRecebido');
    expect(payload).not.toHaveProperty('clienteNome');
    expect(payload).not.toHaveProperty('clienteDocumento');
  });

  it('gera chaves de venda únicas no formato aceito pelo backend', () => {
    const chaves = new Set(Array.from({ length: 500 }, gerarChaveVenda));
    expect(chaves.size).toBe(500);
    chaves.forEach((c) => expect(c).toMatch(/^[A-Za-z0-9-]{8,64}$/));
  });
});

describe('comprovante', () => {
  const venda: VendaPdv = {
    id: 12, numero: 'PDV-000012', criadoEm: '2026-10-22T10:30:00', status: 'concluido', barracaId: 1,
    barracaNome: 'Barraca <São João>', operadorNome: 'Ana', empresaNome: 'Mercado Demo', empresaCnpj: '12.345.678/0001-95',
    formaPagamento: 'dinheiro', total: 13.5, valorRecebido: 20, troco: 6.5, clienteNome: null, clienteDocumento: null,
    itens: [{ produtoId: 1, codigo: 'X', nome: 'Cerveja', unidade: 'UN', quantidade: 3, precoUnitario: 4.5, subtotal: 13.5 }],
  };

  it('mostra itens, total, troco e o aviso de sem valor fiscal', () => {
    const html = gerarHtmlComprovante(venda);
    expect(html).toContain('PDV-000012');
    expect(html).toContain('SEM VALOR FISCAL');
    expect(html).toContain('Troco');
    expect(html).toMatch(/13,50/);
    expect(html).toMatch(/6,50/);
  });

  it('escapa HTML vindo dos dados', () => {
    expect(gerarHtmlComprovante(venda)).toContain('Barraca &lt;São João&gt;');
  });
});
