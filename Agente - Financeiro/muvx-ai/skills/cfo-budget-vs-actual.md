# Skill: get_budget_vs_actual

**Categoria:** CFO Estrategico (Gestao)
**Tool name:** `get_budget_vs_actual`

## Descricao

Compara orcamento (budget) com realizado por conta contabil. Rankeia contas por desvio percentual e destaca aquelas acima do threshold.

## Ativacao Automatica

Palavras-chave: "orcamento", "budget", "realizado vs planejado"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `month` | string | Nao | Mes YYYY-MM (default: mes atual) |
| `threshold_percent` | number | Nao | % minimo de desvio para destacar (default: 10) |

## Retorno

```
BUDGET VS REALIZADO — 2026-02 (desvio >= 10%):
  marketing: Budget R$ 15.000 | Real R$ 21.000 | Desvio +40.0%
  software: Budget R$ 8.000 | Real R$ 9.500 | Desvio +18.8%
  folha: Budget R$ 45.000 | Real R$ 44.000 | Desvio -2.2%

Total contas analisadas: 12
```

## Fluxo

1. Busca `budget_entries` filtrados pelo mes (`getBudgetEntries`)
2. Busca transacoes realizadas agregadas por conta (`getTransactionAggregateByAccount`)
3. Junta por `account_code`, calcula variancia absoluta e percentual
4. Ordena por |variancia%| decrescente
5. Filtra acima do threshold

## Dependencias

- `src/lib/supabase/queries.ts` — getBudgetEntries, getTransactionAggregateByAccount

## Comportamento Proativo

- Se desvio >30% em qualquer conta → cria alerta critico automaticamente
