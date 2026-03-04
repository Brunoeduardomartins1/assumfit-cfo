# Workflow: Fechamento Mensal

## Objetivo
Garantir que todos os dados financeiros do mes estejam corretos, completos e conciliados antes de reportar para o board.

## Passos

### 1. Classificacao e Conciliacao
**Prompt:** "Classifique e concilie as transacoes de [MES]"
**Tool:** `classify_and_reconcile`
**Output:** Resumo de transacoes classificadas, duplicatas, desvios

### 2. Checklist de Fechamento
**Prompt:** "Execute o checklist de fechamento de [MES]"
**Tool:** `monthly_close_checklist`
**Output:** 5 checks com ✅/⚠️/❌

### 3. Budget vs Realizado
**Prompt:** "Compare orcamento vs realizado de [MES]"
**Tool:** `get_budget_vs_actual`
**Output:** Ranking de contas com desvios

### 4. Aging de Contas
**Prompt:** "Qual o aging das contas a pagar e receber?"
**Tool:** `cashflow_aging`
**Output:** Top fornecedores/clientes + projecao

### 5. Relatorio para Board
**Prompt:** "Gere o relatorio executivo de [MES]"
**Tool:** `board_report`
**Output:** Relatorio completo com KPIs, MoM, alertas, forecast

## Frequencia
Mensal — idealmente nos primeiros 5 dias uteis do mes seguinte.

## Responsavel
CFO / Controller — assistido pelo Agente IA
