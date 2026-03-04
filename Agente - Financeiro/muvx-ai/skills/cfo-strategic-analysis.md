# Skill: strategic_analysis

**Categoria:** CFO Estrategico (Gestao)
**Tool name:** `strategic_analysis`

## Descricao

Analise estrategica completa: runway detalhado com best/worst case, prontidao para captacao com scorecard, metricas formatadas para pitch deck, e valuation baseado em ARR.

## Ativacao Automatica

Palavras-chave: "runway", "captacao", "fundraising", "valuation", "pitch"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `analysis_type` | string | Sim | "runway", "fundraising_readiness", "pitch_financials", "valuation", "full" |

## Tipos de Analise

### runway
- Saldo de caixa atual
- Burn rate atual + tendencia MoM
- Runway em meses
- Best case (burn -20%) e worst case (burn +20%)

### fundraising_readiness
Scorecard 0-100 com 4 dimensoes (25 pts cada):
- MRR growth (>20% = 25, >10% = 15, else 5)
- Margem bruta (>60% = 25, >40% = 15, else 5)
- Runway (>12m = 25, >6m = 15, else 5)
- MRR absoluto (>50k = 25, >10k = 15, else 5)

Recomendacao: >=70 favoravel, >=40 melhorar metricas, <40 foco em PMF

### pitch_financials
Metricas formatadas para investidor:
- ARR, MRR, crescimento MoM, margem bruta, EBITDA

### valuation
Valuation ARR-based com multiplos SaaS tipicos: 5x, 8x, 10x, 15x

### full
Executa todas as analises acima em sequencia.

## Dependencias

- `src/lib/supabase/queries.ts` — getIncomeStatement
