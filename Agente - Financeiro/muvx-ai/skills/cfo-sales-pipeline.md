# Skill: get_sales_pipeline

**Categoria:** CFO Estrategico (Gestao)
**Tool name:** `get_sales_pipeline`

## Descricao

Consulta e apresenta o pipeline de vendas por produto e estagio do funil. Util para projecao de receita futura e analise de conversao.

## Ativacao Automatica

Palavras-chave: "pipeline", "funil de vendas", "projecao de receita por produto"

## Parametros

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `product` | string | Nao | Filtrar por produto especifico |
| `months_ahead` | number | Nao | Meses a frente (default: 6) |

## Retorno

```
PIPELINE DE VENDAS:

MUVX Core:
  2026-01: awareness=1000, consideration=500, trial=200, conversion=50
  2026-02: awareness=1200, consideration=600, trial=250, conversion=65
  ...

MUVX Digital:
  2026-01: awareness=800, consideration=300, trial=100, conversion=25
  ...
```

## Fluxo

1. Busca `sales_projections` com filtro opcional de produto (`getSalesProjections`)
2. Agrupa por produto → mes → funnel_stage
3. Formata em estrutura hierarquica

## Dependencias

- `src/lib/supabase/queries.ts` — getSalesProjections

## Tabela Supabase

`sales_projections`: org_id, product, month, funnel_stage, value
