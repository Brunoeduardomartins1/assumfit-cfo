# Skill: cashflow_aging

**Categoria:** BPO Financeiro (Operacional)
**Tool name:** `cashflow_aging`

## Descricao

Analisa fluxo de pagamentos e recebimentos com aging report. Projeta caixa para os proximos meses e identifica concentracoes de fornecedores/clientes.

## Ativacao Automatica

Palavras-chave: "aging", "contas a pagar", "contas a receber", "fluxo curto prazo"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `months_ahead` | number | Nao | Meses para projecao (default: 3, max: 6) |
| `focus` | string | Nao | "pagar", "receber" ou "ambos" (default: "ambos") |

## Fluxo de Execucao

1. Calcula range: 3 meses atras ate `months_ahead` meses a frente
2. Busca transacoes do range (`getTransactionsByDateRange`)
3. Separa em payables (amount < 0) e receivables (amount > 0)
4. Agrega por account_code para ranking de concentracao
5. Calcula totais mensais (pagar, receber, liquido)

## Retorno

```
CONTAS A PAGAR — Top 5:
  folha_pagamento: R$ 45.000,00
  aluguel: R$ 8.000,00
  ...

CONTAS A RECEBER — Top 5:
  muvx_core: R$ 120.000,00
  muvx_digital: R$ 35.000,00
  ...

PROJECAO MENSAL:
  2026-01: Receber R$ 155k | Pagar R$ 85k | Liquido R$ 70k
  2026-02: Receber R$ 180k | Pagar R$ 90k | Liquido R$ 90k
  2026-03: Receber R$ 210k | Pagar R$ 95k | Liquido R$ 115k
```

## Dependencias

- `src/lib/supabase/queries.ts` — getTransactionsByDateRange
