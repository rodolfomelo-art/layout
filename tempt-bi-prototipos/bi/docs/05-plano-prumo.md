# Plano global para o Prumo

Apresente este plano no modo de planejamento da harness, aprove, e então rode `/prumo`.
Cada tarefa tem **expect** (critério), **run** (verificação executável, `kind: functional` quando houver comportamento) e **escopo de escrita**.
Peça ao agente para converter este plano no formato de contrato do Prumo.

## FP — Protótipos navegáveis (sem dependência)
Detalhes, checklist e tarefas em `docs/06-prototipos-prumo.md`. Escopo: `apps/web/**`. Evidência: `cd apps/web && npm test`.

## F0 — Fundação (sem dependência)
- **T0.1 Esqueleto e banco.** Escopo: raiz, `docker-compose.yml`, `pyproject.toml`.
  - expect: banco sobe e testes do esqueleto passam.
  - run (functional): `docker compose up -d && python -m pytest tests/test_smoke.py`
- **T0.2 CI.** Escopo: `.github/workflows/`. run: pipeline roda lint + testes.

## F1 — Autenticação e cofre de tokens (depende de F0)
- **T1.1 Cofre de tokens** criptografado. Escopo: `pipelines/connectors/common/`.
  - expect: token vencido é renovado e a chamada é repetida automaticamente.
  - run (functional): `python -m pytest pipelines/connectors/common -k refresh`
- **T1.2 OAuth ML, LWA Amazon, assinatura Shopee.** run: testes com respostas simuladas (respx).

## F2 — Conector Mercado Livre (depende de F1)
- **T2.1 Pedidos e itens** incrementais → `raw.ml_*` e `stg_ml__*`.
  - expect: rodar duas vezes o mesmo período não duplica linhas.
  - run (functional): `python -m pytest pipelines/connectors/mercadolivre -k idempotent`
- **T2.2 Visitas.** **T2.3 Billing e tarifas.** **T2.4 Product Ads v2.** **T2.5 Reputação e moderação.**
  - Shared resource: tabelas `raw.ml_*`.

## F3 — Modelo unificado e métricas (depende de F2)
- **T3.1 Dimensões e fatos** (dbt). run: `cd warehouse && dbt build`
- **T3.2 Tabela de custos por SKU** (importação de planilha/ERP).
- **T3.3 Métricas.** expect: margem do pedido de referência = cálculo manual em `tests/fixtures/pedido_referencia.json`.
  - run (functional): `python -m pytest tests/test_metricas.py`

## F4 — API e MCP do BI (depende de F3)
- **T4.1 FastAPI** `/kpis`, `/margem/sku`, `/estoque/cobertura`, `/ads/desempenho`, `/reputacao`.
- **T4.2 Servidor MCP** com as mesmas consultas, somente leitura.
  - expect: `margem_por_sku` via MCP retorna o mesmo valor da API.

## F5 — Dashboard web (depende de FP, F4)
- Troca `apps/web/src/data/mock.js` pela API, mantendo as telas aprovadas na FP.
- **T5.1 Visão executiva.** **T5.2 Margem.** **T5.3 Estoque.** **T5.4 Ads.** **T5.5 Reputação e catálogo.**
  - expect: GMV da tela = GMV da API para o mesmo filtro (teste Playwright).

## F6 — Conector Amazon (depende de F1, F3)
- Orders, Finances, FBA Inventory, Data Kiosk, Ads Reporting v3 → staging → marts.
  - expect: pedidos e taxas de um dia conferem com o Seller Central (fixture).

## F7 — Conector Shopee (depende de F1, F3)
- Pedidos, produtos, escrow, devoluções, saúde da conta, Ads → staging → marts.
  - expect: repasse de um pedido confere com o escrow (fixture).

## F8 — Agentes e alertas (depende de F4)
- Subagentes em `.claude/agents/` e regras de alerta em `apps/api/src/bi_api/alertas.py`.
  - expect: cenário com cobertura de 10 dias dispara alerta de ruptura.

## F9 — Qualidade, segurança e deploy (depende de F5, F6, F7, F8)
- Testes de frescor e reconciliação, perfis de acesso, retenção LGPD, monitoramento, deploy.
  - expect: carga atrasada dispara alerta; usuário sem perfil financeiro não vê margem.
