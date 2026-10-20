/**
 * Gerador da Documentação Oficial QuickStock (ABNT + DOCX)
 * Executar: node gerar_documentacao.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "..");
const DIAGRAMAS_DIR = path.join(DOCS_DIR, "diagramas");
const OUTPUT_DOCX = path.join(DOCS_DIR, "DOCUMENTACAO_OFICIAL_QUICKSTOCK.docx");
const OUTPUT_MD = path.join(DOCS_DIR, "DOCUMENTACAO_OFICIAL_QUICKSTOCK.md");

const FONT = "Times New Roman";
const SIZE = 24; // 12pt
const cm = (n) => Math.round(n * 567);

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: SIZE,
    bold: opts.bold,
    italics: opts.italics,
  });
}

function para(text, opts = {}) {
  const children = Array.isArray(text)
    ? text
    : [run(text, opts)];
  return new Paragraph({
    children,
    spacing: { line: 360, after: opts.after ?? 120 },
    indent: opts.noIndent ? undefined : { firstLine: cm(1.25) },
    alignment: opts.center
      ? AlignmentType.CENTER
      : opts.alignment ?? AlignmentType.JUSTIFIED,
    heading: opts.heading,
    pageBreakBefore: opts.pageBreakBefore,
  });
}

function heading1(text) {
  return para(text.toUpperCase(), {
    heading: HeadingLevel.HEADING_1,
    noIndent: true,
    after: 240,
    alignment: AlignmentType.LEFT,
  });
}

function heading2(text) {
  return para(text, {
    heading: HeadingLevel.HEADING_2,
    noIndent: true,
    after: 200,
    alignment: AlignmentType.LEFT,
  });
}

function heading3(text) {
  return para(text, {
    heading: HeadingLevel.HEADING_3,
    noIndent: true,
    after: 160,
    alignment: AlignmentType.LEFT,
  });
}

function bullet(text) {
  return new Paragraph({
    children: [run(`• ${text}`)],
    spacing: { line: 360, after: 80 },
    indent: { left: cm(1.5), firstLine: cm(0.5) },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function caption(text) {
  return para(text, { center: true, noIndent: true, after: 240, italics: true });
}

function loadImage(name) {
  const p = path.join(DIAGRAMAS_DIR, name);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

function imageParagraph(filename, width = 500, height = 300) {
  const data = loadImage(filename);
  if (!data) {
    return para(`[Diagrama: ${filename} — gere com mermaid-cli]`, {
      noIndent: true,
      italics: true,
    });
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new ImageRun({
        data,
        transformation: { width, height },
        type: "png",
      }),
    ],
  });
}

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
          children: [para(h, { noIndent: true, bold: true, after: 0 })],
        })
    ),
  });
  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
              children: [para(String(cell), { noIndent: true, after: 0 })],
            })
        ),
      })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

const PHYSICAL_TABLES = [
  {
    name: "perfis",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do perfil"],
      ["nome", "VARCHAR(50)", "NOT NULL, UNIQUE", "Nome do perfil (ex.: Admin)"],
      ["descricao", "VARCHAR(200)", "NULL", "Descrição do perfil"],
    ],
  },
  {
    name: "empresas",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador da empresa"],
      ["nome", "VARCHAR(150)", "NOT NULL", "Razão social ou nome fantasia"],
      ["cnpj", "VARCHAR(18)", "NOT NULL, UNIQUE", "CNPJ da empresa"],
      ["telefone", "VARCHAR(20)", "NULL", "Telefone de contato"],
      ["tipo", "VARCHAR(20)", "DEFAULT 'COMPRADOR'", "COMPRADOR, DISTRIBUIDOR ou PLATAFORMA"],
      ["descricao", "VARCHAR(300)", "NULL", "Descrição da empresa"],
      ["logo_url", "VARCHAR(500)", "NULL", "URL do logotipo"],
      ["capa_url", "VARCHAR(500)", "NULL", "URL da imagem de capa"],
      ["criado_em", "TIMESTAMP", "AUTO", "Data de criação do registro"],
    ],
  },
  {
    name: "usuarios",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do usuário"],
      ["nome", "VARCHAR(100)", "NOT NULL", "Nome completo"],
      ["email", "VARCHAR(150)", "NOT NULL, UNIQUE", "E-mail de login"],
      ["senha_hash", "VARCHAR", "NOT NULL", "Senha criptografada (BCrypt)"],
      ["perfil_id", "BIGINT", "FK → perfis", "Perfil de acesso"],
      ["empresa_id", "BIGINT", "FK → empresas", "Empresa vinculada"],
      ["ativo", "INTEGER", "DEFAULT 1", "1 = ativo, 0 = inativo"],
      ["criado_em", "TIMESTAMP", "AUTO", "Data de cadastro"],
    ],
  },
  {
    name: "produtos",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do produto"],
      ["empresa_id", "BIGINT", "FK → empresas", "Empresa proprietária do catálogo"],
      ["nome", "VARCHAR(150)", "NOT NULL", "Nome do produto"],
      ["preco_venda", "NUMERIC(10,2)", "NOT NULL", "Preço de venda"],
      ["unidade", "VARCHAR(20)", "NOT NULL", "Unidade (UN, CX, etc.)"],
      ["descricao", "VARCHAR(500)", "NULL", "Descrição do produto"],
      ["imagem_url", "VARCHAR(500)", "NULL", "URL da imagem"],
      ["ativo", "INTEGER", "DEFAULT 1", "1 = ativo, 0 = inativo"],
    ],
  },
  {
    name: "eventos",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do evento"],
      ["empresa_id", "BIGINT", "FK → empresas", "Empresa organizadora"],
      ["nome", "VARCHAR(150)", "NOT NULL", "Nome do evento"],
      ["data_inicio", "DATE", "NOT NULL", "Data de início"],
      ["data_fim", "DATE", "NOT NULL", "Data de término"],
      ["status", "VARCHAR(20)", "DEFAULT 'planejado'", "Status do evento"],
    ],
  },
  {
    name: "barracas",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do quiosque"],
      ["evento_id", "BIGINT", "FK → eventos", "Evento vinculado"],
      ["nome", "VARCHAR(100)", "NOT NULL", "Nome do ponto de venda"],
      ["responsavel_id", "BIGINT", "FK → usuarios", "Usuário responsável"],
      ["ativa", "INTEGER", "DEFAULT 1", "1 = ativa, 0 = desativada"],
    ],
  },
  {
    name: "estoque_barraca",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do registro"],
      ["barraca_id", "BIGINT", "FK → barracas", "Quiosque"],
      ["produto_id", "BIGINT", "FK → produtos", "Produto"],
      ["quantidade", "NUMERIC(10,3)", "NOT NULL", "Quantidade em estoque"],
      ["atualizado_em", "TIMESTAMP", "AUTO", "Última atualização"],
      ["—", "—", "UNIQUE(barraca_id, produto_id)", "Um produto por quiosque"],
    ],
  },
  {
    name: "pedido",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do pedido PDV"],
      ["barraca_id", "BIGINT", "FK → barracas", "Quiosque de origem"],
      ["operador_id", "BIGINT", "FK → usuarios", "Operador do pedido"],
      ["valor_total", "NUMERIC(10,2)", "DEFAULT 0", "Valor total do pedido"],
      ["status", "VARCHAR(20)", "DEFAULT 'aberto'", "Status do pedido"],
      ["criado_em", "TIMESTAMP", "AUTO", "Data de abertura"],
    ],
  },
  {
    name: "itens_pedido",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do item"],
      ["pedido_id", "BIGINT", "FK → pedido", "Pedido PDV"],
      ["produto_id", "BIGINT", "FK → produtos", "Produto vendido"],
      ["quantidade", "NUMERIC(10,3)", "NOT NULL", "Quantidade vendida"],
      ["preco_unitario", "NUMERIC(10,2)", "NOT NULL", "Preço unitário"],
      ["subtotal", "NUMERIC(10,2)", "NOT NULL", "Subtotal do item"],
    ],
  },
  {
    name: "pagamentos",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do pagamento"],
      ["pedido_id", "BIGINT", "FK → pedido", "Pedido PDV"],
      ["metodo", "VARCHAR(20)", "NOT NULL", "pix, credito, debito, dinheiro"],
      ["valor", "NUMERIC(10,2)", "NOT NULL", "Valor pago"],
      ["status", "VARCHAR(20)", "DEFAULT 'pendente'", "Status do pagamento"],
    ],
  },
  {
    name: "enderecos_entrega",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do endereço"],
      ["empresa_id", "BIGINT", "FK → empresas", "Empresa compradora"],
      ["apelido", "VARCHAR(80)", "NOT NULL", "Apelido (ex.: Matriz)"],
      ["logradouro", "VARCHAR(150)", "NOT NULL", "Rua ou avenida"],
      ["numero", "VARCHAR(20)", "NOT NULL", "Número"],
      ["complemento", "VARCHAR(80)", "NULL", "Complemento"],
      ["bairro", "VARCHAR(80)", "NOT NULL", "Bairro"],
      ["cidade", "VARCHAR(80)", "NOT NULL", "Cidade"],
      ["uf", "VARCHAR(2)", "NOT NULL", "Estado (UF)"],
      ["cep", "VARCHAR(9)", "NOT NULL", "CEP"],
      ["principal", "BOOLEAN", "DEFAULT false", "Endereço principal"],
    ],
  },
  {
    name: "formas_pagamento_salvas",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador"],
      ["empresa_id", "BIGINT", "FK → empresas", "Empresa compradora"],
      ["tipo", "VARCHAR(20)", "NOT NULL", "pix, credito, debito, dinheiro"],
      ["apelido", "VARCHAR(80)", "NOT NULL", "Apelido da forma"],
      ["principal", "BOOLEAN", "DEFAULT false", "Forma principal"],
    ],
  },
  {
    name: "solicitacoes_compra",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador da solicitação"],
      ["empresa_compradora_id", "BIGINT", "FK → empresas", "Empresa que compra"],
      ["empresa_fornecedora_id", "BIGINT", "FK → empresas", "Distribuidora"],
      ["usuario_solicitante_id", "BIGINT", "FK → usuarios", "Usuário solicitante"],
      ["valor_total", "NUMERIC(10,2)", "NOT NULL", "Total com taxa"],
      ["status", "VARCHAR(20)", "NOT NULL", "Status do pedido B2B"],
      ["metodo_pagamento", "VARCHAR(20)", "NULL", "Forma de pagamento"],
      ["taxa_entrega", "NUMERIC(10,2)", "DEFAULT 0", "Taxa de entrega"],
      ["endereco_resumo", "VARCHAR(300)", "NULL", "Resumo do endereço"],
      ["cep, logradouro, numero...", "VARCHAR", "NULL", "Endereço desnormalizado"],
      ["criado_em", "TIMESTAMP", "AUTO", "Data da solicitação"],
    ],
  },
  {
    name: "itens_solicitacao_compra",
    cols: [
      ["id", "BIGINT", "PK, IDENTITY", "Identificador do item"],
      ["solicitacao_id", "BIGINT", "FK → solicitacoes_compra", "Solicitação B2B"],
      ["produto_id", "BIGINT", "FK → produtos", "Produto solicitado"],
      ["quantidade", "NUMERIC(10,3)", "NOT NULL", "Quantidade"],
      ["preco_unitario", "NUMERIC(10,2)", "NOT NULL", "Preço unitário"],
      ["subtotal", "NUMERIC(10,2)", "NOT NULL", "Subtotal"],
    ],
  },
];

function buildPhysicalModelSection() {
  const blocks = [
    heading3("3.3.3 Modelo físico"),
    para(
      "O modelo físico descreve a implementação concreta no PostgreSQL 18, gerenciada pelo Hibernate com ddl-auto=update. O script data.sql popula perfis, empresas distribuidoras e produtos para demonstração. A seguir, o dicionário de dados de cada tabela."
    ),
  ];
  for (const t of PHYSICAL_TABLES) {
    blocks.push(
      para(`Tabela: ${t.name}`, { noIndent: true, bold: true, after: 80 }),
      makeTable(
        ["Coluna", "Tipo", "Restrições", "Descrição"],
        t.cols
      ),
      para("", { after: 160, noIndent: true })
    );
  }
  return blocks;
}

function buildCoverSection() {
  return [
    para("[PREENCHER: NOME DA INSTITUIÇÃO DE ENSINO]", { center: true, noIndent: true, after: 400 }),
    para("[PREENCHER: NOME DO AUTOR]", { center: true, noIndent: true, after: 800 }),
    para("QUICKSTOCK", { center: true, noIndent: true, bold: true, after: 120 }),
    para("Sistema mobile de gestão de estoque e marketplace B2B para o setor de bebidas", {
      center: true,
      noIndent: true,
      after: 800,
    }),
    para("[PREENCHER: CIDADE]", { center: true, noIndent: true, after: 80 }),
    para("[PREENCHER: ANO]", { center: true, noIndent: true }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function buildTitlePageSection() {
  return [
    para("[PREENCHER: NOME DO AUTOR]", { center: true, noIndent: true, after: 600 }),
    para("QUICKSTOCK", { center: true, noIndent: true, bold: true, after: 120 }),
    para("Sistema mobile de gestão de estoque e marketplace B2B para o setor de bebidas", {
      center: true,
      noIndent: true,
      after: 600,
    }),
    para("Documentação técnica oficial", { center: true, noIndent: true, after: 800 }),
    para("[PREENCHER: CIDADE]", { center: true, noIndent: true, after: 80 }),
    para("[PREENCHER: ANO]", { center: true, noIndent: true }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function buildMainContent() {
  return [
    // SUMÁRIO
    para("SUMÁRIO", { center: true, noIndent: true, bold: true, after: 240 }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({ children: [new PageBreak()] }),

    // 1 INTRODUÇÃO
    heading1("1 Introdução"),
    para(
      "O comércio de bebidas e atacado enfrenta desafios recorrentes na gestão de estoque em múltiplos pontos de venda e na reposição de mercadorias junto a distribuidoras. Processos manuais, planilhas dispersas e a falta de integração entre controle interno e compras externas dificultam a operação de bares, revendas e empreendedores que operam quiosques em eventos."
    ),
    para(
      "O QuickStock foi desenvolvido como resposta a esse cenário: uma solução composta por aplicativo mobile (React Native / Expo) e API REST (Spring Boot), integrados a um banco de dados PostgreSQL. O sistema permite que empresas compradoras gerenciem catálogo de produtos, quiosques com estoque por filial, comprem de distribuidoras via marketplace integrado, acompanhem pedidos e configurem endereços e formas de pagamento."
    ),
    heading2("1.1 Objetivo geral"),
    para(
      "Desenvolver e documentar um sistema mobile integrado a backend para gestão de estoque e compras B2B no setor de bebidas, oferecendo interface intuitiva e API REST escalável."
    ),
    heading2("1.2 Objetivos específicos"),
    bullet("Implementar cadastro unificado de empresa e usuário com autenticação JWT."),
    bullet("Disponibilizar CRUD de produtos, quiosques e estoque por ponto de venda."),
    bullet("Construir marketplace B2B com vitrine, sacola, checkout e rastreamento de pedidos."),
    bullet("Permitir que o cliente monte quiosques próprios para eventos a partir das compras recebidas."),
    bullet("Modelar e persistir dados em PostgreSQL com integridade referencial."),
    bullet("Documentar arquitetura, frontend, backend e modelagem de dados conforme normas ABNT."),
    heading2("1.3 Justificativa"),
    para(
      "A digitalização do controle de estoque e das compras entre empresas reduz erros operacionais, agiliza reposição e aproxima a experiência do usuário de aplicativos de delivery já consolidados no mercado. O QuickStock unifica, em um único app, gestão interna e compras externas, agregando valor acadêmico e prático ao demonstrar integração mobile-backend-banco de dados."
    ),
    heading2("1.4 Escopo"),
    para(
      "Este documento abrange a arquitetura do sistema, o frontend mobile, o backend API, a modelagem conceitual, lógica e física do banco de dados, além de limitações conhecidas e referências bibliográficas. Inclui testes unitários das regras de estoque dos quiosques do cliente. Não inclui manual de implantação em produção nem testes de integração ou ponta a ponta."
    ),

    // 2 METODOLOGIA
    heading1("2 Metodologia e arquitetura"),
    para(
      "O desenvolvimento seguiu abordagem incremental, com entregas por domínio funcional: autenticação, gestão interna (produtos e quiosques), marketplace B2B, checkout, acompanhamento de pedidos e configurações. A comunicação entre camadas utiliza HTTP/JSON na porta 8080."
    ),
    heading2("2.1 Stack tecnológica"),
    makeTable(
      ["Camada", "Tecnologia", "Versão"],
      [
        ["Mobile", "Expo / React Native / TypeScript", "54 / 0.81 / 5.9"],
        ["Backend", "Spring Boot / Java", "3.4.0 / 17"],
        ["Banco de dados", "PostgreSQL", "18.x"],
        ["ORM", "Spring Data JPA / Hibernate", "6.6"],
        ["Autenticação", "JWT (jjwt) + BCrypt", "0.12.6"],
        ["Testes (mobile)", "Jest + jest-expo", "29.7 / 54"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    heading2("2.2 Arquitetura cliente-servidor"),
    imageParagraph("arquitetura-sistema.png", 520, 200),
    caption("Figura 1 – Arquitetura geral do sistema QuickStock"),
    para(
      "O aplicativo mobile organiza-se em telas (screens), contexts para estado global, services para chamadas HTTP e componentes reutilizáveis. O backend segue camadas Controller → Service → Repository → Entity. O PostgreSQL armazena dados persistentes; imagens de produtos ficam em uploads/produtos/ no servidor."
    ),
    heading2("2.3 Repositórios"),
    bullet("Mobile: https://github.com/LuanSantos26/Mobile"),
    bullet("Mobile (versão com quiosques do cliente e novo layout): https://github.com/marcelo435/Mobile"),
    bullet("BackEnd: https://github.com/LuanSantos26/QuickStock-BackEnd"),

    // 3 DESENVOLVIMENTO
    heading1("3 Desenvolvimento"),

    // 3.1 FRONTEND
    heading2("3.1 Frontend mobile"),
    para(
      "O frontend QuickStock é um aplicativo Expo 54 com React Native 0.81 e TypeScript. A navegação utiliza React Navigation (Native Stack) com gate de autenticação: usuários não autenticados acessam Welcome, Login e Register; autenticados acessam o stack principal. O app atende dois perfis, escolhidos no cadastro: Cliente (comerciante que compra de fornecedores) e Fornecedor (distribuidora que vende e gerencia o catálogo). Cada perfil tem telas e barra inferior próprias, com o mesmo layout e cores diferentes."
    ),
    heading3("3.1.1 Estrutura de pastas"),
    makeTable(
      ["Pasta", "Função"],
      [
        ["src/screens/", "Telas da aplicação"],
        ["src/components/", "Componentes reutilizáveis (ScreenHeader, BottomTabBar, modais)"],
        ["src/context/", "Estado global (Auth, Products, Quiosque, PurchaseCart)"],
        ["src/services/", "Integração REST com a API"],
        ["src/config/api.ts", "URL base e helper de imagens"],
        ["src/navigation/", "Rotas de autenticação e principais, e tipos das rotas"],
        ["src/utils/", "Funções puras (regras de estoque dos quiosques, máscaras, datas) e testes em __tests__/"],
        ["src/theme/theme.ts", "Paletas por perfil (CLIENTE_COLORS, COMPANY_COLORS), fontes e espaçamentos"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    heading3("3.1.2 Contextos e providers"),
    makeTable(
      ["Context", "Responsabilidade"],
      [
        ["AuthContext", "Sessão JWT, login, logout, restore e updateUser"],
        ["ProductsContext", "Catálogo de produtos da empresa logada"],
        ["QuiosqueContext", "Quiosques da empresa logada (fornecedor ou cliente)"],
        ["PurchaseCartContext", "Sacola B2B (um fornecedor por vez)"],
        ["ConfirmDialogContext", "Diálogo de confirmação reutilizável (ex.: excluir quiosque)"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    heading3("3.1.3 Telas principais"),
    para("Telas do perfil Fornecedor:", { noIndent: true, after: 80 }),
    makeTable(
      ["Rota", "Tela", "Função"],
      [
        ["Welcome / Login / Register", "Autenticação", "Acesso, cadastro unificado e escolha de perfil"],
        ["Home", "Início", "Saudação, estoque, ações rápidas e resumo financeiro"],
        ["Quiosque", "Quiosques", "CRUD de pontos de venda e estoque"],
        ["AddItem", "Produtos", "CRUD do catálogo"],
        ["EmpresaVendas / EmpresaGraficos", "Vendas", "Resumo de vendas e gráficos"],
        ["Configuracoes", "Ajustes", "Edição de usuário, senha e empresa"],
        ["Logistica / Camioneiros / CadastroCamioneiros", "Logística", "Entregas e caminhoneiros"],
        ["Cart / StoreVitrine / ProductDetail / Sacola", "Compra B2B", "Marketplace, vitrine, detalhe e checkout"],
        ["PedidoAcompanhamento", "Tracking", "Timeline com polling a cada 5 s"],
        ["Cards / FormasPagamento / Enderecos", "Conta", "Financeiro, formas de pagamento e endereços"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    para("Telas do perfil Cliente:", { noIndent: true, after: 80 }),
    makeTable(
      ["Rota", "Tela", "Função"],
      [
        ["Home", "Início", "Destaque, ações rápidas e quiosques disponíveis"],
        ["Explorar", "Produtos", "Categorias, produtos e quiosques de fornecedores"],
        ["StoreVitrine / ProductDetail", "Vitrine e detalhe", "Produtos de um quiosque e adição ao carrinho"],
        ["Reservas", "Carrinho", "Itens, endereço e finalização do pedido"],
        ["Pedidos / PedidoAcompanhamento", "Pedidos", "Histórico e acompanhamento"],
        ["ClienteQuiosques / ClienteQuiosqueForm", "Quiosques", "Quiosques próprios montados com as compras recebidas"],
        ["Perfil / Configuracoes / Enderecos / FormasPagamento", "Perfil", "Dados, endereços e pagamentos"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    heading3("3.1.4 Componentes e navegação"),
    para(
      "Os dois perfis seguem o mesmo layout: cabeçalho sólido na cor do perfil, com cantos inferiores arredondados, logo, título e subtítulo; cards brancos; botões em formato pílula; e barra inferior preenchida na cor do perfil, com ícones brancos. O Cliente usa amarelo (#F8B125, CLIENTE_COLORS) e o Fornecedor usa azul-marinho (#123B6D, COMPANY_COLORS). No Fornecedor, o ScreenHeader monta o cabeçalho das abas principais (menu, logo, notificações e saudação na Home), o BackTitleHeader monta o das telas internas (voltar e título) e o TabScreenLayout reúne cabeçalho e conteúdo. O BottomTabBar mostra cinco abas para o Fornecedor (Início, Quiosques, Produtos, Vendas e Ajustes) e delega ao ClienteTabBar as seis abas do Cliente (Início, Produtos, Carrinho, Pedidos, Quiosques e Perfil). O menu lateral do Fornecedor (HamburgerButton) abre Início, Quiosques, Endereços, Configurações e Sair."
    ),
    imageParagraph("fluxo-navegacao.png", 480, 360),
    caption("Figura 2 – Fluxo principal de navegação do aplicativo"),
    heading3("3.1.5 Integração com a API"),
    para(
      "Nove services encapsulam chamadas REST: authService, productService, barracaService, marketplaceService, enderecoService, formaPagamentoService, financeiroService, notificacaoService e sessionStorage (AsyncStorage). A URL base é resolvida em api.ts conforme o ambiente (localhost, 10.0.2.2 no Android ou IP do Expo Go). O token JWT é persistido na chave @quickstock_session."
    ),

    heading3("3.1.6 Quiosques do cliente"),
    para(
      "O cliente pode montar quiosques próprios para vender em eventos, usando como estoque o que comprou e recebeu pelo app. A funcionalidade foi feita só no aplicativo, reaproveitando a API existente: os quiosques são gravados em /api/barracas com o empresaId do cliente, e o estoque disponível vem dos produtos da empresa do cliente (ProductsContext), que o backend preenche quando um pedido é entregue."
    ),
    makeTable(
      ["Regra", "Como funciona"],
      [
        ["Divisão do estoque", "A soma de um produto em todos os quiosques não pode passar do estoque comprado. Disponível = estoque − quantidade nos outros quiosques."],
        ["Preço de venda", "Informado pelo cliente para cada produto com quantidade; gravado no produto (vale para todos os quiosques dele)."],
        ["Preço pago (referência)", "Preço unitário do pedido entregue mais recente com item de mesmo nome; não aparece se não houver correspondência."],
        ["Validação", "Nome obrigatório, ao menos um produto, quantidade dentro do disponível e preço maior que zero quando há quantidade."],
        ["Aviso", "A lista sinaliza 'Estoque acima do disponível' quando um quiosque passa do que o cliente tem."],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    para(
      "As regras ficam em src/utils/estoqueQuiosque.ts, como funções puras, cobertas por 22 testes unitários (Jest). Duas premissas dependem do backend e não foram validadas sem o servidor: que os itens de pedidos entregues viram produtos da empresa compradora, com estoque, e que /api/barracas aceita quiosques de empresas do tipo cliente."
    ),

    // 3.2 BACKEND
    heading2("3.2 Backend API"),
    para(
      "O backend QuickStock-BackEnd é uma API REST monolítica Spring Boot 3.4 em Java 17, executada na porta 8080. Organiza-se em 17 controllers, 11 services, 17 repositories e 14 entidades JPA mapeadas para PostgreSQL."
    ),
    heading3("3.2.1 Camadas"),
    bullet("Controller: expõe endpoints REST sob /api/*"),
    bullet("Service: regras de negócio (marketplace, compras, quiosques, JWT)"),
    bullet("Repository: acesso via Spring Data JPA"),
    bullet("Entity / DTO: persistência e transferência de dados"),
    heading3("3.2.2 Endpoints principais"),
    makeTable(
      ["Domínio", "Endpoints", "Métodos"],
      [
        ["Autenticação", "/api/cadastro, /api/usuarios/login, /api/usuarios/me", "POST, GET"],
        ["Produtos", "/api/produtos, /api/produtos/upload", "GET, POST, PUT, DELETE"],
        ["Quiosque", "/api/barracas, /api/barracas/{id}/estoque", "GET, POST, PUT, DELETE"],
        ["Marketplace", "/api/marketplace/fornecedores", "GET"],
        ["Pedidos B2B", "/api/solicitacoes-compra", "GET, POST"],
        ["Endereços", "/api/enderecos", "GET, POST"],
        ["Pagamentos", "/api/formas-pagamento", "GET, POST, DELETE"],
        ["Notificações", "/api/notificacoes", "GET"],
        ["Financeiro", "/api/financeiro/resumo", "GET"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    heading3("3.2.3 Segurança e autenticação"),
    para(
      "O login retorna token JWT (validade 24 h). Senhas são hasheadas com BCrypt. Apenas GET /api/usuarios/me valida o token Bearer de forma explícita; a maioria dos endpoints confia em validação de empresaId nos services. Em produção, recomenda-se Spring Security com filtro global."
    ),
    heading3("3.2.4 Regras de negócio relevantes"),
    bullet("Solicitação de compra: valida fornecedor (DISTRIBUIDOR ou PLATAFORMA), impede auto-compra, exige endereço e forma de pagamento válidos."),
    bullet("Status inicial do pedido B2B: aguardando_liberacao; após 20 segundos (demo), transição automática para em_rota."),
    bullet("Quiosque: cria evento padrão Operação principal se inexistente; estoque sincronizado por produto da empresa."),
    bullet("Seeds: data.sql e ApplicationRunners populam distribuidoras, produtos, endereços e formas de pagamento demo."),

    // 3.3 BANCO DE DADOS
    heading2("3.3 Banco de dados"),
    para(
      "O banco quickstock no PostgreSQL contém 14 tabelas derivadas das entidades JPA. Os relacionamentos são unidirecionais (@ManyToOne no lado filho). A entidade Empresa possui papel dual: COMPRADOR, DISTRIBUIDOR ou PLATAFORMA, permitindo que a mesma tabela represente compradores e fornecedores."
    ),
    heading3("3.3.1 Modelo conceitual"),
    para(
      "O modelo conceitual representa entidades e relacionamentos em linguagem de negócio, independente de tipos físicos. Três domínios se destacam: (1) Cadastro — Perfil, Empresa, Usuário; (2) Operação presencial (PDV) — Evento, Quiosque, Estoque, Pedido, Item e Pagamento; (3) Marketplace B2B — Produto, Solicitação de Compra, Item de Solicitação, Endereço de Entrega e Forma de Pagamento Salva."
    ),
    imageParagraph("er-conceitual.png", 520, 400),
    caption("Figura 3 – Modelo conceitual entidade-relacionamento"),
    heading3("3.3.2 Modelo lógico"),
    para(
      "O modelo lógico traduz o conceitual para o modelo relacional: 14 tabelas, chaves primárias surrogate (id BIGINT IDENTITY), chaves estrangeiras explícitas e constraint UNIQUE em estoque_barraca (barraca_id, produto_id). A tabela solicitacoes_compra referencia empresas duas vezes (compradora e fornecedora) e desnormaliza endereço de entrega no momento da compra."
    ),
    imageParagraph("er-logico.png", 520, 420),
    caption("Figura 4 – Modelo lógico relacional"),
    makeTable(
      ["Domínio", "Tabelas"],
      [
        ["Cadastro", "perfis, empresas, usuarios"],
        ["PDV / Quiosque", "eventos, barracas, estoque_barraca, pedido, itens_pedido, pagamentos"],
        ["Marketplace B2B", "produtos, solicitacoes_compra, itens_solicitacao_compra"],
        ["Checkout", "enderecos_entrega, formas_pagamento_salvas"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    para("Dicionário de status relevantes:", { noIndent: true, after: 80 }),
    makeTable(
      ["Contexto", "Valores"],
      [
        ["Empresa.tipo", "COMPRADOR, DISTRIBUIDOR, PLATAFORMA"],
        ["SolicitacaoCompra.status", "aguardando_liberacao, em_rota, entregue, cancelada"],
        ["Pedido.status (PDV)", "aberto, cancelado"],
        ["Pagamento.metodo / FormaPagamento.tipo", "pix, credito, debito, dinheiro"],
      ]
    ),
    para("", { after: 200, noIndent: true }),
    ...buildPhysicalModelSection(),

    // 4 CONCLUSÃO
    heading1("4 Conclusão"),
    para(
      "O QuickStock entrega uma solução funcional de gestão de estoque e marketplace B2B, integrando aplicativo mobile Expo, API Spring Boot e banco PostgreSQL. Foram implementados cadastro unificado com perfis Cliente e Fornecedor, CRUD de produtos e quiosques, quiosques do cliente montados a partir das compras recebidas, fluxo completo de compra (vitrine → sacola → pedido → acompanhamento), configurações de perfil, formas de pagamento e notificações, com identidade visual consistente entre os perfis."
    ),
    para(
      "Como limitações conhecidas, destacam-se: autenticação JWT parcial (sem filtro global), dados mock na Home e aba Carteira do app, notificações geradas em tempo real sem tabela dedicada, resumo financeiro parcialmente sintético no backend e quiosques do cliente dependentes de o backend lançar as compras entregues no estoque do comprador. Trabalhos futuros incluem Spring Security completo, ampliação dos testes automatizados, push notifications e eliminação de dados mock."
    ),

    // REFERÊNCIAS
    heading1("Referências"),
    para("ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: Informação e documentação — Trabalhos acadêmicos — Apresentação. Rio de Janeiro: ABNT, 2011.", { noIndent: true }),
    para("ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: Informação e documentação — Referências — Elaboração. Rio de Janeiro: ABNT, 2018.", { noIndent: true }),
    para("EXPO. Documentação oficial do Expo. Disponível em: https://docs.expo.dev/. Acesso em: 13 jun. 2026.", { noIndent: true }),
    para("META. React Native — Learn once, write anywhere. Disponível em: https://reactnative.dev/. Acesso em: 13 jun. 2026.", { noIndent: true }),
    para("SPRING. Spring Boot Reference Documentation. Disponível em: https://spring.io/projects/spring-boot. Acesso em: 13 jun. 2026.", { noIndent: true }),
    para("POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL Documentation. Disponível em: https://www.postgresql.org/docs/. Acesso em: 13 jun. 2026.", { noIndent: true }),
    para("VIACEP. Webservice de consulta de CEP. Disponível em: https://viacep.com.br/. Acesso em: 13 jun. 2026.", { noIndent: true }),
  ];
}

async function main() {
  const doc = new Document({
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE },
          paragraph: { spacing: { line: 360 } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { font: FONT, size: SIZE, bold: true },
          paragraph: { spacing: { before: 240, after: 240 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: { font: FONT, size: SIZE, bold: true },
          paragraph: { spacing: { before: 200, after: 160 } },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          run: { font: FONT, size: SIZE, bold: true },
          paragraph: { spacing: { before: 160, after: 120 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: cm(2), right: cm(2), bottom: cm(2), left: cm(3) },
          },
        },
        children: buildCoverSection(),
      },
      {
        properties: {
          page: {
            margin: { top: cm(2), right: cm(2), bottom: cm(2), left: cm(3) },
          },
        },
        children: buildTitlePageSection(),
      },
      {
        properties: {
          page: {
            margin: { top: cm(2), right: cm(2), bottom: cm(2), left: cm(3) },
            pageNumbers: { start: 1, formatType: "decimal" },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
                ],
              }),
            ],
          }),
        },
        children: buildMainContent(),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_DOCX, buffer);
  console.log(`Documento gerado: ${OUTPUT_DOCX}`);

  // Markdown versionável simplificado
  fs.writeFileSync(
    OUTPUT_MD,
    "# QuickStock — Documentação Oficial\n\nDocumento Word gerado em DOCUMENTACAO_OFICIAL_QUICKSTOCK.docx\n\nAtualize executando: cd docs/scripts && npm install && node gerar_documentacao.mjs\n"
  );
  console.log(`Markdown auxiliar: ${OUTPUT_MD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
