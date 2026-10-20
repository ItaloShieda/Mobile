# QuickStock — Guia Completo para Apresentação

Documento de estudo detalhado sobre o que foi implementado no projeto **QuickStock**, cobrindo o aplicativo mobile (React Native / Expo) e a API backend (Spring Boot). Use este material para preparar slides, demonstração ao vivo e respostas a perguntas da banca.

---

## Índice

1. [Visão geral do projeto](#1-visão-geral-do-projeto)
2. [Repositórios e tecnologias](#2-repositórios-e-tecnologias)
3. [Arquitetura do sistema](#3-arquitetura-do-sistema)
4. [Backend — API REST](#4-backend--api-rest)
5. [Mobile — Aplicativo](#5-mobile--aplicativo)
6. [Fluxos principais (passo a passo)](#6-fluxos-principais-passo-a-passo)
7. [Integrações externas](#7-integrações-externas)
8. [O que é real vs. demonstração (mock)](#8-o-que-é-real-vs-demonstração-mock)
9. [Decisões técnicas importantes](#9-decisões-técnicas-importantes)
10. [Roteiro sugerido para apresentação](#10-roteiro-sugerido-para-apresentação)
11. [Perguntas que a banca pode fazer](#11-perguntas-que-a-banca-pode-fazer)
12. [Como rodar o projeto](#12-como-rodar-o-projeto)
13. [Histórico de evolução (o que foi feito)](#13-histórico-de-evolução-o-que-foi-feito)

---

## 1. Visão geral do projeto

### O que é o QuickStock?

O **QuickStock** é uma solução mobile + backend para **gestão de estoque e compras B2B** no setor de bebidas/atacado. O app atende empresas que:

- **Gerenciam** seu próprio catálogo de produtos e estoque em quiosques (pontos de venda / filiais).
- **Compram** de distribuidoras parceiras via um marketplace integrado (fluxo estilo app de delivery).
- **Revendem em eventos**, montando quiosques próprios com o que compraram pelo app.

O app tem **dois perfis**, escolhidos no cadastro, cada um com telas e barra inferior próprias:

| Perfil | Quem é | Cor do app |
|--------|--------|------------|
| **Cliente** | Comerciante que compra bebidas e revende em eventos | Amarelo `#F8B125` |
| **Fornecedor** | Distribuidora que vende e gerencia o catálogo | Azul-marinho `#123B6D` |

Na escolha de perfil há também a opção **"Cliente e fornecedor"**; quem a escolhe usa o fluxo do Fornecedor.

### Problema que o projeto resolve

| Dor do usuário | Solução no QuickStock |
|----------------|----------------------|
| Controlar produtos e quantidades em vários pontos de venda | CRUD de produtos + quiosques com estoque por filial |
| Repor estoque comprando de distribuidoras | Marketplace com vitrine, sacola e checkout |
| Acompanhar pedidos de compra | Timeline de status com atualização automática |
| Cadastrar endereço e forma de pagamento | Endereços de entrega + formas de pagamento salvas |
| Saber resumo financeiro | Tela de estatísticas com dados da API (parcialmente reais) |
| Revender em eventos com o que comprou | Quiosques do cliente, com o estoque comprado dividido entre eles |

### Público-alvo (persona)

- **Cliente** (empresa tipo `COMPRADOR`): bar, restaurante, revenda ou empreendedor que compra bebidas de distribuidoras cadastradas e monta quiosques para vender em eventos.
- **Fornecedor** (empresa tipo `DISTRIBUIDOR`): distribuidora que mantém o catálogo, os próprios quiosques, as vendas e a logística de entrega.

---

## 2. Repositórios e tecnologias

### Repositórios GitHub

| Repositório | URL | Descrição |
|-------------|-----|-----------|
| **Mobile** | https://github.com/LuanSantos26/Mobile | App React Native / Expo |
| **Mobile (Marcelo)** | https://github.com/marcelo435/Mobile | Versão com quiosques do cliente e layout unificado |
| **BackEnd** | https://github.com/LuanSantos26/QuickStock-BackEnd | API Spring Boot |

### Stack Mobile

| Camada | Tecnologia | Versão (aprox.) |
|--------|------------|-----------------|
| Framework | Expo | 54 |
| UI | React Native | 0.81 |
| Linguagem | TypeScript (strict) | 5.9 |
| Navegação | React Navigation (Native Stack) | v7 |
| Estado global | React Context API | 5 contexts |
| Persistência local | AsyncStorage | 2.2.0 |
| Ícones | @expo/vector-icons (Ionicons, Feather) | — |
| Testes | Jest + jest-expo | 29.7 / 54 |
| Imagens | expo-image-picker | — |
| Gradientes | expo-linear-gradient | — |

### Stack Backend

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Spring Boot | 3.4.0 |
| Linguagem | Java | 17 |
| Banco | PostgreSQL | — |
| ORM | Spring Data JPA / Hibernate | — |
| Auth | JWT (jjwt) + BCrypt | 0.12.6 |
| Documentação API | Springdoc OpenAPI | 2.6.0 |
| Build | Maven | — |

### Comunicação

```
[App Mobile]  ──HTTP/JSON──►  [API :8080]  ──JDBC──►  [PostgreSQL :5432]
     │                              │
     └── AsyncStorage               └── uploads/produtos/ (imagens)
         (sessão, prefs)
```

---

## 3. Arquitetura do sistema

### Diagrama de alto nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP MOBILE (Expo)                        │
├─────────────────────────────────────────────────────────────────┤
│  Telas (Screens)                                                │
│    Welcome, Login, Register, Home, Cart, Sacola, Pedido...      │
├─────────────────────────────────────────────────────────────────┤
│  Componentes reutilizáveis                                      │
│    ScreenHeader, BottomTabBar, HamburgerButton, Modais...       │
├─────────────────────────────────────────────────────────────────┤
│  Contextos (estado global)                                      │
│    AuthContext │ ProductsContext │ QuiosqueContext │ Cart   │
├─────────────────────────────────────────────────────────────────┤
│  Services (camada HTTP)                                         │
│    authService, marketplaceService, productService, etc.        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST JSON
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot)                         │
├─────────────────────────────────────────────────────────────────┤
│  Controllers  →  Services  →  Repositories  →  Entities       │
│  (17 REST)       (11 svcs)     (17 repos)        (15 tabelas)    │
├─────────────────────────────────────────────────────────────────┤
│  Config: CORS, Seeds (data.sql + ApplicationRunners)          │
│  JWT: login + /api/usuarios/me                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │  quickstock   │
                    └───────────────┘
```

### Dois domínios de negócio no mesmo app

O QuickStock une **três frentes** que convivem na mesma aplicação:

1. **Gestão interna (Fornecedor)** — produtos, quiosques, estoque, vendas e logística.
2. **Marketplace B2B** — descobrir fornecedores, montar sacola, finalizar compra, rastrear pedido.
3. **Revenda em eventos (Cliente)** — o que o cliente comprou vira estoque dos quiosques dele.

Isso é um diferencial na apresentação: não é só um e-commerce; é gestão + compra + revenda integradas.

---

## 4. Backend — API REST

### Estrutura de pacotes

```
com.quickstock.backend/
├── BackendApplication.java      ← ponto de entrada
├── config/                        ← CORS, seeds, correção de dados
├── controller/                    ← 17 controllers REST
├── dto/                           ← objetos de request/response
├── entity/                        ← 15 entidades JPA
├── exception/                     ← tratamento global de erros
├── repository/                    ← acesso ao banco
└── service/                       ← regras de negócio
```

### Entidades principais e relacionamentos

```
Perfil ──► Usuario ──► Empresa
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
       Produto      EnderecoEntrega   FormaPagamentoSalva
          │
          ▼
    EstoqueBarraca ◄── Barraca ◄── Evento
                          │
                          ▼
                       Pedido ──► ItemPedido, Pagamento

Empresa (compradora) ──► SolicitacaoCompra ◄── Empresa (fornecedora)
                              │
                              └── ItemSolicitacaoCompra ──► Produto
```

### Tipos de empresa

| Tipo | Papel |
|------|-------|
| `COMPRADOR` | Empresa que compra no marketplace |
| `DISTRIBUIDOR` | Fornecedor de produtos |
| `PLATAFORMA` | QuickStock / hub central |

### Endpoints usados pelo app mobile (principais)

#### Autenticação e cadastro

| Método | Endpoint | Função |
|--------|----------|--------|
| POST | `/api/cadastro` | Cadastro unificado (empresa + usuário admin) |
| POST | `/api/usuarios/login` | Login → retorna JWT |
| GET | `/api/usuarios/me` | Valida token e retorna usuário logado |
| PUT | `/api/usuarios/{id}` | Atualizar dados do usuário |
| PUT | `/api/empresas/{id}` | Atualizar dados da empresa |

#### Produtos

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/api/produtos?empresaId={id}` | Listar catálogo da empresa |
| POST | `/api/produtos` | Criar produto |
| PUT | `/api/produtos/{id}` | Editar produto |
| DELETE | `/api/produtos/{id}` | Desativar produto (soft delete) |
| POST | `/api/produtos/upload` | Upload de imagem (multipart) |

#### Quiosque

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/api/barracas?empresaId={id}` | Listar quiosques |
| POST | `/api/barracas` | Criar quiosque |
| PUT | `/api/barracas/{id}` | Editar quiosque |
| PUT | `/api/barracas/{id}/estoque` | Atualizar quantidades por produto |
| DELETE | `/api/barracas/{id}?empresaId={id}` | Remover quiosque |

#### Marketplace e pedidos B2B

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/api/marketplace/fornecedores?empresaCompradoraId={id}` | Listar distribuidoras |
| GET | `/api/marketplace/fornecedores/{id}/produtos` | Catálogo do fornecedor |
| POST | `/api/solicitacoes-compra` | Criar pedido de compra |
| GET | `/api/solicitacoes-compra?empresaCompradoraId={id}` | Histórico de pedidos |
| GET | `/api/solicitacoes-compra/{id}?empresaCompradoraId={id}` | Detalhe + timeline |

#### Endereços, pagamento, notificações, financeiro

| Método | Endpoint | Função |
|--------|----------|--------|
| GET/POST | `/api/enderecos?empresaId={id}` | Endereços de entrega |
| GET/POST/DELETE | `/api/formas-pagamento?empresaId={id}` | Formas de pagamento salvas |
| GET | `/api/notificacoes?empresaCompradoraId={id}` | Notificações (geradas em tempo real) |
| GET | `/api/financeiro/resumo?empresaCompradoraId={id}` | Resumo financeiro mensal |

### Regras de negócio importantes (backend)

#### Solicitação de compra (`SolicitacaoCompraService`)

1. Valida que o fornecedor é `DISTRIBUIDOR` ou `PLATAFORMA`.
2. Impede compra da própria empresa.
3. Valida que o usuário pertence à empresa compradora.
4. Valida método de pagamento: `pix`, `credito`, `debito`, `dinheiro`.
5. Valida endereço de entrega da empresa.
6. Status inicial: **`aguardando_liberacao`**.
7. Calcula total = soma dos itens + **taxa de entrega**.

#### Timer de demonstração (status automático)

Para fins de apresentação/demo, após **20 segundos** da criação do pedido:

```
aguardando_liberacao  ──(20s)──►  em_rota
```

Essa transição é persistida no banco e disparada quando o app consulta listagem ou detalhe do pedido.

#### Status possíveis de pedido B2B

| Status | Significado na UI |
|--------|-------------------|
| `aguardando_liberacao` | Pedido feito, aguardando liberação do fornecedor |
| `em_rota` | Pedido saiu para entrega |
| `entregue` | Entrega concluída |
| `cancelada` | Pedido cancelado |

#### Timeline (etapas visuais retornadas pela API)

1. Pedido efetuado
2. Aguardando liberação
3. Em rota

### Segurança (JWT)

- Login retorna token JWT (validade: 24 horas).
- Senhas hasheadas com **BCrypt**.
- Endpoint protegido por token: **`GET /api/usuarios/me`**.
- **Importante para a banca:** não há Spring Security global — a maioria dos endpoints é pública; a autorização é feita validando `empresaId` nos services. Isso é uma limitação conhecida do MVP.

### Seeds e dados iniciais

O backend sobe com dados prontos para demo:

| Fonte | O que cria |
|-------|------------|
| `data.sql` | Perfis, 10+ distribuidoras fictícias, catálogo de bebidas (Skol, Brahma, Coca-Cola...) |
| `EnderecoSeedRunner` | 2 endereços demo por empresa compradora |
| `FormaPagamentoSeedRunner` | PIX, crédito, débito, dinheiro |
| `FinanceiroSeedRunner` | ~12 solicitações demo nos últimos 6 meses |
| `MarketplaceDataFixRunner` | Corrige nomes UTF-8, logos e capas de fornecedores |

### Configuração (`application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/quickstock
server.port=8080
jwt.secret=QuickStockDevSecretKey2026Minimo32Chars!!
jwt.expiration-ms=86400000
upload.dir=uploads/produtos
spring.servlet.multipart.max-file-size=5MB
```

---

## 5. Mobile — Aplicativo

### Estrutura de pastas

```
Mobile/
├── App.tsx                 ← providers globais
├── index.ts                ← entry point Expo
├── src/
│   ├── config/
│   │   └── api.ts          ← URL base da API + helper de imagem
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ConfirmDialogContext.tsx
│   │   ├── ProductsContext.tsx
│   │   ├── QuiosqueContext.tsx
│   │   └── PurchaseCartContext.tsx
│   ├── navigation/         ← AppNavigator, AuthNavigator, MainNavigator, tipos das rotas
│   ├── services/           ← chamadas HTTP e armazenamento local
│   ├── screens/            ← telas (Tela.tsx + useTela.ts + styles.ts)
│   ├── components/         ← componentes reutilizáveis
│   ├── hooks/              ← hooks compartilhados (ex.: useAppGoBack)
│   ├── types/              ← tipos compartilhados
│   ├── theme/
│   │   └── theme.ts        ← paletas por perfil, fontes, espaçamentos
│   └── utils/              ← funções puras (estoqueQuiosque, CEP, datas, Pix) + __tests__/
```

### Providers e ordem de aninhamento

```
GestureHandlerRootView
└── SafeAreaProvider
    └── ConfirmDialogProvider
        └── AuthProvider
            └── AppNavigator (NavigationContainer)
                ├── AuthNavigator (não logado)
                └── PurchaseCartProvider (logado)
                    └── MainNavigator
                        └── ProductsProvider
                            └── QuiosqueProvider
                                └── Stack (telas)
```

### Rotas de navegação

#### Fluxo guest (antes do login)

| Rota | Tela | Descrição |
|------|------|-----------|
| `Animation` | AnimationScreen | Abertura animada |
| `Welcome` | WelcomeScreen | Landing com botões Entrar / Criar conta |
| `Cli_For` | EscolhaUsuarioScreen | Escolha de perfil: Cliente, Fornecedor ou ambos |
| `Register` | RegisterScreen | Cadastro unificado |
| `Login` | LoginScreen | Login e-mail/senha |
| `ForgotPassword` | ForgotPasswordScreen | Recuperação de senha |

#### Fluxo autenticado — Fornecedor

| Rota | Tela | Descrição |
|------|------|-----------|
| `Home` | HomeScreen | Saudação, estoque, ações rápidas e resumo financeiro |
| `Quiosque` | QuiosqueScreen | CRUD de quiosques + estoque (aba Quiosques) |
| `AddItem` | ManageProductsScreen | CRUD de produtos (aba Produtos) |
| `EmpresaVendas` / `EmpresaGraficos` | Vendas e gráficos | Resumo de vendas (aba Vendas) |
| `Configuracoes` | ConfiguracoesScreen | Editar perfil e empresa (aba Ajustes) |
| `Logistica` / `Camioneiros` / `CadastroCamioneiros` | Logística | Entregas e caminhoneiros |
| `Cart` | CartScreen | Marketplace — lista de fornecedores |
| `StoreVitrine` | StoreVitrineScreen | Vitrine de um fornecedor |
| `ProductDetail` | ProductDetailScreen | Detalhe do produto + adicionar à sacola |
| `Sacola` | SacolaScreen | Checkout (endereço, pagamento, total) |
| `PedidoAcompanhamento` | PedidoAcompanhamentoScreen | Timeline do pedido |
| `FormasPagamento` / `Enderecos` / `Cards` | Conta | Formas de pagamento, endereços, carteira e estatísticas |

#### Fluxo autenticado — Cliente

As rotas `Home`, `StoreVitrine`, `ProductDetail`, `PedidoAcompanhamento`, `Configuracoes`, `Enderecos` e `FormasPagamento` são compartilhadas: a tela verifica o perfil e mostra a versão do Cliente.

| Rota | Tela | Descrição |
|------|------|-----------|
| `Home` | ClienteHomeScreen | Destaque, ações rápidas e quiosques disponíveis |
| `Explorar` | ExplorarScreen | Categorias, produtos e quiosques de fornecedores (aba Produtos) |
| `StoreVitrine` / `ProductDetail` | ClienteQuiosqueVitrine / ClienteProductDetail | Vitrine de um quiosque e detalhe do produto |
| `Reservas` | ReservasScreen | Carrinho e finalização (aba Carrinho) |
| `Pedidos` | PedidosScreen | Histórico de pedidos (aba Pedidos) |
| `ClienteQuiosques` | ClienteQuiosquesScreen | Quiosques próprios e resumo do estoque (aba Quiosques) |
| `ClienteQuiosqueForm` | ClienteQuiosqueFormScreen | Criar/editar quiosque: produtos, quantidades e preço de venda |
| `Perfil` | PerfilScreen | Dados, endereços, pagamentos e sair (aba Perfil) |

### Contextos — o que cada um guarda

| Context | Responsabilidade |
|---------|------------------|
| **AuthContext** | Sessão JWT, login/logout, restore ao abrir app, `updateUser` |
| **ProductsContext** | Lista de produtos da empresa logada |
| **QuiosqueContext** | Quiosques da empresa logada (fornecedor ou cliente) |
| **PurchaseCartContext** | Sacola B2B: itens, fornecedor atual, quantidades |
| **ConfirmDialogContext** | Diálogo de confirmação reutilizável (ex.: excluir quiosque) |

**Regra da sacola:** só pode haver produtos de **um fornecedor por vez**. Trocar de fornecedor exige confirmar que a sacola será limpa.

### Componentes-chave criados/unificados

#### `ScreenHeader` — cabeçalho das abas do Fornecedor

Faixa azul sólida com cantos inferiores arredondados, no mesmo layout do cabeçalho do Cliente:

```
┌──────────────────────────────────────────────┐
│ [☰] QuickStock                [ação] [🔔]    │  ← menu, logo, ação extra e sino
│ Olá, {empresa}!                              │  ← saudação (só na Home)
│ Título da aba / subtítulo                    │
│ [ busca opcional ]                           │
╰──────────────────────────────────────────────╯
```

- Props principais: `title`, `subtitle`, `showGreeting`, `rightSlot` (ex.: botão "Gráficos"), `overlap` (primeiro card sobe sobre o cabeçalho) e `inset` (compensa a margem do contêiner).
- `BackTitleHeader` é a versão das telas internas: voltar, logo centralizada e título.
- `TabScreenLayout` junta cabeçalho e conteúdo e aceita `headerContent` (ex.: campo de busca).
- `BrandMark` desenha a logo "QuickStock".

#### `BottomTabBar` — barra inferior por perfil

Barra própria (sem `@react-navigation/bottom-tabs`), preenchida na cor do perfil com ícones brancos:

| Perfil | Abas |
|--------|------|
| Fornecedor | Início · Quiosques · Produtos · Vendas · Ajustes |
| Cliente (`ClienteTabBar`) | Início · Produtos · Carrinho (com badge) · Pedidos · Quiosques · Perfil |

#### `HamburgerButton` — menu lateral do Fornecedor (Modal)

Itens do menu:
- Início
- Quiosques
- Endereços
- Configurações
- Sair (logout)

Implementado como **Modal** (70% da largura), sem Drawer Navigator.

#### Outros componentes importantes

| Componente | Função |
|------------|--------|
| `HeaderActions` | Calendário, sino de notificações, ícone da sacola |
| `NotificationsModal` | Lista notificações; tap navega para Cart ou StoreVitrine |
| `EnderecoFormModal` | Cadastro de endereço com busca ViaCEP |
| `ProductFormModal` | Criar/editar produto + upload de foto |
| `BarracaFormModal` | Criar/editar quiosque + alocar estoque |
| `RemoteImage` | Imagem remota com fallback (iniciais coloridas) |
| `CustomInput` / `CustomButton` | Inputs e botões padronizados |

### Services (camada HTTP)

| Arquivo | Domínio |
|---------|---------|
| `authService.ts` | Login, cadastro, perfil |
| `productService.ts` | CRUD produtos + upload |
| `barracaService.ts` | CRUD quiosques + estoque |
| `marketplaceService.ts` | Fornecedores, vitrine, pedidos |
| `formaPagamentoService.ts` | Formas de pagamento salvas |
| `enderecoService.ts` | Endereços de entrega |
| `financeiroService.ts` | Resumo financeiro |
| `notificacaoService.ts` | Notificações |
| `cartaoPagamentoService.ts` | Cartões salvos (bandeira, final e validade) |
| `pixChaveService.ts` | Chaves Pix (guardadas no aparelho) |
| `http.ts` | Tratamento de resposta e mensagens de erro da API |
| `sessionStorage.ts` | Persistência do token (AsyncStorage) |

### Configuração da API (`src/config/api.ts`)

```typescript
// Host detectado automaticamente:
// - Android emulador: 10.0.2.2
// - iOS / web: localhost
// - Dispositivo físico: IP do debugger Expo

API_BASE_URL = `http://${host}:8080`
```

### Identidade visual

Os dois perfis seguem **o mesmo layout**, e cada um tem **a sua cor**:

| Elemento | Cliente | Fornecedor |
|----------|---------|------------|
| Cor principal | Amarelo `#F8B125` (`CLIENTE_COLORS`) | Azul-marinho `#123B6D` (`COMPANY_COLORS`) |
| Cabeçalho | Faixa sólida com cantos arredondados, logo, título e subtítulo | Igual, com menu ☰ |
| Barra inferior | Preenchida em amarelo, ícones brancos | Preenchida em azul, ícones brancos |
| Logo | "Quick" branco + "Stock" escuro | "Quick" branco + "Stock" dourado |

- Cards brancos com sombra suave e botões em formato pílula.
- Telas de login e cadastro: identidade própria (azul e dourado).
- Ícones: Ionicons e Feather (@expo/vector-icons).

---

## 6. Fluxos principais (passo a passo)

### 6.1 Cadastro e login

```
Welcome
  ├── "Criar conta" → RegisterScreen
  │     └── POST /api/cadastro (empresa + usuário)
  │           └── volta para Welcome com mensagem de sucesso
  │
  └── "Entrar" → LoginScreen
        └── POST /api/usuarios/login
              └── salva JWT no AsyncStorage (@quickstock_session)
                    └── AuthContext → telas autenticadas
```

**Ao reabrir o app:** `loadSession()` → `GET /api/usuarios/me` → restaura sessão ou desloga.

### 6.2 Marketplace → compra → acompanhamento (Fornecedor)

> O Cliente segue o mesmo caminho pelas telas dele: aba Produtos (`Explorar`) → vitrine do quiosque → detalhe → aba Carrinho (`Reservas`) → aba Pedidos.

```
CartScreen (lista fornecedores + últimos pedidos)
  │
  ▼ tap em fornecedor
StoreVitrineScreen (grid de produtos)
  │
  ▼ tap em produto
ProductDetailScreen (escolhe quantidade → "Adicionar à sacola")
  │
  ▼ PurchaseCartContext.addItem()
SacolaScreen
  ├── revisar itens
  ├── selecionar endereço (API + AsyncStorage)
  ├── selecionar forma de pagamento (API)
  ├── ver total = subtotal + R$ 7,00 (taxa entrega)
  └── "Finalizar pedido" → POST /api/solicitacoes-compra
        │
        ▼
PedidoAcompanhamentoScreen
  ├── timeline visual (3 etapas)
  └── polling a cada 5 segundos (GET /api/solicitacoes-compra/{id})
        └── após ~20s status muda para "em_rota"
```

### 6.3 Gestão de produtos

```
BottomTabBar → aba Produtos
  └── ManageProductsScreen (AddItem)
        ├── listar produtos da empresa
        ├── criar/editar via ProductFormModal
        ├── upload de imagem (expo-image-picker → POST /api/produtos/upload)
        └── excluir produto
```

### 6.4 Gestão de quiosques

```
BottomTabBar → aba Quiosques
  └── QuiosqueScreen
        ├── listar quiosques (cards expansíveis)
        ├── criar/editar via BarracaFormModal
        ├── alocar quantidade de cada produto do catálogo
        └── remover com confirmação
```

### 6.5 Configurações e formas de pagamento

```
Aba Ajustes (ou Menu ☰ → Configurações)
  └── editar nome, e-mail, senha, telefone
        └── PUT /api/usuarios/{id} + PUT /api/empresas/{id}

Formas de pagamento (Sacola ou Perfil do Cliente)
  └── CRUD: PIX, crédito, débito, dinheiro + apelido
        └── usado na SacolaScreen na hora do checkout
```

### 6.6 Notificações

```
Header → ícone sino
  └── NotificationsModal
        ├── GET /api/notificacoes?empresaCompradoraId={id}
        ├── tipos: compra, promocao, oferta
        ├── "lidas" controladas localmente (AsyncStorage)
        └── tap:
              ├── tipo compra → CartScreen
              └── com fornecedorId → StoreVitrineScreen
```

### 6.7 Quiosques do cliente

```
ClienteTabBar → aba Quiosques
  └── ClienteQuiosquesScreen
        ├── resumo: un. compradas · nos quiosques · livres
        ├── lista de quiosques (aviso se passar do estoque)
        └── "Novo quiosque" / tap no card
              └── ClienteQuiosqueFormScreen
                    ├── nome do quiosque
                    ├── por produto comprado: "N de M disponíveis",
                    │   "Você pagou R$ X", quantidade e preço de venda
                    └── "Salvar quiosque"
                          ├── PUT /api/produtos/{id}   (preço de venda alterado)
                          └── POST/PUT /api/barracas   (empresaId do cliente)
```

**Regra principal:** a soma de um produto em todos os quiosques não passa do que o cliente comprou (`disponível = estoque − quantidade nos outros quiosques`). As regras ficam em `src/utils/estoqueQuiosque.ts` e têm 22 testes unitários.

**Premissas que dependem do backend** (não validadas sem o servidor): os itens de pedidos entregues viram produtos da empresa do cliente, com estoque; e `/api/barracas` aceita quiosques de empresas do tipo cliente.

---

## 7. Integrações externas

| Serviço | URL | Uso no app |
|---------|-----|------------|
| **ViaCEP** | `https://viacep.com.br/ws/{cep}/json/` | Auto-preencher endereço no cadastro |
| **ui-avatars.com** | fallback de avatar | Quando imagem de produto/fornecedor falha |
| **picsum.photos** | capas de fornecedores | Seed do backend (MarketplaceDataFixRunner) |

---

## 8. O que é real vs. demonstração (mock)

Seja transparente na apresentação sobre o que está 100% integrado e o que é placeholder.

### Totalmente integrado com API

- Login, cadastro, sessão JWT
- CRUD produtos, quiosques, estoque
- Quiosques do cliente (sobre a API existente; ver premissas em 6.7)
- Marketplace, vitrine, sacola, checkout
- Acompanhamento de pedido (polling + timer 20s)
- Endereços, formas de pagamento
- Notificações (conteúdo gerado pelo backend)
- Estatísticas na aba "Estatísticas" do CardsScreen

### Parcialmente mock / placeholder

| Tela/Elemento | Situação |
|---------------|----------|
| Home — cards financeiros (R$ 600 / R$ 900) | Valores fixos na UI |
| Home — gráfico donut | Estático, não vem da API |
| Cards — aba "Carteira" | Dados fictícios |
| Financeiro backend | Mix: compras reais + lucros/gastos sintéticos |
| Notificações "lidas" | Só no dispositivo (AsyncStorage), backend não marca |
| Chaves Pix | Guardadas só no aparelho (AsyncStorage) |
| Contas `cliente@teste.com` / `fornecedor@teste.com` (senha `1234`) | Entram sem backend, só para navegar pelas telas |

---

## 9. Decisões técnicas importantes

### Por que React Context em vez de Redux?

O estado do app é moderado (auth, produtos, quiosques, sacola). Context API é suficiente para o MVP e reduz complexidade.

### Por que tab bar custom em vez de `@react-navigation/bottom-tabs`?

Permite **uma barra diferente por perfil** (5 abas no Fornecedor, 6 no Cliente), barra preenchida na cor do perfil e badge no carrinho, sem as limitações do componente nativo de tabs.

### Por que Modal para menu em vez de Drawer Navigator?

Implementação mais simples, controle total do layout (70% largura, animação), sem dependência extra de gesture handler para drawer.

### Por que polling de 5s no pedido?

Simula tracking em tempo real sem WebSocket. Adequado para demo acadêmica; em produção usaria push notification ou SSE.

### Por que timer de 20s no backend?

Permite demonstrar a transição de status **ao vivo** na apresentação, sem precisar de um operador liberando o pedido manualmente.

### Por que cadastro unificado?

Antes havia fluxo separado (AccountType → RegisterCompany → RegisterUser). Foi simplificado para **uma tela** (`RegisterScreen`) → melhor UX. As telas antigas foram removidas do código.

### Por que o mesmo layout com cores diferentes por perfil?

Quem conhece um perfil reconhece o outro (mesma posição de cabeçalho, abas, cards e botões), e a cor deixa claro em qual perfil se está. As cores ficam centralizadas em `theme.ts` (`CLIENTE_COLORS` e `COMPANY_COLORS`).

### Por que os quiosques do cliente foram feitos só no app?

Reaproveitam a API de quiosques (`/api/barracas`) e os produtos que o backend cria quando o pedido é entregue, sem endpoint novo. As regras de estoque ficaram no app, como funções puras testáveis.

### Limitações conhecidas (cite na banca se perguntarem)

1. JWT não protege todos os endpoints globalmente.
2. Parte do financeiro é sintética.
3. `HomeScreen` → `ProductDetail` sem fornecedorId não adiciona à sacola corretamente.
4. Imagens em `/uploads/` podem precisar de config extra para servir estaticamente.
5. Quiosques do cliente dependem de o backend lançar as compras entregues no estoque do comprador.
6. O preço de venda do cliente é gravado no produto, então vale para todos os quiosques dele.

---

## 10. Roteiro sugerido para apresentação

### Estrutura (~15–20 min)

| Tempo | Bloco | O que mostrar |
|-------|-------|---------------|
| 2 min | **Introdução** | Problema, persona, visão geral do QuickStock |
| 3 min | **Arquitetura** | Diagrama mobile ↔ API ↔ PostgreSQL; dois domínios (gestão + marketplace) |
| 2 min | **Backend** | Entidades, endpoints principais, JWT, seeds |
| 8 min | **Demo ao vivo** | Fluxo completo (ver roteiro abaixo) |
| 3 min | **Destaques técnicos** | Layout único com cor por perfil, sacola 1 fornecedor, quiosques do cliente com testes, polling, timer demo |
| 2 min | **Conclusão** | O que funciona, limitações, próximos passos |

### Roteiro da demo ao vivo (ordem recomendada)

**Parte 1 — Fornecedor (azul)**

1. **Login** com o usuário fornecedor demo
2. **Início** — saudação, estoque e ações rápidas
3. **Aba Produtos** — cadastrar/editar um produto
4. **Aba Quiosques** — estoque por filial
5. **Aba Vendas** — resumo e gráficos

**Parte 2 — Cliente (amarelo)**

6. **Login** com o usuário cliente demo — mostrar que o layout é o mesmo, com outra cor
7. **Aba Produtos** — abrir um quiosque de fornecedor e adicionar 2–3 itens
8. **Aba Carrinho** — endereço, forma de pagamento e finalizar
9. **Acompanhamento** — aguardar ~20s e mostrar o status mudando para "Em rota"
10. **Aba Quiosques** — com um pedido entregue, montar um quiosque: quantidade dentro do disponível e preço de venda

### Frases-chave para a apresentação

> "O QuickStock integra gestão de estoque local com compras B2B de distribuidoras, tudo em um único app mobile."

> "A arquitetura segue camadas: telas → contexts → services → API REST → banco PostgreSQL."

> "O fluxo de compra replica a experiência de apps de delivery: marketplace, sacola, checkout e rastreamento em tempo quasi-real."

> "Para a demo acadêmica, implementamos um timer que simula a liberação do pedido em 20 segundos."

> "O que o cliente compra pelo app vira estoque dos quiosques dele para vender em eventos."

---

## 11. Perguntas que a banca pode fazer

### Sobre arquitetura

**P: Por que separar Mobile e BackEnd em repositórios diferentes?**  
R: Permite times independentes, deploy separado, e o backend pode servir outros clientes (web, outro app) no futuro.

**P: Como o app sabe onde está o backend?**  
R: `src/config/api.ts` detecta o host (emulador Android usa `10.0.2.2`, iOS usa `localhost`, dispositivo físico usa IP do Expo).

**P: Onde fica o token de autenticação?**  
R: AsyncStorage, chave `@quickstock_session`. Enviado como `Authorization: Bearer {token}` nas requisições autenticadas.

### Sobre negócio

**P: Por que só um fornecedor por sacola?**  
R: Simplifica logística e checkout — cada pedido B2B é com um único fornecedor, como em apps de delivery por loja.

**P: Como o cliente monta um quiosque?**
R: Na aba Quiosques, escolhe quanto de cada produto comprado vai para o quiosque e o preço de venda. O app impede passar do que ele tem livre, descontando o que já está nos outros quiosques.

**P: O projeto tem testes automatizados?**
R: Sim, testes unitários (Jest) das regras de estoque dos quiosques do cliente, rodados com `npm test`. Não há testes de integração ou ponta a ponta.

**P: O que acontece após finalizar o pedido?**  
R: API cria `SolicitacaoCompra` com status `aguardando_liberacao`. Após 20s (demo), muda para `em_rota`. App faz polling a cada 5s.

### Sobre segurança

**P: Todos os endpoints exigem login?**  
R: Não — é um MVP. Apenas `/api/usuarios/me` valida JWT. Os services validam `empresaId` nos parâmetros. Em produção, adicionar Spring Security com filter global.

**P: Como as senhas são armazenadas?**  
R: BCrypt hash no banco, nunca em texto plano.

### Sobre dados

**P: Os dados de fornecedores são reais?**  
R: São seeds fictícios (distribuidoras de bebidas em Caruaru) para demonstração. Inseridos via `data.sql` e runners Java.

**P: O financeiro é real?**  
R: Parcialmente — compras mensais vêm de pedidos reais; lucros e alguns gráficos usam dados sintéticos para encher a UI.

---

## 12. Como rodar o projeto

### Pré-requisitos

- Node.js + npm
- Java 17 + Maven
- PostgreSQL rodando com banco `quickstock`
- Expo Go ou emulador Android/iOS

### Backend

```bash
cd QuickStock-BackEnd
# Configurar application.properties se necessário (usuário/senha PG)
mvn spring-boot:run
# API disponível em http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html
```

### Mobile

```bash
cd Mobile
npm install
npx expo start
# Escanear QR code (Expo Go) ou pressionar 'a' (Android) / 'i' (iOS) / 'w' (navegador)
npm test   # testes unitários
```

Sem backend, dá para navegar pelas telas com `cliente@teste.com` ou `fornecedor@teste.com` (senha `1234`); as listas ficam vazias.

### Checklist antes da apresentação

- [ ] PostgreSQL rodando
- [ ] Backend iniciado (porta 8080)
- [ ] App conectando (verificar host no emulador/dispositivo)
- [ ] Usuários de teste (cliente e fornecedor) com senha conhecida
- [ ] Um pedido do cliente já entregue, para demonstrar os quiosques do cliente
- [ ] Formas de pagamento cadastradas (ou usar seed)
- [ ] Endereço cadastrado (ou usar seed)
- [ ] Desativar "Commit Attribution" no Cursor se for commitar ao vivo

---

## 13. Histórico de evolução (o que foi feito)

Resumo cronológico das principais entregas implementadas:

### Fase 1 — Autenticação e base

- Telas Welcome, Login, Register
- Cadastro unificado (`POST /api/cadastro`)
- JWT + sessão persistida (AsyncStorage)
- AuthContext com restore automático
- Tema visual (gradientes, cores QuickStock)

### Fase 2 — Gestão interna

- CRUD de produtos com upload de imagem
- CRUD de quiosques com estoque por produto
- ProductsContext e QuiosqueContext
- HomeScreen com catálogo da empresa

### Fase 3 — Marketplace B2B

- Listagem de fornecedores (`CartScreen`)
- Vitrine por fornecedor (`StoreVitrineScreen`)
- Detalhe de produto + sacola (`PurchaseCartContext`)
- Checkout completo (`SacolaScreen`): endereço, pagamento, taxa entrega
- API: marketplace, solicitações de compra, endereços

### Fase 4 — Pós-compra e notificações

- Timeline de pedido (`PedidoAcompanhamentoScreen`)
- Polling a cada 5 segundos
- Timer demo no backend (20s → em_rota)
- Notificações com modal e deep link

### Fase 5 — Perfil e pagamentos

- Configurações (editar usuário e empresa)
- Formas de pagamento salvas (CRUD)
- Integração sacola ↔ formas cadastradas
- API: `FormaPagamentoSalva`, seeds

### Fase 6 — Navegação e UX unificada

- `ScreenHeader` padronizado em todas as telas
- Saudação + calendário só na Home
- `BottomTabBar` com 7 ações + FAB central (+)
- Menu hambúrguer: Quiosque, Formas pagamento, Configurações, Sair
- Ícone carteira → Formas de pagamento (não mais AddItem)
- Botão (+) central → cadastro de produtos

### Fase 7 — Financeiro e estatísticas

- API financeiro com resumo mensal
- CardsScreen com aba Estatísticas (gráficos reais da API)
- Seeds financeiros para demo

### Fase 8 — Perfis Cliente e Fornecedor

- Escolha de perfil no cadastro (`Cli_For`)
- Fluxo próprio do Cliente: Início, Produtos (`Explorar`), Carrinho (`Reservas`), Pedidos e Perfil
- `ClienteTabBar` e telas do cliente

### Fase 9 — Quiosques do cliente e layout unificado

- Quiosques do cliente montados com as compras recebidas (`ClienteQuiosques`, `ClienteQuiosqueForm`)
- Regras de estoque em `utils/estoqueQuiosque.ts` com 22 testes (Jest)
- Mesmo layout nos dois perfis, com cor por perfil (amarelo e azul-marinho)
- Barra inferior do Fornecedor com 5 abas (substitui a barra de 7 ícones com FAB)
- Remoção de código morto (telas antigas de cadastro, `Vitrine` e dependências sem uso)

---

## Glossário rápido

| Termo | Significado |
|-------|-------------|
| **Quiosque** | Ponto de venda / filial da empresa |
| **Sacola** | Carrinho de compra B2B (checkout) |
| **Cart** | Tela de marketplace (lista fornecedores) |
| **Fornecedor** | Empresa DISTRIBUIDOR ou PLATAFORMA |
| **Solicitação de compra** | Pedido B2B formalizado na API |
| **Seed** | Dado inicial inserido automaticamente no banco |
| **JWT** | Token JSON Web Token para autenticação |
| **Polling** | Consulta repetida à API em intervalo fixo |
| **Perfil** | Cliente ou Fornecedor, escolhido no cadastro |
| **Quiosque do cliente** | Quiosque montado pelo cliente com o que comprou, para vender em eventos |

---

## Links úteis

- Repositório Mobile: https://github.com/LuanSantos26/Mobile
- Repositório Mobile (Marcelo): https://github.com/marcelo435/Mobile
- Repositório BackEnd: https://github.com/LuanSantos26/QuickStock-BackEnd
- ViaCEP: https://viacep.com.br/
- Expo docs: https://docs.expo.dev/
- Spring Boot docs: https://spring.io/projects/spring-boot

---

*Documento gerado para estudo e apresentação acadêmica do projeto QuickStock. Última atualização: outubro/2026.*
