# Workflow: Analise Estrategica (Pre-Fundraising)

## Objetivo
Avaliar a prontidao da empresa para fundraising e preparar metricas para pitch deck.

## Passos

### 1. Analise de Runway
**Prompt:** "Qual nosso runway atual?"
**Tool:** `strategic_analysis` (analysis_type: "runway")
**Output:** Runway, burn rate, best/worst case

### 2. Scorecard de Fundraising
**Prompt:** "Qual nossa prontidao para fundraising?"
**Tool:** `strategic_analysis` (analysis_type: "fundraising_readiness")
**Output:** Score 0-100 com recomendacao

### 3. Metricas para Pitch
**Prompt:** "Quais metricas usar no pitch?"
**Tool:** `strategic_analysis` (analysis_type: "pitch_financials")
**Output:** ARR, MRR, growth, margens formatados

### 4. Valuation
**Prompt:** "Qual nosso valuation estimado?"
**Tool:** `strategic_analysis` (analysis_type: "valuation")
**Output:** Valuation ARR-based com multiplos

### 5. Cenarios What-If
**Prompt:** "Simule cenarios otimista e pessimista"
**Tool:** `scenario_forecast`
**Output:** Projecoes com deltas

### 6. Pipeline de Receita
**Prompt:** "Mostre o pipeline de vendas"
**Tool:** `get_sales_pipeline`
**Output:** Pipeline por produto e estagio

## Frequencia
Trimestral ou quando considerar captacao.

## Responsavel
CEO + CFO — assistidos pelo Agente IA
