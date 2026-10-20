# 📱 QuickStock - Mobile App

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

O **QuickStock Mobile** é a interface front-end móvel do ecossistema QuickStock. Desenvolvido com **React Native** e **Expo**, o aplicativo foi projetado para gerenciar estoques descentralizados, vendas em eventos, controle de quiosques e fluxo de pagamentos de forma ágil e intuitiva.

Este aplicativo consome a [API REST do QuickStock Backend](https://github.com/LuanSantos26/QuickStock-BackEnd).

---

## 👥 Perfis de uso

O app tem dois fluxos, escolhidos no cadastro. Os dois seguem o mesmo layout, e cada um tem a sua cor:

| Perfil | Quem é | Cor | Abas da barra inferior |
|---|---|---|---|
| **Cliente** | Comerciante que compra bebidas de fornecedores | Amarelo `#F8B125` | Início, Produtos, Carrinho, Pedidos, Quiosques, Perfil |
| **Fornecedor** | Distribuidora que vende e gerencia o catálogo | Azul-marinho `#123B6D` | Início, Quiosques, Produtos, Vendas, Ajustes |

---

## 🚀 Funcionalidades

* **🔒 Autenticação e Perfis:** Login, cadastro de usuário e empresa, escolha de perfil (Cliente ou Fornecedor).
* **🛍️ Compras do cliente:** Vitrine de fornecedores e quiosques, carrinho, checkout e acompanhamento do pedido.
* **🏕️ Quiosques do cliente:** O cliente monta os próprios quiosques para vender em eventos, usando o que comprou e recebeu pelo app. O total comprado é dividido entre os quiosques, e o cliente define o preço de venda de cada produto.
* **🎪 Quiosques do fornecedor:** Filiais e pontos de venda com estoque por produto.
* **📦 Catálogo do fornecedor:** Cadastro, edição e remoção de produtos com imagem.
* **📊 Vendas e logística:** Resumo de vendas, gráficos, caminhoneiros e status de entrega.
* **💳 Checkout e Pagamentos:** Múltiplas formas de pagamento, Pix e cartões salvos.
* **⚙️ Gestão de Conta:** Dados do usuário e da empresa, endereços de entrega e notificações.

---

## 🛠️ Tecnologias Utilizadas

* **Framework Principal:** React Native 0.81
* **Ecossistema/Build:** Expo 54
* **Linguagem:** TypeScript (modo `strict`)
* **Gerenciamento de Estado:** React Context API (Auth, Products, Quiosque, PurchaseCart, ConfirmDialog)
* **Navegação:** React Navigation (Native Stack) com barras inferiores próprias por perfil
* **Comunicação com API:** Fetch API (`src/config/api.ts` e `src/services/`)
* **Testes:** Jest + jest-expo

---

## 📁 Estrutura do Projeto

```text
📦 mobile
 ┣ 📂 assets/              # Ícones, splash screens e imagens estáticas
 ┣ 📂 docs/                # Documentação técnica, diagramas e especificações
 ┣ 📂 src/
 ┃ ┣ 📂 components/        # Componentes reutilizáveis (cabeçalhos, barras inferiores, modais, cards)
 ┃ ┣ 📂 config/            # Configurações globais (URL base da API)
 ┃ ┣ 📂 context/           # Contextos globais (AuthContext, PurchaseCartContext, etc.)
 ┃ ┣ 📂 hooks/             # Custom hooks do React
 ┃ ┣ 📂 navigation/        # Rotas (AuthNavigator, MainNavigator) e tipos das rotas
 ┃ ┣ 📂 screens/           # Telas; cada uma com Tela.tsx, useTela.ts (lógica) e styles.ts
 ┃ ┣ 📂 services/          # Integrações com o backend e armazenamento local
 ┃ ┣ 📂 theme/             # Paletas (COLORS, CLIENTE_COLORS, COMPANY_COLORS), fontes e espaçamentos
 ┃ ┣ 📂 types/             # Tipos compartilhados
 ┃ ┗ 📂 utils/             # Funções puras (regras de estoque, máscaras, datas, Pix) e seus testes
 ┣ 📜 App.tsx              # Componente raiz da aplicação
 ┣ 📜 app.json             # Configuração do Expo (nome, ícones, splash)
 ┗ 📜 package.json         # Dependências do projeto e scripts
```

---

## ⚙️ Pré-requisitos

* Node.js (versão LTS recomendada)
* Git
* Um emulador Android/iOS configurado, ou o aplicativo **Expo Go** no celular

> **Aviso:** o QuickStock Backend precisa estar rodando (localmente ou hospedado) para o login e os dados funcionarem.

---

## 🚀 Como Executar o Projeto

**1. Clone o repositório**

```bash
git clone https://github.com/marcelo435/Mobile.git
cd Mobile
```

**2. Instale as dependências**

```bash
npm install
```

**3. Confira o endereço da API**

O endereço do backend é resolvido em `src/config/api.ts`: o app usa o IP da máquina que está rodando o Expo, `10.0.2.2` no emulador Android ou `localhost`, sempre na porta `8080`.

> **Dica:** num celular físico, ele precisa estar na mesma rede Wi-Fi da máquina que roda o backend.

**4. Inicie o servidor do Expo**

```bash
npx expo start
```

* Pressione `a` para abrir no emulador Android.
* Pressione `i` para abrir no simulador iOS.
* Pressione `w` para abrir no navegador.
* Ou escaneie o QR Code com o Expo Go.

### Contas de teste locais

Para navegar pelas telas sem backend, use as contas abaixo (senha `1234`). Elas entram direto no app, mas as listas ficam vazias porque não há servidor:

* `cliente@teste.com`: fluxo do Cliente
* `fornecedor@teste.com`: fluxo do Fornecedor

---

## 📑 Scripts Disponíveis

* `npm start`: inicia o empacotador Metro via Expo.
* `npm run android`: abre o app em um emulador Android conectado.
* `npm run ios`: abre o app no simulador iOS (requer macOS).
* `npm run web`: abre o app no navegador.
* `npm test`: roda os testes automatizados (Jest).

---

## 🧪 Testes

As regras de estoque dos quiosques do cliente ficam em `src/utils/estoqueQuiosque.ts`, como funções puras, e são cobertas por testes em `src/utils/__tests__/`:

* quantidade disponível por produto (descontando o que já está em outros quiosques);
* resumo comprado / nos quiosques / livre;
* validação do formulário (nome, quantidade acima do disponível, preço de venda);
* busca do preço pago nos pedidos entregues.

```bash
npm test
```

---

## 💡 Notas de Desenvolvimento

* **Cores por perfil:** as paletas ficam em `src/theme/theme.ts`. Use `CLIENTE_COLORS` nas telas do cliente e `COMPANY_COLORS` nas do fornecedor, em vez de valores soltos.
* **Cabeçalhos do fornecedor:** `ScreenHeader` (abas principais, com menu e sino) e `BackTitleHeader` (telas internas, com voltar). As telas usam o `TabScreenLayout`, que já monta o cabeçalho com título e subtítulo.
* **Imagens:** `imageFallback.ts` e `RemoteImage.tsx` tratam falhas no carregamento das imagens vindas da API.
* **Especificações:** o design dos quiosques do cliente está em [superpowers/specs/2026-10-03-quiosque-cliente-design.md](./superpowers/specs/2026-10-03-quiosque-cliente-design.md).
* **Diagramas:** em `docs/diagramas/` estão a arquitetura, o fluxo de navegação e os modelos de entidade-relacionamento.
* **Cronograma da equipe** (8 semanas / 5 papéis): [CRONOGRAMA_EQUIPE.md](./CRONOGRAMA_EQUIPE.md) · [PDF](./CRONOGRAMA_EQUIPE.pdf)

---

## 👨‍💻 Equipe

* Luan Feitosa Santos
* José Ítalo S. C. Dantas
* Marcelo Vitor Viana da Silva
* Leticia Viviane Pereira da Silva
* José Lucas Luiz da Silva

---

## 📄 Licença

Este projeto é destinado a fins acadêmicos e de aprendizado, podendo ser expandido para utilização comercial mediante adequações futuras.
