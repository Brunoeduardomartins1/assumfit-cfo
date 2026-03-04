# MUVX DIGITAL — Arquitetura Definitiva

## Stack Final
- **Backoffice MUVX** → fonte de verdade dos eventos
- **HubSpot** → CRM de visualização e registro (sem workflows)
- **Orquestrador Node.js** → único serviço rodando (webhook + cron)
- **Claude API** → lê skills e gera mensagens personalizadas
- **WhatsApp Business Cloud API (Meta direta)** → envio e recebimento de mensagens
- **Skills (SKILL.md)** → toda a inteligência de cada fase do funil

**Removidos da arquitetura:** Evolution API (desnecessária com acesso direto à Meta), n8n (orquestrador puro é mais leve e mais barato).

---

## Fluxo Completo

```
Personal age na plataforma MUVX (cadastro, login, venda...)
        │
        ▼
Backoffice MUVX dispara webhook → HubSpot
        │
        ▼
HubSpot cria/atualiza deal e move de fase
        │
        ▼
HubSpot dispara webhook de mudança de fase → Orquestrador (porta 3001)
        │
        ▼
Orquestrador identifica: deal_id, fase, dados do lead
        │
        ▼
Orquestrador lê o SKILL.md da fase correspondente
        │
        ▼
Orquestrador chama Claude API passando: skill + contexto do deal
        │
        ▼
Claude retorna: mensagem personalizada + ações a executar
        │
        ▼
Orquestrador envia mensagem via WhatsApp Business Cloud API (Meta)
        │
        ▼
Orquestrador registra atividade no HubSpot + atualiza campos
        │
        ▼
Lead responde no WhatsApp → Meta dispara webhook → Orquestrador (porta 3001)
        │
        ▼
Orquestrador processa resposta → atualiza HubSpot → chama Claude se necessário
```

## Cron Jobs (dentro do Orquestrador)

1. **A cada 30 minutos:** Varre o pipeline no HubSpot, identifica deals com FUPs pendentes (prazo atingido), e executa o próximo FUP via Claude + Meta.

2. **Todo dia às 8h:** Executa Skill 8 (Briefing Diário) — consolida funil e envia resumo via WhatsApp para Gerente e CS.

---

## Estrutura de Diretórios

```
/opt/muvx/
├── config.json                         ← Credenciais centralizadas
├── orquestrador.js                     ← Único serviço (webhook + cron + lógica)
├── package.json
├── lib/
│   ├── hubspot.js                      ← Funções HubSpot API
│   ├── whatsapp.js                     ← Funções WhatsApp Cloud API (Meta)
│   ├── claude.js                       ← Funções Claude API
│   └── skills.js                       ← Carrega e parseia SKILL.md
├── skills/
│   ├── fase1_cadastro/SKILL.md
│   ├── fase2_ativacao_conta/SKILL.md
│   ├── fase3_produto_publicado/SKILL.md
│   ├── fase4_convite_alunos/SKILL.md
│   ├── fase5_primeira_venda/SKILL.md
│   ├── fase6_recorrencia/SKILL.md
│   ├── fase7_recuperacao/SKILL.md
│   └── fase8_briefing_diario/SKILL.md
└── logs/
    ├── orquestrador.log
    └── execucoes/
        └── 2026-03-06_deal12345_fase1.log
```

---

## config.json

```json
{
  "hubspot": {
    "accessToken": "SEU_HUBSPOT_ACCESS_TOKEN",
    "pipelineId": "ID_DO_PIPELINE_MUVX_ATIVACAO",
    "stageIds": {
      "cadastro": "STAGE_ID",
      "ativacao_conta": "STAGE_ID",
      "produto_publicado": "STAGE_ID",
      "convite_alunos": "STAGE_ID",
      "primeira_venda": "STAGE_ID",
      "recorrencia": "STAGE_ID",
      "recuperacao": "STAGE_ID"
    }
  },
  "whatsapp": {
    "phoneNumberId": "SEU_PHONE_NUMBER_ID",
    "accessToken": "SEU_META_ACCESS_TOKEN",
    "verifyToken": "TOKEN_PARA_VALIDAR_WEBHOOK_META"
  },
  "claude": {
    "apiKey": "SEU_ANTHROPIC_API_KEY",
    "model": "claude-sonnet-4-5-20250929"
  },
  "alertas": {
    "giovanna": "55XXXXXXXXXXX",
    "gerente": "55XXXXXXXXXXX"
  }
}
```

---

## Sequência de Implementação

### BLOCO 0 — Validações (Hoje)
1. Falar com a Sil sobre webhooks do Backoffice
2. Confirmar acesso à WhatsApp Business Cloud API (Meta)
3. Ter API Key do HubSpot
4. Ter API Key da Anthropic (Claude)

### BLOCO 1 — Infraestrutura (Dia 1-2)
1. Provisionar servidor (VPS com Node.js 18+)
2. Configurar HubSpot: pipeline 7 fases + 10 campos customizados
3. Configurar webhook nativo do HubSpot → servidor
4. Configurar webhook da Meta (WhatsApp) → servidor
5. Submeter templates de mensagem na Meta
6. Criar config.json com todas as credenciais

### BLOCO 2 — Orquestrador + Primeiras Skills (Dia 2-3)
1. Construir orquestrador.js via Claude Code
2. Criar Skill 8 (Briefing Diário)
3. Criar Skill 1 (Cadastro)
4. Testar ponta a ponta com lead fictício

### BLOCO 3 — Go-Live (Dia 4-5)
1. Validar fluxo completo
2. Subir orquestrador com pm2
3. Go-live com Skills 1 e 8

### BLOCO 4 — Expansão (Semana 1-2)
1. Criar Skills 2, 3 e 4 conforme leads avançam
2. Monitorar qualidade das mensagens

### BLOCO 5 — Sistema Completo (Semana 3 + Abril)
1. Criar Skill 7 (Recuperação)
2. Criar Skills 5 e 6 (Primeira Venda e Recorrência)
3. Revisão completa com dados reais
