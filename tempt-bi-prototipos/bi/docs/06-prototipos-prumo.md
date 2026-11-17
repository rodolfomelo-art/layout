# Fase FP: protótipos navegáveis (Prumo)

O protótipo vem antes dos dados reais. Ele usa dados fictícios com o mesmo formato que a API terá na F4, então as telas aprovadas aqui são reaproveitadas na F5 trocando só a fonte de dados.

## Checklist do Prumo antes de rodar `/prumo`

| Item | Como verificar | Status |
|---|---|---|
| Node.js 22 ou mais novo | `node -v` | ☐ |
| Prumo instalado | `prumo -v` (senão `npm install -g @henri-ralmeida/prumo`) | ☐ |
| Harness configurada pelo Prumo | `prumo status` e `prumo install --all --dry-run` | ☐ |
| Painel do Prumo no ar | `prumo dashboard status` e abrir http://localhost:4949 | ☐ |
| Workspace definido | `echo $env:PRUMO_ROOT` (o `scripts\setup.ps1` já cria) | ☐ |
| Nova sessão aberta depois de instalar | o Prumo só ativa em sessão nova | ☐ |
| Subagentes disponíveis (planejador, executor, revisor) | no Claude Code, `/agents` lista os de `.claude/agents/` | ☐ |
| Dependências do protótipo | `cd apps/web; npm install; npx playwright install chromium` | ☐ |
| Evidência funcional roda | `cd apps/web; npm test` mostra 13 testes passando | ☐ |
| Plano aprovado no modo de planejamento | aprovar FP junto com o plano global (ou como atualização aprovada, se já houver run em andamento) | ☐ |

Se você já tinha iniciado um run com o plano anterior, inclua a FP como **atualização aprovada do plano** e deixe o agente rodar `sync-plan`. Não edite o `state.json` à mão.

## Respostas para preparar (a discussão da fase vai perguntar)

1. Quem vai avaliar o protótipo e qual o critério de “aprovado”?
2. Desktop primeiro ou celular também? (o protótipo já é responsivo)
3. Quais telas são obrigatórias no MVP e quais podem esperar?
4. A marca/identidade visual já existe ou o protótipo define?
5. O “Pergunte ao BI” entra no MVP ou fica para a F8?

## Tarefas da fase FP (sem dependência de dados)

Escopo de escrita de toda a fase: `apps/web/**`. Recursos compartilhados: `apps/web/src/data/mock.js` e `apps/web/src/styles.css` (tokens da identidade Tempt BI).

| Tarefa | Entrega | expect | run (`kind: functional`) |
|---|---|---|---|
| FP.0 Padrão visual | Identidade Tempt BI: navy institucional da Tempt (#0B1F3A), logotipo TEMPT BI, destaque em `--laranja` (provisório), Manrope | telas sem erro em claro e escuro | `npm test` (teste 7) |
| FP.1 Landing | Hero, recursos, canais, planos, faixa de chamada e rodapé | botões levam ao cadastro e ao login | `npm test` (teste 4) |
| FP.2 Cadastro e login | Cadastro em 2 etapas (dados da empresa, senha forte, termos) e tela de entrar | valida campos, máscara de CNPJ, bloqueia senha fraca e sem termos | `npm test` (teste 5) |
| FP.3 Conexão de canais | Etapa pós-cadastro e tela Canais conectados | sem canal o dashboard mostra estado vazio; ao conectar, mostra dados | `npm test` (teste 6) |
| FP.4 Estrutura do app | Lateral com grupos, workspace, busca com ⌘K, ajuda, sino, menu do usuário, migalha, filtros | rotas abrem a tela certa; menu atualiza o endereço | `npm test` (testes 7 e 8) |
| FP.5 Dados fictícios | `mock.js` no formato da futura API, respeitando canais conectados | margem e GMV respeitam `docs/02-kpis.md` | `npm test` (testes 1 a 3) |
| FP.6 Dashboard | KPIs com ícone, faturamento, alertas importantes, cascata, por canal, piores SKUs, ações rápidas | filtros mudam os números | `npm test` (teste 9) |
| FP.7 Telas de análise | Vendas, Estoque, Catálogo, Margem (com gaveta de SKU), Publicidade, Reputação | busca e tabela abrem o detalhe do SKU | `npm test` (testes 10 e 11) |
| FP.8 Alertas e Pergunte ao BI | Alertas por prioridade e chat no botão flutuante | alerta navega; chat responde | `npm test` (testes 12 e 13) |
| FP.9 Validação com usuários | Sessão de avaliação com quem vai usar o BI | ajustes registrados em `docs/07-feedback-prototipo.md` | `validationMode: inspection` (avaliação humana) |

O código destas tarefas já está pronto neste pacote. No Prumo, a execução de FP.0 a FP.8 consiste em **adotar o código, rodar a evidência e refinar** o que surgir na discussão. O revisor independente confere que os testes realmente provam cada critério.

## Depois do protótipo

A F5 (dashboard real) passa a depender de FP e F4: troca `mock.js` por chamadas à API, mantendo as telas. Os gráficos SVG podem continuar ou ser trocados por Apache ECharts mantendo as mesmas props.
