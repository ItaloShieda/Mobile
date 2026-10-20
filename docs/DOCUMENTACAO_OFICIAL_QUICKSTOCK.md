# QuickStock — Documentação Oficial

> Versão versionável em Markdown. O documento Word para entrega acadêmica está em **DOCUMENTACAO_OFICIAL_QUICKSTOCK.docx**.
>
> Para regenerar o `.docx`: `cd docs/scripts && npm install && node gerar_documentacao.mjs`

---

## Elementos pré-textuais

- **Capa** e **folha de rosto** com campos `[PREENCHER: ...]` no Word (instituição, autor, orientador, cidade, ano).
- **Sumário** automático — após abrir no Word, clique com botão direito no sumário → **Atualizar campo**.

---

## 1 Introdução

O comércio de bebidas e atacado enfrenta desafios na gestão de estoque em múltiplos pontos de venda e na reposição junto a distribuidoras. O **QuickStock** integra aplicativo mobile (Expo / React Native) e API REST (Spring Boot) com PostgreSQL.

### 1.1 Objetivo geral

Desenvolver e documentar um sistema mobile integrado a backend para gestão de estoque e compras B2B no setor de bebidas.

### 1.2 Objetivos específicos

- Cadastro unificado com JWT
- CRUD de produtos, quiosques e estoque
- Marketplace B2B com checkout e rastreamento
- Quiosques do cliente montados a partir das compras recebidas
- Modelagem conceitual, lógica e física do banco
- Documentação conforme ABNT NBR 14724

### 1.3 Justificativa

Unificar gestão interna e compras externas em um único app, aproximando a experiência de apps de delivery.

### 1.4 Escopo

Arquitetura, frontend, backend e modelagem de dados, com testes unitários das regras de estoque dos quiosques do cliente. Fora do escopo: deploy produção e testes de integração ou ponta a ponta.

---

## 2 Metodologia e arquitetura

- **Mobile:** Expo 54, React Native 0.81, TypeScript 5.9
- **Backend:** Spring Boot 3.4, Java 17
- **Banco:** PostgreSQL 18
- **Comunicação:** HTTP/JSON, porta 8080
- **Testes (mobile):** Jest + jest-expo

Diagramas em `diagramas/arquitetura-sistema.png` e `diagramas/fluxo-navegacao.png`.

Repositórios:
- https://github.com/LuanSantos26/Mobile
- https://github.com/marcelo435/Mobile (versão com quiosques do cliente e novo layout)
- https://github.com/LuanSantos26/QuickStock-BackEnd

---

## 3 Desenvolvimento

### 3.1 Frontend mobile

- **Perfis:** Cliente (comerciante que compra de fornecedores) e Fornecedor (distribuidora), escolhidos no cadastro, cada um com telas e barra inferior próprias
- **Navegação:** React Navigation Native Stack; gate auth em `App.tsx`
- **Contexts:** AuthContext, ProductsContext, QuiosqueContext, PurchaseCartContext, ConfirmDialogContext
- **Services:** auth, product, barraca, marketplace, endereco, formaPagamento, financeiro, notificacao
- **Telas do Fornecedor:** Home, Quiosque, AddItem, EmpresaVendas, EmpresaGraficos, Configuracoes, Logistica, Camioneiros, Cart, StoreVitrine, ProductDetail, Sacola, PedidoAcompanhamento, Cards, FormasPagamento, Enderecos
- **Telas do Cliente:** Home, Explorar, StoreVitrine, ProductDetail, Reservas, Pedidos, PedidoAcompanhamento, ClienteQuiosques, ClienteQuiosqueForm, Perfil
- **Componentes:** ScreenHeader e BackTitleHeader (Fornecedor), TabScreenLayout, BottomTabBar e ClienteTabBar, HamburgerButton, modais de formulário

#### 3.1.1 Identidade visual

Os dois perfis seguem o mesmo layout: cabeçalho sólido com cantos inferiores arredondados, cards brancos, botões em pílula e barra inferior preenchida com ícones brancos. A cor muda por perfil:

| Perfil | Cor | Paleta em `theme.ts` | Abas |
|---|---|---|---|
| Cliente | Amarelo `#F8B125` | `CLIENTE_COLORS` | Início, Produtos, Carrinho, Pedidos, Quiosques, Perfil |
| Fornecedor | Azul-marinho `#123B6D` | `COMPANY_COLORS` | Início, Quiosques, Produtos, Vendas, Ajustes |

#### 3.1.2 Quiosques do cliente

O cliente monta quiosques próprios para vender em eventos, usando como estoque o que comprou e recebeu pelo app. Feito só no aplicativo, sobre a API existente: os quiosques vão para `/api/barracas` com o `empresaId` do cliente, e o estoque vem dos produtos da empresa do cliente, que o backend preenche quando o pedido é entregue.

| Regra | Como funciona |
|---|---|
| Divisão do estoque | A soma de um produto em todos os quiosques não passa do estoque comprado. Disponível = estoque − quantidade nos outros quiosques |
| Preço de venda | Informado pelo cliente; gravado no produto (vale para todos os quiosques dele) |
| Preço pago (referência) | Preço unitário do pedido entregue mais recente com item de mesmo nome; não aparece sem correspondência |
| Validação | Nome, ao menos um produto, quantidade dentro do disponível, preço > 0 quando há quantidade |

Regras em `src/utils/estoqueQuiosque.ts`, cobertas por 22 testes unitários. Premissas não validadas sem o backend: os pedidos entregues viram produtos da empresa compradora, e `/api/barracas` aceita quiosques de clientes.

Especificação completa: `superpowers/specs/2026-10-03-quiosque-cliente-design.md`.

### 3.2 Backend API

- **Camadas:** Controller → Service → Repository → Entity
- **17 controllers** REST sob `/api/*`
- **JWT** no login; BCrypt para senhas
- **Regras:** pedido B2B com status `aguardando_liberacao` → `em_rota` após 20s (demo)

### 3.3 Banco de dados

#### 3.3.1 Modelo conceitual

Entidades de negócio: Perfil, Empresa, Usuário, Produto, Evento, Quiosque, Estoque, Pedido PDV, Pagamento, Solicitação de Compra, Endereço, Forma de Pagamento.

Diagrama: `diagramas/er-conceitual.png`

#### 3.3.2 Modelo lógico

14 tabelas relacionais com PK surrogate e FKs. Empresa referenciada duas vezes em `solicitacoes_compra`. UNIQUE `(barraca_id, produto_id)` em `estoque_barraca`.

Diagrama: `diagramas/er-logico.png`

#### 3.3.3 Modelo físico

Implementação PostgreSQL via Hibernate (`ddl-auto=update`). Seed em `data.sql`. Dicionário completo de tabelas no arquivo Word gerado.

Tabelas: `perfis`, `empresas`, `usuarios`, `produtos`, `eventos`, `barracas`, `estoque_barraca`, `pedido`, `itens_pedido`, `pagamentos`, `enderecos_entrega`, `formas_pagamento_salvas`, `solicitacoes_compra`, `itens_solicitacao_compra`.

---

## 4 Conclusão

O QuickStock entrega gestão de estoque, marketplace B2B e quiosques do cliente montados a partir das compras, com identidade visual consistente entre os perfis Cliente e Fornecedor. Limitações: JWT parcial, dados mock na Home/Carteira, notificações sem tabela, financeiro parcialmente sintético e quiosques do cliente dependentes de o backend lançar as compras entregues no estoque do comprador.

---

## Referências (ABNT NBR 6023)

- ABNT NBR 14724:2011 — Apresentação de trabalhos acadêmicos
- ABNT NBR 6023:2018 — Referências
- Expo Documentation — https://docs.expo.dev/
- React Native — https://reactnative.dev/
- Spring Boot — https://spring.io/projects/spring-boot
- PostgreSQL — https://www.postgresql.org/docs/
- ViaCEP — https://viacep.com.br/
