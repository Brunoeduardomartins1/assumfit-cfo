# Insights Automaticos

O sistema gera ate 10 insights automaticos baseados nos dados financeiros atuais. Cada insight tem tipo, titulo, descricao e metrica.

## Tipos de Insight

| Tipo | Cor | Descricao |
|------|-----|-----------|
| `risk` | Vermelho | Riscos identificados |
| `alert` | Laranja | Alertas que precisam atencao |
| `opportunity` | Verde | Oportunidades detectadas |
| `info` | Azul | Informacoes relevantes |

## Lista de Insights (10)

### 1. Runway critico
- **Tipo:** alert
- **Condicao:** `runway_meses < 3`
- **Acao:** Priorizar captacao ou reducao de custos

### 2. Saldo de caixa baixo
- **Tipo:** alert
- **Condicao:** `saldo_caixa < 10.000`
- **Acao:** Antecipar recebimentos ou renegociar prazos

### 3. Break-even projetado
- **Tipo:** opportunity
- **Condicao:** Primeiro mes com `EBITDA > 0`
- **Acao:** A partir desse mes, operacao gera caixa

### 4. Crescimento acelerado de receita
- **Tipo:** opportunity
- **Condicao:** Receita cresceu >50% MoM
- **Acao:** Hockey stick confirmado

### 5. Concentracao de custos
- **Tipo:** risk
- **Condicao:** Maior custo representa >50% dos custos totais
- **Acao:** Diversificar base de custos

### 6. Valuation ARR-Based
- **Tipo:** info
- **Condicao:** Pelo menos 2 meses com valuation > 0
- **Acao:** Informativo

### 7. Margem EBITDA
- **Tipo:** info
- **Condicao:** Pelo menos 1 mes com margem EBITDA > 0
- **Acao:** Tendencia de melhoria

### 8. Variancia alta entre periodos (BPO)
- **Tipo:** risk
- **Condicao:** Variacao de receita MoM > 15%
- **Acao:** Verificar estimativas vs realizado, usar conciliacao

### 9. Fechamento incompleto (BPO)
- **Tipo:** alert
- **Condicao:** Ultimo mes com <80% dos line items esperados (6)
- **Acao:** Executar checklist de fechamento

### 10. Janela de captacao (CFO)
- **Tipo:** opportunity
- **Condicao:** Runway < 6 meses E receita crescendo > 20% MoM
- **Acao:** Iniciar conversas com investidores

## Arquivo

`src/lib/ai/insights.ts` — funcao `generateInsights(liveData?)`
