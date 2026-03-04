# Arquitetura do Sistema AI

## Visao Geral

O agente IA financeiro da ASSUMFIT/MUVX e um sistema conversacional que usa Claude (Anthropic) com `tool_use` para consultar e analisar dados financeiros em tempo real do Supabase.

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + React + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Recharts |
| Backend | Next.js API Routes (App Router) |
| AI | Claude API (claude-sonnet-4-20250514) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| State | Zustand (client-side) |

## Fluxo da Conversa

```
Usuario digita mensagem
    ↓
POST /api/chat (SSE streaming)
    ↓
buildSystemPrompt(orgId) — contexto financeiro + skill routing
    ↓
Claude API (tool_use enabled, 13 tools)
    ↓
[LOOP max 10 iteracoes]
    Claude pede tool_use? → executeTool() → Supabase query → resultado
    Claude termina? → stream texto para frontend
    ↓
Frontend renderiza resposta com markdown
```

## Arquivos Principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/ai/claude-client.ts` | System prompt, 13 tools, executeTool, streamChat |
| `src/lib/ai/insights.ts` | 10 insights automaticos (risk, opportunity, alert, info) |
| `src/lib/supabase/queries.ts` | 20+ query helpers para todas as 13 tabelas |
| `src/app/api/chat/route.ts` | API endpoint SSE para chat |
| `src/app/(dashboard)/agente-ia/page.tsx` | UI do chat com prompts categorizados |
| `src/components/ai/chat-message.tsx` | Componente de mensagem com markdown |
| `src/components/ai/insights-panel.tsx` | Painel lateral de insights |

## Tabelas Supabase (13)

| Tabela | Dados |
|--------|-------|
| `organizations` | Empresa (ASSUMFIT) |
| `org_members` | Membros e roles |
| `chart_of_accounts` | Plano de contas |
| `transactions` | Transacoes (estimado/realizado) |
| `income_statement` | DRE mensal |
| `budget_entries` | Orcamento por conta |
| `assumptions` | Premissas de crescimento |
| `sales_projections` | Pipeline de vendas |
| `bank_accounts` | Contas bancarias (Open Finance) |
| `classification_rules` | Regras de classificacao |
| `alerts` | Alertas financeiros |
| `scenarios` | Cenarios salvos |
| `audit_log` | Trilha de auditoria |

## Tools do Agente (13)

### Base (5)
1. `query_financial_data` — Busca transacoes
2. `calculate_kpi` — Calcula KPIs
3. `compare_periods` — Compara periodos
4. `create_alert` — Cria alertas
5. `list_accounts` — Lista plano de contas

### BPO (3)
6. `classify_and_reconcile` — Classificacao + conciliacao
7. `monthly_close_checklist` — Fechamento mensal
8. `cashflow_aging` — Aging + projecao caixa

### CFO (5)
9. `strategic_analysis` — Analise estrategica
10. `board_report` — Relatorio executivo
11. `scenario_forecast` — Cenarios what-if
12. `get_budget_vs_actual` — Budget vs realizado
13. `get_sales_pipeline` — Pipeline vendas

## Deteccao Automatica de Skills

O system prompt contem instrucoes para o Claude detectar automaticamente qual skill ativar com base em palavras-chave da mensagem do usuario. Nao ha seletor manual no UI.

## Configuracoes

- `max_tokens`: 4096 (permite respostas longas para relatorios)
- `tool_use loop`: max 10 iteracoes (guard contra loops infinitos)
- Modelo: `claude-sonnet-4-20250514`
