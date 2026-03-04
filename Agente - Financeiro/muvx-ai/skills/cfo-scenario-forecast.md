# Skill: scenario_forecast

**Categoria:** CFO Estrategico (Gestao)
**Tool name:** `scenario_forecast`

## Descricao

Projeta cenarios what-if usando o motor de cenarios existente. Suporta cenarios pre-definidos (otimista, pessimista), customizados, e analise de sensibilidade multi-ponto.

## Ativacao Automatica

Palavras-chave: "cenario", "what-if", "sensibilidade", "projecao", "simule"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `scenario_type` | string | Sim | "optimistic", "pessimistic", "custom", "sensitivity" |
| `metric` | string | Sim | "receita", "ebitda", "saldoFinal", "burnRate" |
| `custom_growth_percent` | number | Nao | % crescimento para cenario custom |
| `sensitivity_range` | string | Nao | Range ex: "-20,-10,0,10,20" |

## Modos de Operacao

### optimistic / pessimistic
Usa `SCENARIO_TEMPLATES` do engine.ts com modificadores pre-definidos.

### custom
Cria cenario com `custom_growth_percent` aplicado como multiplicador na receita.

### sensitivity
Roda multiplas simulacoes nos pontos do `sensitivity_range`. Retorna tabela comparativa.

## Retorno

```
CENARIO: Pessimista — receita
  Jan-26: Base R$ 0 → Cenario R$ 0 (0.0%)
  Feb-26: Base R$ 5.000 → Cenario R$ 4.000 (-20.0%)
  ...
  Dec-26: Base R$ 500.000 → Cenario R$ 400.000 (-20.0%)
```

Ou para sensibilidade:
```
ANALISE DE SENSIBILIDADE — receita:
  -20%: R$ 400.000 (delta: -20.0%)
  -10%: R$ 450.000 (delta: -10.0%)
  0%: R$ 500.000 (delta: 0.0%)
  +10%: R$ 550.000 (delta: +10.0%)
  +20%: R$ 600.000 (delta: +20.0%)
```

## Dependencias

- `src/lib/scenarios/engine.ts` — applyScenario, SCENARIO_TEMPLATES
- `src/types/scenarios.ts` — Scenario type
