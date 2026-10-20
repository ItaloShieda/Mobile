# Quiosques do cliente — Design

**Data:** 2026-10-03
**Status:** aprovado em conversa, aguardando revisão desta especificação

## Objetivo

O cliente (comerciante que compra bebidas de fornecedores pelo app) passa a poder montar os próprios quiosques para vender em eventos. O estoque de cada quiosque sai do que ele comprou e recebeu pelo app.

**Fica de fora desta entrega:** registrar vendas nos eventos, baixa de estoque por venda e relatórios.

## Decisões

| Tema | Decisão |
|---|---|
| Escopo | Só front-end, usando a API atual. Nenhum endpoint novo. |
| Abordagem | Telas novas do cliente, reaproveitando `barracaService`, `QuiosqueContext` e `ProductsContext`. O fluxo do fornecedor não muda. |
| Acesso | Nova aba "Quiosques" na barra inferior do cliente, entre Pedidos e Perfil. |
| Regra de estoque | O total comprado é dividido entre os quiosques: a soma de todos os quiosques não pode passar do estoque do produto. |
| Preço | O cliente define o preço de venda. O preço pago aparece como referência quando é possível encontrá-lo. |

## Premissas e riscos

Não foi possível validar estes pontos sem o backend rodando:

1. **Compras viram produtos:** o backend transforma os itens de pedidos entregues em `produtos` da empresa compradora, preenchendo `estoque`. Indício disso: `usePedidoAcompanhamento.ts` chama `refreshProdutos()` quando o pedido fica `entregue`, e `Produto` tem o campo `codigoOrigem`.
   - Se não for assim, a lista de produtos do cliente vem vazia e a tela mostra o estado vazio.
2. **Barracas para clientes:** `/api/barracas` aceita barracas de uma empresa do tipo cliente.
3. **Preço no produto:** o preço de venda é gravado em `produto.precoVenda`, então vale para todos os quiosques do cliente.

Para validar 1 e 2, é preciso uma conta de cliente real com o backend rodando. As contas locais (`cliente@teste.com`) não falam com o servidor.

## Telas e navegação

### Barra inferior (`ClienteTabBar`)
- Adicionar a aba `{ key: 'ClienteQuiosques', label: 'Quiosques', icon: 'storefront-outline', iconActive: 'storefront' }` entre Pedidos e Perfil.
- Em `resolveActive`, as rotas `ClienteQuiosques` e `ClienteQuiosqueForm` destacam essa aba.

### Rotas (`navigation/types.ts`, `MainNavigator.tsx`)
- `ClienteQuiosques: undefined`
- `ClienteQuiosqueForm: { quiosqueId?: number } | undefined`

### Tela 1 — Meus quiosques (`screens/ClienteQuiosques/ClienteQuiosquesScreen.tsx`)
- **Cabeçalho amarelo** no padrão do cliente (logo QuickStock e o título "Meus quiosques"), com o botão "+ Novo quiosque".
- **Card de resumo:** "X un. compradas · Y un. nos quiosques · Z livres".
- **Lista de quiosques:** cada card mostra nome, quantidade de produtos, total de unidades e valor estimado (soma de quantidade × `precoVenda`). Tocar no card abre o formulário em modo de edição.
  - Se algum item do quiosque estiver acima do disponível, o card mostra o aviso "Estoque acima do disponível".
- **Estados:**
  - Carregando: indicador de carregamento.
  - Erro: mensagem e botão "Tentar novamente".
  - Sem produtos comprados: "Você ainda não tem produtos recebidos. Compre de um fornecedor para montar seu quiosque", com botão "Ver produtos", que leva a `Explorar`.
  - Com produtos, mas sem quiosques: "Crie seu primeiro quiosque".
- **Rodapé:** `BottomTabBar` com `activeRoute="ClienteQuiosques"`.

### Tela 2 — Novo / Editar quiosque (`screens/ClienteQuiosques/ClienteQuiosqueFormScreen.tsx`)
- **Cabeçalho amarelo** com botão de voltar e o título "Novo quiosque" ou "Editar quiosque".
- **Campo** "Nome do quiosque".
- **Uma linha por produto do cliente** (ativos e com `estoque > 0`), contendo:
  - foto, nome e o texto "N de M disponíveis";
  - "Você pagou R$ X", quando houver referência;
  - quantidade, com botões −/+ e digitação;
  - preço de venda, em reais.
- **Rodapé fixo:** total de unidades, valor estimado e o botão "Salvar quiosque".
- **Na edição:** botão "Excluir quiosque", com confirmação pelo `ConfirmDialogContext`, que chama `removerQuiosque(id, empresaId)`.
- **Por que tela inteira e não modal:** a lista de produtos pode ser longa, e o teclado atrapalha menos.

## Dados

| Dado | Origem |
|---|---|
| Produtos do cliente | `useProdutos()`, filtrando `ativo === 1 && (estoque ?? 0) > 0` |
| Quiosques do cliente | `useQuiosques()`, que chama `GET /api/barracas?empresaId=` |
| Preço pago (referência) | `listarSolicitacoes(empresaId)`: o `precoUnitario` do item do pedido `entregue` mais recente cujo nome normalizado (minúsculas, sem espaços nas pontas, espaços internos únicos) seja igual ao nome do produto. Se não encontrar, a referência não aparece. |

## Regras (`src/utils/estoqueQuiosque.ts`, funções puras)

- `quantidadeAlocada(produtoId, quiosques, ignorarQuiosqueId?)`: soma das quantidades do produto nos quiosques, sem contar o quiosque em edição.
- `disponivelParaQuiosque(produto, quiosques, ignorarQuiosqueId?)`: `(produto.estoque ?? 0) − quantidadeAlocada(...)`, com mínimo de 0.
- `resumoEstoque(produtos, quiosques)`: devolve `{ comprado, alocado, livre }`, com `livre = max(0, comprado − alocado)`.
- `quiosqueExcedeEstoque(quiosque, produtos, quiosques)`: verdadeiro se algum item do quiosque passar de `disponivelParaQuiosque` (sem contar o próprio quiosque).
- `validarQuiosqueForm({ nome, linhas })`: devolve os erros por campo.
  - O nome é obrigatório.
  - A quantidade deve ser um número ≥ 0 e ≤ disponível. Mensagem: "Máximo N un. disponíveis".
  - Se a quantidade for > 0, o preço de venda deve ser > 0.
- `precoPagoPorNome(nomeProduto, solicitacoes)`: devolve o preço unitário ou `undefined`, conforme a regra de referência acima.

## Lógica do formulário (`useClienteQuiosqueForm.ts`)

1. Monta as linhas a partir dos produtos do cliente. Na edição, preenche quantidade e preço com os valores do quiosque.
2. Ao salvar:
   1. Roda `validarQuiosqueForm`. Se houver erro, interrompe e mostra os erros nos campos.
   2. Para cada produto com quantidade > 0 cujo preço mudou, chama `atualizarProduto(id, { ...produto, precoVenda })`.
   3. Chama `criarQuiosque` ou `atualizarQuiosque` com `{ nome, empresaId, responsavelId: user.id, itens }`, enviando só os itens com quantidade > 0.
   4. Chama `refresh()` do `ProductsContext` e do `QuiosqueContext` e volta para a lista.
3. Se o passo 2.ii falhar, o quiosque não é gravado. Se o 2.ii der certo e o 2.iii falhar, o preço continua atualizado (inofensivo) e o usuário pode tentar de novo.

## Erros

- **Falha de carregamento:** mostra a mensagem vinda de `http.ts` e o botão "Tentar novamente".
- **Validação:** erro no próprio campo, com a linha destacada em vermelho. O botão Salvar fica desativado enquanto houver erro.
- **Falha ao salvar:** faixa vermelha acima do botão, mantendo o que foi digitado.
- **Contas locais de teste:** as chamadas falham, e a tela mostra o erro de conexão sem travar.

## Visual

- Usa `CLIENTE_COLORS` de `theme/theme.ts` e segue os estilos de `ClienteHome/styles.ts` (cabeçalho amarelo com cantos arredondados, cards brancos e botões amarelos com texto branco).
- Os estilos ficam em `screens/ClienteQuiosques/styles.ts`.

## Testes

- Adicionar `jest` e `jest-expo` como dependências de desenvolvimento, com o script `"test": "jest"`.
- `src/utils/__tests__/estoqueQuiosque.test.ts` deve cobrir:
  - o disponível, com e sem o quiosque em edição, e o mínimo de 0;
  - o resumo comprado / alocado / livre;
  - `quiosqueExcedeEstoque`;
  - a validação: nome vazio, quantidade acima do disponível, quantidade inválida, preço ausente quando a quantidade é > 0;
  - `precoPagoPorNome`: achou; não achou; diferença de maiúsculas e espaços; ignora pedidos não entregues; usa o pedido mais recente.
- **Verificação:** `npx tsc --noEmit` sem erros, `npm test` passando e conferência visual com `npm run web`, usando a conta local de cliente (aba, telas, estados vazio e de erro).

## Arquivos

**Novos**
- `src/utils/estoqueQuiosque.ts`
- `src/utils/__tests__/estoqueQuiosque.test.ts`
- `src/screens/ClienteQuiosques/ClienteQuiosquesScreen.tsx`
- `src/screens/ClienteQuiosques/ClienteQuiosqueFormScreen.tsx`
- `src/screens/ClienteQuiosques/useClienteQuiosqueForm.ts`
- `src/screens/ClienteQuiosques/styles.ts`

**Alterados**
- `src/components/layout/ClienteTabBar.tsx`: nova aba.
- `src/navigation/types.ts` e `src/navigation/MainNavigator.tsx`: novas rotas.
- `package.json`: Jest e o script de teste.
