# Skill: board_report

**Categoria:** CFO Estrategico (Gestao)
**Tool name:** `board_report`

## Descricao

Gera relatorio executivo estruturado para board/investidores. Inclui KPIs com comparacao MoM, alertas ativos, e forecast opcional dos proximos 3 meses.

## Ativacao Automatica

Palavras-chave: "relatorio board", "relatorio executivo", "KPIs para investidores"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `month` | string | Sim | Mes de referencia YYYY-MM |
| `include_forecast` | boolean | Nao | Incluir forecast 3 meses (default: true) |

## Estrutura do Relatorio

```
RELATORIO EXECUTIVO — YYYY-MM

KPIs PRINCIPAIS:
- Receita: R$ X (+Y% MoM)
- EBITDA: R$ X (+Y% MoM)
- Custos Fixos: R$ X (+Y% MoM)
- Desp. Variaveis: R$ X (+Y% MoM)
- Burn Rate: R$ X (+Y% MoM)
- Margem Bruta: X%
- Margem EBITDA: X%

ALERTAS ATIVOS (N):
- [CRITICAL] Titulo: Mensagem
- [WARNING] Titulo: Mensagem

FORECAST (YYYY-MM a YYYY-MM):
  2026-04: Receita R$ X | EBITDA R$ Y
  2026-05: Receita R$ X | EBITDA R$ Y
  2026-06: Receita R$ X | EBITDA R$ Y
```

## Fluxo

1. Busca DRE do mes atual e anterior (`getIncomeStatementForMonth`)
2. Busca alertas ativos (`getAlerts`)
3. Calcula deltas MoM absolutos e percentuais
4. Se `include_forecast`, busca DRE completa e projeta 3 meses seguintes

## Dependencias

- `src/lib/supabase/queries.ts` — getIncomeStatementForMonth, getIncomeStatement, getAlerts
