# Stock4event — Cronograma da equipe (8 semanas)

Documento de planejamento para conclusão, consolidação e apresentação do **Stock4event** (app mobile Expo + API Spring Boot + PostgreSQL).

**Prazo total:** 8 semanas (2 meses)  
**Início sugerido:** 21/09/2026  
**Encerramento:** 15/11/2026  
**Reunião de alinhamento:** toda segunda-feira, 30 min  
**Revisão de entrega:** toda sexta-feira, 45 min

O sistema já possui base funcional (login, produtos, quiosques, marketplace, sacola, pedidos, pagamentos e home). Este cronograma organiza o que falta fechar, padronizar, testar e apresentar.

---

## 1. Equipe (5 pessoas)

| Papel | Responsabilidade principal | Entrega típica |
|-------|----------------------------|----------------|
| **Líder** | Escopo, prazos, Git, documentação, comunicação com a banca e integração entre as áreas | Ata semanal, checklist de marco, roteiro de demo |
| **Backend** | APIs REST, regras de negócio, JWT, tratamento de erro | Endpoints documentados e estáveis |
| **Frontend** | Telas Expo/React Native, navegação, UX e integração com a API | Telas navegáveis no app |
| **Banco de dados** | Modelo PostgreSQL, migrations, seeds e backups de demo | Scripts SQL e dados de apresentação |
| **Testes** | Plano de testes, casos, regressão e roteiro de homologação | Relatório de bugs e evidências |

Cada pessoa dedica **5 dias úteis por semana**. Tarefas da semana devem caber em **até 20–24 h** de trabalho efetivo por pessoa (cerca de 4–5 h/dia).

---

## 2. Marcos (entregas oficiais)

| Marco | Data | O que precisa estar pronto |
|-------|------|----------------------------|
| **M1 — Baseline estável** | 02/10/2026 | App e API sobem juntos; usuário de demo loga; seed mínimo |
| **M2 — Gestão interna fechada** | 16/10/2026 | Produtos + quiosques + home financeiros consistentes |
| **M3 — Marketplace e checkout** | 30/10/2026 | Compra B2B ponta a ponta (vitrine → sacola → pedido) |
| **M4 — Qualidade e recuperação de senha** | 06/11/2026 | Fluxos críticos testados; esqueceu a senha funcionando |
| **M5 — Entrega final / apresentação** | 14/11/2026 | Demo gravável, docs atualizadas, relatório de testes |

---

## 3. Cronograma semanal

### Semana 1 — 21/09 a 27/09  
**Tema:** organização, ambiente e mapa do que já existe  
**Entrega da sexta (27/09):** repositórios rodando + lista de pendências priorizada

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Definir papéis, board (To do / Doing / Done), convenção de commits e branches | Documento de regras do time + backlog da semana 2 |
| Backend | Subir Spring Boot local, conferir `application.properties`, listar endpoints atuais | Inventário da API (o que existe x o que falta) |
| Frontend | Subir Expo, conferir `API_BASE_URL`, mapear telas e rotas | Mapa de navegação atualizado |
| Banco | Conferir PostgreSQL, tabelas e seeds atuais | Diagrama ER atual + script de dump de desenvolvimento |
| Testes | Montar matriz dos fluxos críticos (login, produto, quiosque, compra) | Plano de testes v0 (casos ainda sem execução) |

---

### Semana 2 — 28/09 a 04/10  
**Tema:** autenticação completa e dados de demo  
**Entrega da sexta (02/10):** **Marco M1**

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Validar M1 com o time; gravar 3 min de “como rodar o projeto” | Checklist M1 assinado |
| Backend | Revisar login JWT, cadastro e `GET /usuarios/me`; esboçar `POST /usuarios/recuperar-senha` | Login estável + contrato do endpoint de senha |
| Frontend | Login, cadastro e tela **Esqueceu a senha** ligados à API (mesmo que o reset ainda seja stub) | Fluxo de auth navegável sem tela morta |
| Banco | Seeds de perfil, empresa compradora, distribuidora e usuário de teste (e-mail/senha conhecidos) | `seed_demo.sql` versionado |
| Testes | Casos de login válido, inválido, sessão persistida e cadastro | Relatório T1 (auth) com evidências |

---

### Semana 3 — 05/10 a 11/10  
**Tema:** catálogo e quiosques

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Priorizar bugs visuais da Home / Gerenciar produtos / Quiosques | Lista P0/P1 da gestão interna |
| Backend | CRUD produtos (imagem) e barracas/estoque; mensagens de erro claras | APIs de produto e quiosque sem 500 em caso feliz |
| Frontend | Fechar UX de Home, Gerenciar produtos e Quiosques; textos “Quiosques” | Telas internas no padrão visual do app |
| Banco | Constraints de estoque, unique produto por quiosque, índices de busca | Migration de integridade de estoque |
| Testes | CRUD produto (criar/editar/excluir) e quiosque (criar, alocar estoque, remover) | Relatório T2 (gestão interna) |

---

### Semana 4 — 12/10 a 18/10  
**Tema:** financeiro da empresa e operação (Home)  
**Entrega da sexta (16/10):** **Marco M2**

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Conferir se Home, produtos e quiosques fecham o M2 | Ata do marco M2 |
| Backend | Resumo financeiro real (compras, vendas, lucro); corrigir totais negativos incoerentes | Endpoint financeiro conferido com o banco |
| Frontend | Home: estoque, gráfico e atalhos (vendas, logística, cadastro) | Home demonstrável na banca |
| Banco | Views ou queries de resumo mensal + seeds financeiros | Dataset de demo com movimento nos últimos 30 dias |
| Testes | Conferir totais da Home contra o banco; regressão de auth | Relatório T3 (Home + financeiro) |

---

### Semana 5 — 19/10 a 25/10  
**Tema:** marketplace (vitrine da loja)

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Definir roteiro de demo: “entrar na Casa dos Vinhos e pedir um vinho” | Roteiro parcial da apresentação |
| Backend | Listar fornecedores, produtos do fornecedor e estoque disponível | Marketplace sem produto fantasma |
| Frontend | Marketplace, vitrine e detalhe do produto no padrão visual; busca de produto | Compra iniciada a partir da vitrine |
| Banco | Seeds de distribuidoras (capa, logo, catálogo) | 2–3 lojas demonstráveis |
| Testes | Busca, vitrine, produto esgotado vs disponível | Relatório T4 (marketplace) |

---

### Semana 6 — 26/10 a 01/11  
**Tema:** sacola, endereço, pagamento e pedido  
**Entrega da sexta (30/10):** **Marco M3**

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Ensaio de checkout ponta a ponta com o time | Vídeo curto ou checklist M3 |
| Backend | Solicitações de compra, status do pedido, endereço e formas de pagamento | Pedido criado e consultável |
| Frontend | Sacola (vazia e com itens), checkout, acompanhamento | Fluxo completo no app |
| Banco | Tabelas de solicitação/itens, endereço, forma de pagamento; seed de cartão/PIX | Pedido de demo reproduzível |
| Testes | Sacola vazia, adicionar item, endereço, PIX/cartão, status do pedido | Relatório T5 (checkout) |

---

### Semana 7 — 02/11 a 08/11  
**Tema:** recuperação de senha, logística e qualidade  
**Entrega da sexta (06/11):** **Marco M4**

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Congelar escopo de features novas; só correção | Lista do que entra / o que fica fora da banca |
| Backend | Finalizar `recuperar-senha`; revisar endpoints de logística/caminhoneiros se no escopo | Reset de senha funcional + APIs restantes estáveis |
| Frontend | Fechar Esqueceu a senha de ponta a ponta; telas de logística se já existirem | Sem botão morto no fluxo de auth |
| Banco | Tabela/token de reset (ou atualização segura de senha); backup da base de apresentação | Backup `stock4event_demo.dump` |
| Testes | Bateria completa dos fluxos M1–M3 + reset de senha | Relatório T6 (regressão) com bugs P0 zerados |

---

### Semana 8 — 09/11 a 15/11  
**Tema:** apresentação, docs e entrega  
**Entrega da sexta (14/11):** **Marco M5 — entrega final**

| Papel | Tarefas da semana | Entrega |
|-------|-------------------|---------|
| Líder | Slides, roteiro de 10–12 min, perguntas da banca, README atualizado | Apresentação + este cronograma cumprido |
| Backend | README da API, Postman/Insomnia, ambiente de demo no ar | Coleção de endpoints + API no ar no dia da banca |
| Frontend | Build de demo (Expo), polimento visual final, dados de tela conferidos | App pronto para projeção |
| Banco | Restaurar dump de demo; conferir usuários e pedidos de exemplo | Base limpa de apresentação |
| Testes | Ensaio da demo como “usuário da banca”; checklist do dia | Roteiro de homologação + evidências finais |

---

## 4. Ritmo da semana (todos os papéis)

| Dia | Atividade |
|-----|-----------|
| **Segunda** | Kickoff 30 min: o que entra na semana e quem depende de quem |
| **Terça–quinta** | Desenvolvimento / testes; dúvidas no grupo no mesmo dia |
| **Quinta 18h** | Código da semana no repositório (PR ou merge na branch de integração) |
| **Sexta** | Homologação + 45 min de review; atualizar board e ata |

Prazos internos da semana: **quinta = código**, **sexta = evidência testada**.

---

## 5. Dependências entre papéis

```text
Banco (tabela/seed) → Backend (endpoint) → Frontend (tela) → Testes (caso)
                         ↑
                      Líder (prazo e aceite)
```

Ninguém marca a tarefa como “pronta” sem:

1. Código no Git  
2. Outra pessoa conseguir reproduzir  
3. Testes registrarem o resultado (passou / falhou)

---

## 6. Critérios de aceite da entrega de 2 meses

O projeto está apto para apresentação se, com o seed de demo:

1. Um usuário entra com e-mail e senha conhecidos.  
2. Consegue cadastrar/editar um produto e um quiosque.  
3. A Home mostra estoque e um resumo financeiro coerente.  
4. Consegue comprar de uma distribuidora até gerar pedido.  
5. Acompanha o status do pedido.  
6. Redefine senha pela tela **Esqueceu a senha** (ou o time documenta limitação, se o e-mail real não existir).  
7. Testes entregam relatório com fluxos críticos executados.  
8. Líder entrega slides + roteiro de demo de até 12 minutos.

---

## 7. Riscos e plano B

| Risco | Quem monitora | Plano B |
|-------|----------------|---------|
| API fora do ar no dia da banca | Backend + Líder | Vídeo de backup + API local |
| Banco sem seed | Banco | Restaurar dump da semana 7 |
| Tela quebrada no Expo Web | Frontend | Demo no celular / emulador |
| Feature de senha sem e-mail SMTP | Backend | Reset direto por e-mail + nova senha na API |
| Escopo crescer (logística, gráficos extras) | Líder | Congelar na semana 7; citar como “próximos passos” |

---

## 8. Como usar este documento

- O **Líder** atualiza o board toda sexta com o status: no prazo / atrasado / feito.  
- Cada papel copia só a linha da sua semana para o commit ou para o card.  
- Alteração de prazo só vale se o Líder registrar na ata (não mudar o marco sem avisar o time).

Datas podem ser deslocadas em bloco (sempre 8 semanas corridas) se o início oficial do trabalho for outra segunda-feira.
