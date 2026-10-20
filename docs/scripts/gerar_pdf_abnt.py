# -*- coding: utf-8 -*-
"""Gera a documentacao tecnica do Stock4event Mobile em PDF (ABNT NBR 14724)."""
from __future__ import annotations

import os
from reportlab.lib.colors import Color, HexColor, black, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
    Flowable,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Group

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "DOCUMENTACAO_STOCK4EVENT_MOBILE.pdf"))
NAVY = HexColor("#0E2A5C")
GOLD = HexColor("#F8B125")
GRAY = HexColor("#4A5568")
LINE = HexColor("#CBD5E0")


def register_times():
    windir = os.environ.get("WINDIR", r"C:\Windows")
    fonts = os.path.join(windir, "Fonts")
    mapping = [
        ("TimesNewRoman", "times.ttf"),
        ("TimesNewRoman-Bold", "timesbd.ttf"),
        ("TimesNewRoman-Italic", "timesi.ttf"),
        ("TimesNewRoman-BoldItalic", "timesbi.ttf"),
    ]
    ok = True
    for name, file in mapping:
        path = os.path.join(fonts, file)
        if os.path.isfile(path):
            pdfmetrics.registerFont(TTFont(name, path))
        else:
            ok = False
    if ok:
        pdfmetrics.registerFontFamily(
            "TimesNewRoman",
            normal="TimesNewRoman",
            bold="TimesNewRoman-Bold",
            italic="TimesNewRoman-Italic",
            boldItalic="TimesNewRoman-BoldItalic",
        )
        return "TimesNewRoman"
    return "Times-Roman"


FONT = register_times()
FONT_B = "TimesNewRoman-Bold" if FONT == "TimesNewRoman" else "Times-Bold"
FONT_I = "TimesNewRoman-Italic" if FONT == "TimesNewRoman" else "Times-Italic"


def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(
        "CapaInst", fontName=FONT, fontSize=12, leading=18, alignment=TA_CENTER, spaceAfter=6,
    ))
    s.add(ParagraphStyle(
        "CapaTitulo", fontName=FONT_B, fontSize=16, leading=22, alignment=TA_CENTER, spaceBefore=40, spaceAfter=12,
    ))
    s.add(ParagraphStyle(
        "CapaSub", fontName=FONT, fontSize=12, leading=18, alignment=TA_CENTER, spaceAfter=8,
    ))
    s.add(ParagraphStyle(
        "CapaRodape", fontName=FONT, fontSize=12, leading=18, alignment=TA_CENTER,
    ))
    s.add(ParagraphStyle(
        "NormalABNT", fontName=FONT, fontSize=12, leading=18, alignment=TA_JUSTIFY,
        firstLineIndent=1.25 * cm, spaceAfter=10,
    ))
    s.add(ParagraphStyle(
        "NormalSemRecuo", fontName=FONT, fontSize=12, leading=18, alignment=TA_JUSTIFY, spaceAfter=10,
    ))
    s.add(ParagraphStyle(
        "H1", fontName=FONT_B, fontSize=12, leading=18, alignment=TA_LEFT,
        spaceBefore=18, spaceAfter=12,
    ))
    s.add(ParagraphStyle(
        "H2", fontName=FONT_B, fontSize=12, leading=18, alignment=TA_LEFT, spaceBefore=14, spaceAfter=8,
    ))
    s.add(ParagraphStyle(
        "H3", fontName=FONT_B, fontSize=12, leading=18, alignment=TA_LEFT, spaceBefore=10, spaceAfter=6,
    ))
    s.add(ParagraphStyle(
        "Caption", fontName=FONT, fontSize=10, leading=14, alignment=TA_CENTER, spaceBefore=6, spaceAfter=14,
    ))
    s.add(ParagraphStyle(
        "FonteFig", fontName=FONT_I, fontSize=10, leading=14, alignment=TA_CENTER, spaceAfter=12,
    ))
    s.add(ParagraphStyle(
        "Centro", fontName=FONT, fontSize=12, leading=18, alignment=TA_CENTER, spaceAfter=8,
    ))
    s.add(ParagraphStyle(
        "Ref", fontName=FONT, fontSize=12, leading=18, alignment=TA_LEFT,
        leftIndent=1.25 * cm, firstLineIndent=-1.25 * cm, spaceAfter=10,
    ))
    s.add(ParagraphStyle(
        "TOC", fontName=FONT, fontSize=12, leading=20, alignment=TA_LEFT, spaceAfter=2,
    ))
    s.add(ParagraphStyle(
        "Cell", fontName=FONT, fontSize=10, leading=13, alignment=TA_LEFT,
    ))
    s.add(ParagraphStyle(
        "CellB", fontName=FONT_B, fontSize=10, leading=13, alignment=TA_LEFT,
    ))
    s.add(ParagraphStyle(
        "CodeBlock", fontName="Courier", fontSize=8, leading=11, alignment=TA_LEFT, spaceAfter=8,
    ))
    return s


ST = styles()


class FigureDrawing(Flowable):
    def __init__(self, drawing: Drawing, width, height):
        super().__init__()
        self.drawing = drawing
        self.width = width
        self.height = height

    def wrap(self, aw, ah):
        return self.width, self.height

    def draw(self):
        self.drawing.drawOn(self.canv, 0, 0)


def box(d, x, y, w, h, label, fill=NAVY, fs=8):
    d.add(Rect(x, y, w, h, fillColor=fill, strokeColor=NAVY, strokeWidth=0.6, rx=3, ry=3))
    lines = label.split("\n")
    start = y + h / 2 + (len(lines) - 1) * 5
    for i, ln in enumerate(lines):
        d.add(String(x + w / 2, start - i * 11, ln, fontName=FONT_B, fontSize=fs, fillColor=white, textAnchor="middle"))


def arrow(d, x1, y1, x2, y2):
    d.add(Line(x1, y1, x2, y2, strokeColor=GRAY, strokeWidth=1.2))
    ang = 0
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    L = 7
    d.add(Polygon([
        x2, y2,
        x2 - L * math.cos(ang - 0.4), y2 - L * math.sin(ang - 0.4),
        x2 - L * math.cos(ang + 0.4), y2 - L * math.sin(ang + 0.4),
    ], fillColor=GRAY, strokeColor=GRAY, strokeWidth=0.3))


def fig_arquitetura():
    d = Drawing(460, 170)
    box(d, 10, 55, 85, 70, "Telas\nReact Native")
    box(d, 125, 55, 85, 70, "Contexts\ne hooks")
    box(d, 240, 55, 85, 70, "Services\nHTTP/JSON")
    box(d, 355, 90, 95, 50, "API REST\n:8081")
    box(d, 355, 20, 95, 50, "PostgreSQL", fill=HexColor("#1B4F72"))
    arrow(d, 95, 90, 125, 90)
    arrow(d, 210, 90, 240, 90)
    arrow(d, 325, 95, 355, 110)
    arrow(d, 402, 90, 402, 70)
    return FigureDrawing(d, 460, 170)


def fig_auth():
    d = Drawing(460, 150)
    coords = [
        (8, 80, "Animacao"),
        (100, 80, "Welcome"),
        (192, 115, "Login"),
        (192, 45, "Cli_For"),
        (292, 45, "Cadastro"),
        (385, 80, "App\nprincipal"),
    ]
    for x, y, t in coords:
        box(d, x, y, 78, 36, t, fs=7)
    arrow(d, 86, 98, 100, 98)
    arrow(d, 178, 105, 192, 125)
    arrow(d, 178, 90, 192, 63)
    arrow(d, 270, 133, 385, 108)
    arrow(d, 270, 63, 292, 63)
    arrow(d, 370, 63, 400, 80)
    return FigureDrawing(d, 460, 150)


def fig_cliente():
    d = Drawing(460, 90)
    labels = ["Inicio", "Produtos", "Carrinho", "Pedidos", "Perfil"]
    for i, lab in enumerate(labels):
        box(d, 12 + i * 90, 25, 78, 42, lab, fill=GOLD if i == 2 else NAVY, fs=8)
        if i < 4:
            arrow(d, 90 + i * 90, 46, 102 + i * 90, 46)
    return FigureDrawing(d, 460, 90)


def fig_pedido():
    d = Drawing(460, 80)
    labels = ["Confirmado", "Em separacao", "A caminho", "Entregue"]
    for i, lab in enumerate(labels):
        box(d, 15 + i * 112, 22, 95, 40, lab, fs=7)
        if i < 3:
            arrow(d, 110 + i * 112, 42, 127 + i * 112, 42)
    return FigureDrawing(d, 460, 80)


def fig_providers():
    d = Drawing(460, 160)
    box(d, 140, 120, 180, 32, "ConfirmDialogProvider", fs=8)
    box(d, 140, 80, 180, 32, "AuthProvider", fs=8)
    box(d, 40, 30, 120, 36, "AuthNavigator", fs=8)
    box(d, 200, 30, 220, 36, "PurchaseCart +\nMainNavigator", fs=7)
    arrow(d, 230, 120, 230, 112)
    arrow(d, 230, 80, 100, 66)
    arrow(d, 230, 80, 310, 66)
    return FigureDrawing(d, 460, 160)


def p(text, style="NormalABNT"):
    return Paragraph(text.replace("\n", "<br/>"), ST[style])


def h1(n, title):
    prefix = f"{n} " if n else ""
    return Paragraph(f"{prefix}{title.upper()}", ST["H1"])


def h2(n, title):
    return Paragraph(f"{n} {title}", ST["H2"])


def h3(n, title):
    return Paragraph(f"{n} {title}", ST["H3"])


def caption(n, text):
    return Paragraph(f"Figura {n} – {text}", ST["Caption"])


def fonte(text="Elaborado pelos autores."):
    return Paragraph(f"Fonte: {text}", ST["FonteFig"])


def table(headers, rows, col_w=None):
    head = [Paragraph(h, ST["CellB"]) for h in headers]
    data = [head]
    for row in rows:
        data.append([Paragraph(str(c), ST["Cell"]) for c in row])
    t = Table(data, colWidths=col_w, hAlign="CENTER")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), FONT_B),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, HexColor("#F7F8FB")]),
    ]))
    return t


class NumberedCanvas:
    """Mixin via callback."""


def make_doc():
    story = []

    # CAPA
    story.append(Spacer(1, 1.2 * cm))
    story.append(p("INSTITUIÇÃO DE ENSINO SUPERIOR", "CapaInst"))
    story.append(p("CURSO DE COMPUTAÇÃO / SISTEMAS DE INFORMAÇÃO", "CapaInst"))
    story.append(Spacer(1, 3.2 * cm))
    story.append(p("LUAN FEITOSA SANTOS<br/>JOSÉ ÍTALO S. C. DANTAS<br/>MARCELO VITOR VIANA DA SILVA<br/>LETICIA VIVIANE PEREIRA DA SILVA", "CapaInst"))
    story.append(Spacer(1, 2.6 * cm))
    story.append(p("STOCK4EVENT MOBILE", "CapaTitulo"))
    story.append(p("Documentação técnica do aplicativo de gestão de estoque e compras B2B no setor de bebidas", "CapaSub"))
    story.append(Spacer(1, 4.5 * cm))
    story.append(p("2026", "CapaRodape"))
    story.append(PageBreak())

    # FOLHA DE ROSTO
    story.append(Spacer(1, 1.2 * cm))
    story.append(p("LUAN FEITOSA SANTOS<br/>JOSÉ ÍTALO S. C. DANTAS<br/>MARCELO VITOR VIANA DA SILVA<br/>LETICIA VIVIANE PEREIRA DA SILVA", "CapaInst"))
    story.append(Spacer(1, 2.4 * cm))
    story.append(p("STOCK4EVENT MOBILE", "CapaTitulo"))
    story.append(p("Documentação técnica do aplicativo de gestão de estoque e compras B2B no setor de bebidas", "CapaSub"))
    story.append(Spacer(1, 1.6 * cm))
    story.append(p(
        "Documentação apresentada como registro do desenvolvimento do cliente móvel do ecossistema Stock4event, "
        "descrevendo arquitetura, fluxos de uso, integração com a API REST e organização do código-fonte.",
        "NormalSemRecuo",
    ))
    story.append(Spacer(1, 3.8 * cm))
    story.append(p("2026", "CapaRodape"))
    story.append(PageBreak())

    # RESUMO
    story.append(h1("", "RESUMO"))
    story.append(p(
        "Este documento descreve o aplicativo Stock4event Mobile, interface cliente do sistema Stock4event, "
        "construída com Expo, React Native e TypeScript. O software atende dois modos de uso após o cadastro: "
        "o perfil de empresa (fornecedor), voltado à operação de estoque, quiosques, marketplace interno e logística; "
        "e o perfil de cliente, voltado à descoberta de quiosques, montagem de pedido, pagamento e acompanhamento de entregas. "
        "A comunicação com o backend ocorre por HTTP/JSON na porta 8081. A sessão é persistida localmente; o carrinho de compras "
        "e o perfil de uso (Cliente, Fornecedor ou ambos) também ficam no dispositivo. O texto organiza a arquitetura em camadas, "
        "os fluxos de autenticação e de negócio, o catálogo de telas, os serviços de API e as decisões de interface. "
        "Não se pretende substituir o contrato da API nem a modelagem física do banco, ambos mantidos no repositório do backend."
    ))
    story.append(p(
        "<b>Palavras-chave:</b> React Native; Expo; comércio B2B; gestão de estoque; aplicativo móvel.",
        "NormalSemRecuo",
    ))
    story.append(Spacer(1, 0.8 * cm))
    story.append(h1("", "ABSTRACT"))
    story.append(p(
        "This document describes the Stock4event Mobile application, the client interface of the Stock4event system, "
        "built with Expo, React Native and TypeScript. After registration the software supports two usage modes: "
        "a supplier/company profile for stock, kiosks, internal marketplace and logistics; and a customer profile "
        "for discovering stores, assembling orders, paying and tracking deliveries. The app talks to the backend over "
        "HTTP/JSON on port 8081. Session data, the shopping cart and the usage profile are stored on the device. "
        "The text covers layered architecture, authentication and business flows, screens, API services and UI decisions."
    ))
    story.append(p(
        "<b>Keywords:</b> React Native; Expo; B2B commerce; inventory management; mobile application.",
        "NormalSemRecuo",
    ))
    story.append(PageBreak())

    # LISTAS
    story.append(h1("", "LISTA DE ILUSTRAÇÕES"))
    for line in [
        "Figura 1 – Arquitetura em camadas do aplicativo e da API",
        "Figura 2 – Encadeamento dos provedores de contexto",
        "Figura 3 – Fluxo de autenticação e entrada no aplicativo autenticado",
        "Figura 4 – Abas do perfil cliente",
        "Figura 5 – Etapas de acompanhamento do pedido",
    ]:
        story.append(p(line, "TOC"))
    story.append(Spacer(1, 0.6 * cm))
    story.append(h1("", "LISTA DE TABELAS"))
    for line in [
        "Tabela 1 – Pacotes principais do projeto",
        "Tabela 2 – Contextos globais",
        "Tabela 3 – Telas do fluxo não autenticado",
        "Tabela 4 – Telas do perfil empresa",
        "Tabela 5 – Telas do perfil cliente",
        "Tabela 6 – Endpoints consumidos pelo aplicativo",
        "Tabela 7 – Chaves de armazenamento local",
    ]:
        story.append(p(line, "TOC"))
    story.append(PageBreak())

    story.append(h1("", "SUMÁRIO"))
    toc = [
        "1 INTRODUÇÃO",
        "    1.1 Objetivo geral",
        "    1.2 Objetivos específicos",
        "    1.3 Justificativa",
        "    1.4 Escopo e limitações",
        "    1.5 Organização do texto",
        "2 TECNOLOGIAS E ORGANIZAÇÃO DO CÓDIGO",
        "    2.1 Stack",
        "    2.2 Estrutura de diretórios",
        "    2.3 Convenções de implementação",
        "3 ARQUITETURA",
        "    3.1 Visão em camadas",
        "    3.2 Provedores e navegação raiz",
        "    3.3 Resolução da URL da API",
        "4 AUTENTICAÇÃO, CADASTRO E SESSÃO",
        "    4.1 Telas iniciais",
        "    4.2 Perfis de cadastro",
        "    4.3 Sessão e perfil de uso",
        "5 OPERAÇÃO DA EMPRESA (FORNECEDOR)",
        "6 EXPERIÊNCIA DO CLIENTE",
        "    6.1 Navegação inferior",
        "    6.2 Compra e carrinho",
        "    6.3 Pedidos e conta",
        "7 SERVIÇOS E INTEGRAÇÃO COM A API",
        "8 PERSISTÊNCIA NO DISPOSITIVO",
        "9 INTERFACE GRÁFICA",
        "10 CONSIDERAÇÕES FINAIS",
        "REFERÊNCIAS",
        "APÊNDICE A – Como executar o projeto",
    ]
    for line in toc:
        story.append(p(line, "TOC"))
    story.append(PageBreak())

    # 1
    story.append(h1("1", "Introdução"))
    story.append(p(
        "O atacado de bebidas opera com reposição frequente, múltiplos pontos de venda e necessidade de conferir "
        "pedido, endereço e pagamento sem recorrer a planilhas paralelas. O Stock4event reúne, no mesmo aplicativo, "
        "a rotina de quem vende (cadastro de produto, quiosque, estoque e logística) e a rotina de quem compra "
        "(catálogo, carrinho, checkout e histórico). O cliente móvel não implementa regras de negócio de servidor: "
        "ele apresenta estados, valida formulários e dispara as rotas já existentes da API."
    ))
    story.append(h2("1.1", "Objetivo geral"))
    story.append(p(
        "Documentar o aplicativo Stock4event Mobile de modo que um leitor técnico consiga compreender o recorte "
        "de cada perfil, a origem dos dados e o caminho de uma ação de tela até o endpoint correspondente."
    ))
    story.append(h2("1.2", "Objetivos específicos"))
    story.append(p(
        "a) descrever a stack Expo 54 / React Native 0.81 / TypeScript e a divisão em screens, services e contexts; "
        "b) registrar o fluxo de autenticação, inclusive escolha de perfil (Cliente, Fornecedor, Cliente e fornecedor); "
        "c) distinguir a navegação da empresa da navegação do cliente; "
        "d) listar os serviços HTTP e o armazenamento local (sessão, carrinho, PIX, perfil de uso); "
        "e) explicitar decisões de interface (navy e dourado no cliente e na autenticação; dourado e creme na operação da empresa)."
    ))
    story.append(h2("1.3", "Justificativa"))
    story.append(p(
        "Sem um mapa do front-end, o backend e o aplicativo divergem com rapidez: telas novas passam a inventar "
        "contratos, e telas antigas deixam de refletir o status real do pedido. A documentação reduz esse descompasso "
        "e serve de base para apresentação acadêmica e para onboarding de quem entra no repositório."
    ))
    story.append(h2("1.4", "Escopo e limitações"))
    story.append(p(
        "O recorte é o repositório do aplicativo (pasta <font face='Courier'>src/</font> e configuração Expo). "
        "O servidor Spring Boot e o esquema PostgreSQL são citados apenas na medida em que o cliente os consome. "
        "Ficam fora: publicação em lojas, pipeline de CI, suíte formal de testes automatizados e o detalhamento jurídico "
        "de LGPD. Há um atalho de desenvolvimento com o usuário <font face='Courier'>admin</font> e senha <font face='Courier'>1234</font>, "
        "que não deve existir em ambiente de produção."
    ))
    story.append(h2("1.5", "Organização do texto"))
    story.append(p(
        "A seção 2 apresenta tecnologias e pastas. A seção 3 trata da arquitetura. A seção 4 cobre login e cadastro. "
        "As seções 5 e 6 separam empresa e cliente. As seções 7 e 8 descrevem API e storage. A seção 9 sintetiza o visual. "
        "A seção 10 encerra. O apêndice A indica como executar o projeto localmente."
    ))

    # 2
    story.append(h1("2", "Tecnologias e organização do código"))
    story.append(h2("2.1", "Stack"))
    story.append(p(
        "O empacotamento é feito pelo Expo SDK 54. A interface usa React 19 e React Native 0.81, com suporte a web "
        "(<font face='Courier'>react-native-web</font>), o que explica a necessidade de diálogos próprios no lugar de "
        "<font face='Courier'>Alert.alert</font> em fluxos críticos, como o encerramento de sessão. A navegação é Native Stack "
        "(React Navigation 7). Ícones vêm de <font face='Courier'>@expo/vector-icons</font>. Gradientes usam "
        "<font face='Courier'>expo-linear-gradient</font>. Imagens de produto passam por "
        "<font face='Courier'>expo-image-picker</font> no cadastro da empresa. Não há Redux: o estado compartilhado está em Context API."
    ))
    story.append(KeepTogether([
        Paragraph("Tabela 1 – Pacotes principais do projeto", ST["Caption"]),
        table(
            ["Pacote", "Função"],
            [
                ["expo ~54", "CLI, fontes, splash, constantes"],
                ["react-native 0.81", "componentes nativos e web"],
                ["@react-navigation/native-stack", "pilha de telas"],
                ["@react-native-async-storage/async-storage", "sessão, carrinho, PIX, perfil"],
                ["expo-linear-gradient", "fundos de cabeçalho"],
                ["typescript ~5.9", "tipagem estática"],
            ],
            [6.2 * cm, 9.5 * cm],
        ),
        fonte(),
    ]))

    story.append(h2("2.2", "Estrutura de diretórios"))
    story.append(Preformatted(
        "src/\n"
        "  components/   UI reutilizável (botão, input, headers, auth, layout)\n"
        "  config/       API_BASE_URL e montagem de URL de imagem\n"
        "  context/      Auth, produtos, quiosque, carrinho, diálogo de confirmação\n"
        "  hooks/        useAppGoBack e auxiliares de área segura\n"
        "  navigation/   AuthNavigator, MainNavigator, tipos da pilha\n"
        "  screens/      uma pasta por tela (hook + estilos quando o volume exige)\n"
        "  services/     fetch tipado por domínio\n"
        "  theme/        cores da empresa e da autenticação\n"
        "  types/        contratos alinhados à API\n"
        "  utils/        máscaras de CEP, CNPJ, cartão, data",
        ST["CodeBlock"],
    ))
    story.append(p(
        "Telas volumosas separam apresentação e regra: por exemplo, <font face='Courier'>useSacola.ts</font> concentra "
        "checkout, enquanto <font face='Courier'>SacolaScreen.tsx</font> só renderiza. No cliente, o mesmo padrão aparece em "
        "<font face='Courier'>usePedidos.ts</font> e <font face='Courier'>useExplorar.ts</font>."
    ))
    story.append(h2("2.3", "Convenções de implementação"))
    story.append(p(
        "O front-end não cria rotas novas no servidor. Quando uma tela precisa de dado que a API ainda não oferece "
        "(chaves PIX locais, perfil de uso, itens do carrinho antes do POST da solicitação), o valor fica no AsyncStorage. "
        "Mensagens de erro de rede são normalizadas em <font face='Courier'>http.ts</font>. Datas e preços usam formatação pt-BR."
    ))

    # 3
    story.append(h1("3", "Arquitetura"))
    story.append(h2("3.1", "Visão em camadas"))
    story.append(p(
        "A tela nunca chama <font face='Courier'>fetch</font> diretamente, salvo exceções históricas. O caminho padrão é "
        "componente → hook ou context → função em <font face='Courier'>services/</font> → <font face='Courier'>parseResponse</font>. "
        "Isso isola mudança de contrato (nome de campo, código HTTP) em um único arquivo por domínio."
    ))
    story.append(KeepTogether([
        fig_arquitetura(),
        caption(1, "Arquitetura em camadas do aplicativo e da API"),
        fonte(),
    ]))
    story.append(h2("3.2", "Provedores e navegação raiz"))
    story.append(p(
        "<font face='Courier'>App.tsx</font> envolve a árvore com Gesture Handler, Safe Area, diálogo de confirmação e autenticação. "
        "<font face='Courier'>AppNavigator</font> espera a hidratação da sessão. Sem token válido, monta <font face='Courier'>AuthNavigator</font>. "
        "Com sessão, envolve <font face='Courier'>MainNavigator</font> em <font face='Courier'>PurchaseCartProvider</font>, "
        "e este por sua vez em <font face='Courier'>ProductsProvider</font> e <font face='Courier'>QuiosqueProvider</font>. "
        "O carrinho, portanto, só existe depois do login; ao sair da conta, o provedor é desmontado."
    ))
    story.append(KeepTogether([
        fig_providers(),
        caption(2, "Encadeamento dos provedores de contexto"),
        fonte(),
    ]))
    story.append(KeepTogether([
        Paragraph("Tabela 2 – Contextos globais", ST["Caption"]),
        table(
            ["Contexto", "Responsabilidade"],
            [
                ["AuthContext", "usuário, token, perfilUso, signIn, signOut, updateUser"],
                ["PurchaseCartContext", "itens da sacola, grupos por fornecedor, total"],
                ["ProductsContext", "lista de produtos da empresa logada"],
                ["QuiosqueContext", "barracas/quiosques da empresa"],
                ["ConfirmDialogContext", "modal de confirmação (web e nativo)"],
            ],
            [5.5 * cm, 10.2 * cm],
        ),
        fonte(),
    ]))
    story.append(h2("3.3", "Resolução da URL da API"))
    story.append(p(
        "<font face='Courier'>src/config/api.ts</font> monta <font face='Courier'>http://{host}:8081</font>. "
        "Em desenvolvimento, o host vem do <font face='Courier'>hostUri</font> do Expo; no emulador Android usa-se 10.0.2.2; "
        "nos demais casos, localhost. Imagens relativas da API são prefixadas por essa base em <font face='Courier'>getImageUrl</font>. "
        "Dispositivo físico na mesma Wi-Fi precisa do IPv4 da máquina, não de localhost."
    ))

    # 4
    story.append(h1("4", "Autenticação, cadastro e sessão"))
    story.append(h2("4.1", "Telas iniciais"))
    story.append(p(
        "A pilha não autenticada começa em <font face='Courier'>Animation</font>: uma fase mostra carrinho e barra de progresso; "
        "a seguinte exibe a marca e o slogan. Em seguida vem Welcome, com Entrar e Criar conta. Login envia e-mail e senha a "
        "<font face='Courier'>POST /api/usuarios/login</font>. Esqueci a senha chama <font face='Courier'>POST /api/usuarios/recuperar-senha</font>. "
        "Criar conta abre a escolha de perfil e só então o formulário de <font face='Courier'>POST /api/cadastro</font>."
    ))
    story.append(KeepTogether([
        fig_auth(),
        caption(3, "Fluxo de autenticação e entrada no aplicativo autenticado"),
        fonte(),
    ]))
    story.append(KeepTogether([
        Paragraph("Tabela 3 – Telas do fluxo não autenticado", ST["Caption"]),
        table(
            ["Rota", "Arquivo", "Papel"],
            [
                ["Animation", "AnimationScreen.tsx", "Splash e carregamento inicial"],
                ["Welcome", "WelcomeScreen.tsx", "Entrar ou criar conta"],
                ["Login", "Login.tsx", "Credenciais"],
                ["ForgotPassword", "ForgotPasswordScreen.tsx", "Redefinição de senha"],
                ["Cli_For", "Cli_For.tsx", "Escolha de perfil"],
                ["Register", "RegisterScreen.tsx", "Dados pessoais e da empresa"],
            ],
            [3.4 * cm, 5.6 * cm, 6.7 * cm],
        ),
        fonte(),
    ]))
    story.append(h2("4.2", "Perfis de cadastro"))
    story.append(p(
        "O tipo <font face='Courier'>PerfilCadastro</font> admite Cliente, Fornecedor e ClienteFornecedor. "
        "Cliente envia nome, CPF (gravado no campo de documento da empresa no payload atual), telefone, e-mail e senha. "
        "Fornecedor envia razão social, CNPJ, telefone, responsável, e-mail e senha. O perfil combinado pede os dois conjuntos. "
        "Após o cadastro, <font face='Courier'>savePerfilUso</font> associa o e-mail ao perfil escolhido no AsyncStorage, "
        "para que o próximo login abra a casca visual correta."
    ))
    story.append(h2("4.3", "Sessão e perfil de uso"))
    story.append(p(
        "O token e o objeto <font face='Courier'>UsuarioLogado</font> ficam em <font face='Courier'>@stock4event_session</font>, "
        "com <font face='Courier'>expiresAt</font>. Na abertura, <font face='Courier'>AuthContext</font> tenta "
        "<font face='Courier'>GET /api/usuarios/me</font>; se o token for legado (<font face='Courier'>legacy:</font>), "
        "a sessão local é reaplicada sem essa chamada. <font face='Courier'>signOut</font> remove o registro e zera usuário, "
        "token e perfil mesmo se o storage falhar. O encerramento no perfil do cliente usa o modal de <font face='Courier'>ConfirmDialog</font>, "
        "porque o alerta nativo não confirma ação de forma confiável no Expo Web."
    ))

    # 5
    story.append(h1("5", "Operação da empresa (fornecedor)"))
    story.append(p(
        "Quando <font face='Courier'>perfilUso</font> não é Cliente, <font face='Courier'>HomeScreen</font> permanece na casca dourada. "
        "A barra inferior leva a início, quiosques, marketplace (Cart), cadastro de produto (botão central), sacola, carteira e cartões. "
        "O menu hamburger abre configurações, formas de pagamento e saída. A Home resume estoque e atalhos financeiros "
        "(<font face='Courier'>/api/financeiro/resumo</font>)."
    ))
    story.append(KeepTogether([
        Paragraph("Tabela 4 – Telas do perfil empresa", ST["Caption"]),
        table(
            ["Rota", "Função"],
            [
                ["Home", "Painel operacional e gráficos"],
                ["Quiosque", "CRUD de barracas e estoque fracionado"],
                ["AddItem", "Cadastro e edição de produtos, upload de imagem"],
                ["Cart", "Marketplace: lista de fornecedores"],
                ["StoreVitrine / ProductDetail", "Catálogo do fornecedor e item"],
                ["Sacola", "Checkout B2B, endereço, pagamento, POST da solicitação"],
                ["PedidoAcompanhamento", "Polling do status até entrega"],
                ["Configuracoes / Enderecos / FormasPagamento / Cards", "Conta, entrega e meios de pagamento"],
                ["EmpresaVendas / Logistica / Camioneiros", "Vendas e frota"],
            ],
            [6.8 * cm, 8.9 * cm],
        ),
        fonte(),
    ]))
    story.append(p(
        "A sacola agrupa itens por <font face='Courier'>fornecedorId</font>. Finalizar dispara uma solicitação por grupo, "
        "com taxa de entrega fixa no cliente (<font face='Courier'>TAXA_ENTREGA</font>). Sucesso limpa o carrinho e abre o acompanhamento. "
        "Produtos creditados no estoque do comprador ocorrem no backend quando o status chega a entregue; o app apenas recarrega a lista."
    ))

    # 6
    story.append(h1("6", "Experiência do cliente"))
    story.append(p(
        "Se <font face='Courier'>perfilUso === 'Cliente'</font>, a Home delega para <font face='Courier'>ClienteHomeScreen</font>. "
        "A barra <font face='Courier'>ClienteTabBar</font> substitui a barra dourada. Cores de referência: fundo de cabeçalho "
        "<font face='Courier'>#0E2A5C</font>, ênfase <font face='Courier'>#F8B125</font>."
    ))
    story.append(h2("6.1", "Navegação inferior"))
    story.append(KeepTogether([
        fig_cliente(),
        caption(4, "Abas do perfil cliente"),
        fonte(),
    ]))
    story.append(p(
        "A aba Carrinho corresponde à rota interna <font face='Courier'>Reservas</font>, para não espalhar rename na pilha. "
        "O distintivo numérico é a soma das quantidades em <font face='Courier'>PurchaseCartContext.itemCount</font>. "
        "Pedidos e o detalhe <font face='Courier'>PedidoAcompanhamento</font> marcam a aba Pedidos como ativa."
    ))
    story.append(KeepTogether([
        Paragraph("Tabela 5 – Telas do perfil cliente", ST["Caption"]),
        table(
            ["Rota", "Tela visível", "Dados"],
            [
                ["Home", "ClienteHome", "fornecedores em destaque"],
                ["Explorar", "Produtos", "busca, categorias, vitrines"],
                ["Reservas", "Carrinho", "itens locais + checkout (useSacola)"],
                ["Pedidos", "Histórico", "GET solicitações-compra"],
                ["PedidoAcompanhamento", "Detalhe", "GET por id, polling"],
                ["Perfil", "Meu perfil", "atalhos de conta"],
                ["Configuracoes", "Dados do cliente", "PUT usuário e empresa"],
                ["Enderecos", "Endereços de entrega", "CRUD /api/enderecos"],
                ["FormasPagamento", "Pagamento", "formas, PIX e cartões"],
            ],
            [4.4 * cm, 4.4 * cm, 6.9 * cm],
        ),
        fonte(),
    ]))
    story.append(h2("6.2", "Compra e carrinho"))
    story.append(p(
        "Explorar e a vitrine <font face='Courier'>ClienteQuiosqueVitrine</font> chamam <font face='Courier'>addItem</font>. "
        "O detalhe <font face='Courier'>ClienteProductDetail</font> informa quantidade e respeita estoque informado pela API. "
        "A tela Carrinho lista grupos “Vendido por”, stepper, exclusão, endereço (entrega ou retirada) e resumo. "
        "Finalizar reutiliza a mesma sequência da Sacola: validação, modal de pagamento e "
        "<font face='Courier'>POST /api/solicitacoes-compra</font>."
    ))
    story.append(h2("6.3", "Pedidos e conta"))
    story.append(p(
        "O histórico filtra em três abas: Realizados (lista completa), Em andamento (status diferente de entregue e cancelada) "
        "e Concluídos (entregue). O código exibido é #QS- concatenado ao identificador. O detalhe desenha o stepper "
        "Pedido confirmado → Em separação → A caminho → Entregue, usando <font face='Courier'>pedido.etapas</font> "
        "ou o conjunto padrão do acompanhamento. Perfil reúne dados do cliente, endereço, pagamento, notificações e saída."
    ))
    story.append(KeepTogether([
        fig_pedido(),
        caption(5, "Etapas de acompanhamento do pedido"),
        fonte(),
    ]))

    # 7
    story.append(h1("7", "Serviços e integração com a API"))
    story.append(p(
        "Os módulos em <font face='Courier'>src/services</font> encapsulam verbos HTTP. A tabela 6 resume o que o aplicativo de fato chama. "
        "PIX de chaves cadastradas no aparelho não replica tabela remota: a lista é local, mas a forma de pagamento PIX em si "
        "é criada em <font face='Courier'>/api/formas-pagamento</font>."
    ))
    story.append(KeepTogether([
        Paragraph("Tabela 6 – Endpoints consumidos pelo aplicativo", ST["Caption"]),
        table(
            ["Método e caminho", "Uso no app"],
            [
                ["POST /api/cadastro", "RegisterScreen"],
                ["POST /api/usuarios/login", "Login"],
                ["POST /api/usuarios/recuperar-senha", "ForgotPassword"],
                ["GET /api/usuarios/me", "restauração de sessão"],
                ["PUT /api/usuarios/{id}", "Dados do cliente / configurações"],
                ["PUT /api/empresas/{id}", "nome, CNPJ, telefone"],
                ["GET/POST /api/produtos", "catálogo da empresa e alta"],
                ["PUT/DELETE /api/produtos/{id}", "edição e exclusão"],
                ["POST /api/produtos/upload", "imagem do produto"],
                ["CRUD /api/barracas", "quiosques e estoque da barraca"],
                ["GET /api/marketplace/fornecedores", "home cliente, explorar, cart"],
                ["GET .../fornecedores/{id}/produtos", "vitrine"],
                ["POST/GET /api/solicitacoes-compra", "checkout e histórico"],
                ["GET .../solicitacoes-compra/{id}", "detalhe com polling"],
                ["CRUD /api/enderecos e GET .../cep/{cep}", "entrega"],
                ["CRUD /api/formas-pagamento", "meios no checkout"],
                ["CRUD /api/cartoes-pagamento", "crédito e débito"],
                ["GET /api/financeiro/resumo", "home da empresa"],
                ["GET /api/notificacoes", "sino e modal"],
                ["GET/POST /api/caminhoneiros e /api/logistica", "módulo de frota"],
            ],
            [7.4 * cm, 8.3 * cm],
        ),
        fonte(),
    ]))

    # 8
    story.append(h1("8", "Persistência no dispositivo"))
    story.append(p(
        "O AsyncStorage evita perda ao fechar o Expo Go. Nenhuma dessas chaves substitui o banco: após o POST da solicitação, "
        "a fonte da verdade do pedido é a API."
    ))
    story.append(KeepTogether([
        Paragraph("Tabela 7 – Chaves de armazenamento local", ST["Caption"]),
        table(
            ["Origem", "Conteúdo"],
            [
                ["sessionStorage.ts", "token, usuário, expiresAt"],
                ["perfilStorage.ts", "mapa e-mail → PerfilCadastro"],
                ["purchaseCartStorage.ts", "itens do carrinho por empresa"],
                ["pixChaveService.ts", "chaves PIX mascaradas por empresaId"],
                ["enderecoService (seleção)", "id do endereço escolhido no checkout"],
            ],
            [5.2 * cm, 10.5 * cm],
        ),
        fonte(),
    ]))

    # 9
    story.append(h1("9", "Interface gráfica"))
    story.append(p(
        "Há duas paletas convivendo de propósito. A autenticação e o perfil cliente usam cabeçalho navy, superfície "
        "<font face='Courier'>#F3F5F8</font> ou <font face='Courier'>#F7F8FB</font> e botão dourado com texto navy "
        "(<font face='Courier'>authTheme.ts</font>, <font face='Courier'>AuthScreenShell</font>, <font face='Courier'>AuthBrand</font>). "
        "A operação da empresa mantém o degradê dourado de <font face='Courier'>theme.ts</font> e a tab bar amarela. "
        "Componentes comuns (<font face='Courier'>CustomButton</font>, <font face='Courier'>CustomInput</font>) foram alinhados "
        "ao formulário claro com ícone navy, inclusive alternância de visibilidade da senha."
    ))
    story.append(p(
        "A ramificação visual ocorre por <font face='Courier'>perfilUso</font> em pontos únicos: Home, barra inferior, "
        "StoreVitrine, ProductDetail e PedidoAcompanhamento. Isso evita duplicar a pilha de navegação e reduz risco de "
        "rota órfã."
    ))

    # 10
    story.append(h1("10", "Considerações finais"))
    story.append(p(
        "O aplicativo cobre o ciclo que o produto se propõe no dispositivo: entrar, escolher como se usa o sistema, "
        "operar estoque ou comprar, pagar e acompanhar. A divisão empresa/cliente é de apresentação e de conjunto de telas, "
        "não de dois binários. O débito técnico mais visível é o cadastro de cliente ainda reutilizar o documento da empresa "
        "no payload de cadastro; qualquer mudança nisso depende de acordo com o backend. Outro ponto de atenção é o atalho admin "
        "em código. Como continuidade, cabem testes de regressão no checkout, mascaramento de dados em logs e o retrato "
        "oficial da API neste mesmo padrão ABNT, em documento separado."
    ))

    story.append(h1("", "Referências"))
    refs = [
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ABNT NBR 14724: informação e documentação — trabalhos acadêmicos — apresentação. 3. ed. Rio de Janeiro: ABNT, 2011.",
        "EXPO. Documentation. Disponível em: https://docs.expo.dev. Acesso em: 27 set. 2026.",
        "META PLATFORMS. React Native. Disponível em: https://reactnative.dev. Acesso em: 27 set. 2026.",
        "REACT NAVIGATION. Native stack navigator. Disponível em: https://reactnavigation.org. Acesso em: 27 set. 2026.",
        "STOCK4EVENT. Repositório do aplicativo móvel. Disponível em: https://github.com/LuanSantos26/Mobile. Acesso em: 27 set. 2026.",
        "STOCK4EVENT. Repositório do backend. Disponível em: https://github.com/LuanSantos26/QuickStock-BackEnd. Acesso em: 27 set. 2026.",
    ]
    for r in refs:
        story.append(Paragraph(r, ST["Ref"]))

    story.append(PageBreak())
    story.append(h1("", "APÊNDICE A – Como executar o projeto"))
    story.append(p(
        "Requisitos: Node.js LTS, Git e o backend Stock4event escutando em 8081. No diretório do aplicativo: "
        "<font face='Courier'>npm install</font> e <font face='Courier'>npx expo start</font>. "
        "A tecla <font face='Courier'>a</font> abre o emulador Android; <font face='Courier'>w</font>, o navegador. "
        "No aparelho físico, o Expo Go deve alcançar o IP da máquina de desenvolvimento. "
        "Os scripts <font face='Courier'>npm run android</font> e <font face='Courier'>npm run ios</font> apenas encapsulam o start direcionado."
    ))
    story.append(p(
        "Este PDF é gerado por <font face='Courier'>docs/scripts/gerar_pdf_abnt.py</font>. Para atualizá-lo: "
        "<font face='Courier'>python docs/scripts/gerar_pdf_abnt.py</font>."
    ))

    return story


def add_page_number(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page > 2:
        canvas.setFont(FONT, 10)
        canvas.setFillColor(black)
        canvas.drawCentredString(A4[0] / 2, 1.2 * cm, str(page - 2))
    canvas.restoreState()


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc = BaseDocTemplate(
        OUT,
        pagesize=A4,
        leftMargin=3 * cm,
        rightMargin=2 * cm,
        topMargin=3 * cm,
        bottomMargin=2 * cm,
        title="Stock4event Mobile — Documentação técnica",
        author="Equipe Stock4event",
        subject="Documentação ABNT do aplicativo Stock4event Mobile",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([
        PageTemplate(id="main", frames=frame, onPage=add_page_number),
    ])
    doc.build(make_doc())
    print(OUT)


if __name__ == "__main__":
    main()
