# Skill: monthly_close_checklist

**Categoria:** BPO Financeiro (Operacional)
**Tool name:** `monthly_close_checklist`

## Descricao

Executa checklist completo de fechamento mensal com 5 validacoes automaticas. Retorna relatorio estruturado com status por item.

## Ativacao Automatica

Palavras-chave: "fechamento", "fechar mes", "pendencias", "validar DRE"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `month` | string | Sim | Mes no formato YYYY-MM |

## 5 Checks do Fechamento

| # | Check | Status |
|---|-------|--------|
| 1 | DRE completa (todos line_items presentes?) | ✅/❌ |
| 2 | Consistencia (receita - COGS = resultado_bruto) | ✅/⚠️ |
| 3 | Cobertura estimado→realizado (% de contas com realizado) | ✅/⚠️ |
| 4 | Transacoes nao classificadas | ✅/⚠️ |
| 5 | Budget vs actual (desvios >10%) | ✅/⚠️/ℹ️ |

## Retorno

```
Checklist de Fechamento — YYYY-MM:

✅ DRE completa — todos os line items presentes
✅ Consistencia — receita - COGS = resultado bruto
⚠️ Cobertura baixa — apenas 60% das contas estimadas tem realizado
✅ Classificacao — todas as transacoes classificadas
⚠️ 3 contas acima do orcamento em >10%

Resumo DRE:
  receita: R$ X.XXX,XX
  cogs: R$ X.XXX,XX
  ...
```

## Dependencias

- `src/lib/supabase/queries.ts` — getIncomeStatementForMonth, getTransactions, getBudgetEntries

## Line Items Esperados

`receita`, `cogs`, `resultado_bruto`, `custos_fixos`, `despesas_variaveis`, `ebitda`
