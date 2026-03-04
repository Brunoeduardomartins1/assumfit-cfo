# Skill: classify_and_reconcile

**Categoria:** BPO Financeiro (Operacional)
**Tool name:** `classify_and_reconcile`

## Descricao

Classifica transacoes bancarias automaticamente usando regras de classificacao e concilia estimado vs realizado para um mes especifico. Detecta duplicatas.

## Ativacao Automatica

Palavras-chave: "classifique", "concilie", "duplicata", "estimado vs realizado"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `month` | string | Sim | Mes no formato YYYY-MM |
| `detect_duplicates` | boolean | Nao | Detectar duplicatas (default: true) |

## Fluxo de Execucao

1. Busca transacoes estimadas e realizadas do mes (`getTransactions`)
2. Constroi `BankTransaction[]` a partir das transacoes realizadas
3. Executa `classifyTransactions()` do classifier.ts
4. Se `detect_duplicates=true`, executa `flagDuplicates()`
5. Constroi `estimadoMap` para reconciliacao
6. Executa `reconcile()` + `getReconciliationSummary()` do reconciler.ts
7. Identifica top desvios (variancia >15%)

## Retorno

```
Conciliacao YYYY-MM:
- Transacoes realizadas: X
- Classificadas: Y/Z
- Duplicatas detectadas: N
- Conciliacao: X OK, Y atencao, Z alertas
- Estimado total: R$ X.XXX,XX
- Realizado total: R$ X.XXX,XX

Maiores desvios (>15%):
  - conta_X: estimado R$ X vs realizado R$ Y (Z%)
```

## Dependencias

- `src/lib/open-finance/classifier.ts` — classifyTransactions, flagDuplicates
- `src/lib/open-finance/reconciler.ts` — reconcile, getReconciliationSummary
- `src/lib/supabase/queries.ts` — getTransactions

## Comportamento Proativo

- Se detectar duplicata → cria alerta + sugere remocao
- Se variancia >15% em conta relevante → destaca no retorno
