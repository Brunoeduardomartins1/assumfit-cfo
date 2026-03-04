# Tabelas Supabase — Modelo de Dados

## organizations
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| name | text | Nome da empresa |
| slug | text | Slug unico |
| created_at | timestamp | Data de criacao |

## org_members
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| user_id | uuid | FK → auth.users |
| role | text | "owner", "admin", "viewer" |

## chart_of_accounts
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| code | text | Codigo da conta (ex: "receita.core") |
| name | text | Nome da conta |
| type | text | "revenue", "expense", "capital", "financial", "adjustment" |
| level | integer | Nivel hierarquico |
| parent_code | text | Codigo da conta pai (nullable) |

## transactions
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| account_code | text | Codigo da conta |
| month | date | Mes do lancamento (YYYY-MM-01) |
| entry_type | text | "estimado" ou "realizado" |
| amount | numeric | Valor (negativo = despesa) |
| source | text | "manual", "open_finance", "import" |
| notes | text | Descricao (nullable) |
| created_by | uuid | Quem criou (nullable) |

## income_statement (DRE)
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| month | date | Mes (YYYY-MM-01) |
| line_item | text | "receita", "cogs", "resultado_bruto", "custos_fixos", "despesas_variaveis", "ebitda", etc. |
| amount | numeric | Valor |

## budget_entries
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| account_code | text | Codigo da conta |
| month | date | Mes (YYYY-MM-01) |
| amount | numeric | Valor orcado |

## assumptions
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| key | text | Chave da premissa |
| value | numeric | Valor |
| unit | text | Unidade (%, R$, meses, etc.) |

## sales_projections
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| product | text | Nome do produto |
| month | date | Mes (YYYY-MM-01) |
| funnel_stage | text | Estagio do funil |
| value | numeric | Valor |

## bank_accounts
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| provider | text | "pluggy", "manual" |
| provider_account_id | text | ID no provedor |
| bank_name | text | Nome do banco |
| account_type | text | "checking", "savings" |
| account_number | text | Numero da conta |
| balance | numeric | Saldo |
| last_sync | timestamp | Ultima sincronizacao |
| connection_status | text | "connected", "disconnected" |

## classification_rules
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| pattern | text | Padrao de texto para match |
| account_code | text | Conta de destino |
| confidence | numeric | Confianca (0-1) |
| source | text | "manual", "auto_learn" |

## alerts
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| type | text | "burn_rate", "runway", "budget_exceeded", "anomaly", "recommendation" |
| severity | text | "info", "warning", "critical" |
| title | text | Titulo do alerta |
| message | text | Mensagem detalhada |
| is_read | boolean | Se foi lido |
| created_at | timestamp | Data de criacao |

## scenarios
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| name | text | Nome do cenario |
| description | text | Descricao |
| is_base | boolean | Se e o cenario base |
| growth_rate | numeric | Taxa de crescimento (%) |
| created_by | uuid | Quem criou |
| created_at | timestamp | Data de criacao |

## audit_log
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| org_id | uuid | FK → organizations |
| user_id | uuid | Quem executou |
| action | text | Acao (create, update, delete, sync_open_finance, etc.) |
| entity_type | text | Tipo de entidade |
| entity_id | text | ID da entidade (nullable) |
| old_value | jsonb | Valor anterior (nullable) |
| new_value | jsonb | Valor novo (nullable) |
| created_at | timestamp | Timestamp |

## RLS (Row Level Security)

Todas as tabelas tem RLS habilitado. Politicas:
- SELECT: usuario deve ser membro da org (`org_members`)
- INSERT/UPDATE/DELETE: usuario deve ter role "owner" ou "admin"
