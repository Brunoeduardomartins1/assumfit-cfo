# MUVX AI — Agente Financeiro Inteligente

Agente IA com skills de BPO Financeiro e CFO Estrategico para a ASSUMFIT/MUVX.

## Estrutura

```
muvx-ai/
├── agents/       # Agentes IA (CFO, BPO, etc.)
├── skills/       # Skills individuais (classify, reconcile, forecast, etc.)
├── docs/         # Documentacoes e anotacoes
├── workflows/    # Fluxos de automacao
└── README.md
```

## Skills Disponiveis

### BPO Financeiro (Operacional)
- **classify_and_reconcile** — Classificacao e conciliacao de transacoes
- **monthly_close_checklist** — Checklist de fechamento mensal (5 validacoes)
- **cashflow_aging** — Aging de contas a pagar/receber + projecao de caixa

### CFO Estrategico (Gestao)
- **strategic_analysis** — Runway, fundraising readiness, valuation, pitch financials
- **board_report** — Relatorio executivo para o board com KPIs e MoM
- **scenario_forecast** — Cenarios what-if e analise de sensibilidade
- **get_budget_vs_actual** — Orcamento vs realizado com ranking de desvios
- **get_sales_pipeline** — Funil de vendas por produto e estagio

### Tools Base
- **query_financial_data** — Consulta transacoes por periodo/conta
- **calculate_kpi** — Calcula KPIs financeiros
- **compare_periods** — Compara dois periodos
- **create_alert** — Cria alertas financeiros
- **list_accounts** — Lista plano de contas

## Deteccao Automatica

O agente detecta automaticamente qual skill ativar pelo contexto da conversa — sem selecao manual do usuario.

## Stack

- Next.js 16 + TypeScript
- Claude API (claude-sonnet-4-20250514) com tool_use
- Supabase (PostgreSQL + Auth + RLS)
- 13 tools disponiveis para o agente
