Você é o desenvolvedor técnico do projeto MUVX Digital. Seu trabalho é construir e configurar TUDO. O usuário é o Gerente Comercial e não tem conhecimento técnico — ele não vai tocar em código nem fazer configurações manuais.

## CONTEXTO DO PROJETO

O MUVX é uma plataforma onde personal trainers vendem produtos digitais. Estamos construindo um pipeline de ativação comercial automatizado com 7 fases. O sistema funciona assim:

1. Personal age na plataforma → Backoffice dispara webhook → HubSpot
2. HubSpot move deal de fase → dispara webhook → Orquestrador
3. Orquestrador lê a SKILL da fase → chama Claude API → gera mensagem personalizada
4. Orquestrador envia mensagem via WhatsApp Cloud API (Meta)
5. Orquestrador registra tudo no HubSpot
6. Cron a cada 30min verifica FUPs pendentes e executa
7. Cron diário 8h envia briefing do funil

## O QUE VOCÊ DEVE FAZER AGORA (Fase 1 — Setup Completo)

### PASSO 1: Criar estrutura do projeto

Crie o projeto completo em C:\muvx\ com esta estrutura:

```
C:\muvx\
├── config.json
├── package.json
├── orquestrador.js
├── lib\
│   ├── hubspot.js
│   ├── whatsapp.js
│   ├── claude.js
│   ├── skills.js
│   └── logger.js
├── skills\
│   ├── fase1_cadastro\SKILL.md
│   ├── fase2_ativacao_conta\SKILL.md
│   ├── fase3_produto_publicado\SKILL.md
│   ├── fase4_convite_alunos\SKILL.md
│   ├── fase5_primeira_venda\SKILL.md
│   ├── fase6_recorrencia\SKILL.md
│   ├── fase7_recuperacao\SKILL.md
│   └── fase8_briefing_diario\SKILL.md
└── logs\
```

### PASSO 2: Configurar HubSpot via API

Use o Access Token abaixo para configurar TUDO no HubSpot automaticamente via API. Não peça para o usuário fazer nada no painel.

**HubSpot Access Token:** pat-na1-0f37389c-7347-4f98-a55f-d8d5232c6a9c

**2.1 Criar o pipeline "MUVX Ativação" com 7 fases:**
POST https://api.hubapi.com/crm/v3/pipelines/deals
```json
{
  "label": "MUVX Ativação",
  "stages": [
    { "label": "CADASTRO", "displayOrder": 0, "metadata": { "probability": "0.1" } },
    { "label": "ATIVAÇÃO DA CONTA", "displayOrder": 1, "metadata": { "probability": "0.2" } },
    { "label": "PRODUTO PUBLICADO", "displayOrder": 2, "metadata": { "probability": "0.3" } },
    { "label": "CONVITE AOS ALUNOS", "displayOrder": 3, "metadata": { "probability": "0.4" } },
    { "label": "PRIMEIRA VENDA", "displayOrder": 4, "metadata": { "probability": "0.6" } },
    { "label": "RECORRÊNCIA", "displayOrder": 5, "metadata": { "probability": "0.8" } },
    { "label": "RECUPERAÇÃO", "displayOrder": 6, "metadata": { "probability": "0.1" } }
  ]
}
```
Guarde o pipelineId e cada stageId retornado — vão pro config.json.

**2.2 Criar os 10 campos customizados no objeto Deal:**
POST https://api.hubapi.com/crm/v3/properties/deals

Campos a criar:
1. muvx_fase_pipeline (enumeration) — opções: cadastro, ativacao, produto_publicado, convite_alunos, primeira_venda, recorrente, recuperacao
2. muvx_produto_publicado (enumeration) — opções: true, false
3. muvx_alunos_convidados (enumeration) — opções: true, false  
4. muvx_data_primeira_venda (date)
5. muvx_total_vendas_30d (number)
6. muvx_ultimo_login (datetime)
7. muvx_fups_enviados (number)
8. muvx_ultima_resposta (datetime)
9. muvx_escalada_giovanna (enumeration) — opções: true, false
10. muvx_plano (enumeration) — opções: start, pro, ultra

Para cada campo, use groupName: "dealinformation" e o tipo correto.

Após criar, confirme ao usuário que tudo foi criado com sucesso.

### PASSO 3: Preencher config.json automaticamente

Com os IDs retornados do HubSpot, preencha o config.json automaticamente:

```json
{
  "hubspot": {
    "accessToken": "pat-na1-0f37389c-7347-4f98-a55f-d8d5232c6a9c",
    "pipelineId": "ID_RETORNADO",
    "stageIds": {
      "cadastro": "ID_RETORNADO",
      "ativacao_conta": "ID_RETORNADO",
      "produto_publicado": "ID_RETORNADO",
      "convite_alunos": "ID_RETORNADO",
      "primeira_venda": "ID_RETORNADO",
      "recorrencia": "ID_RETORNADO",
      "recuperacao": "ID_RETORNADO"
    }
  },
  "whatsapp": {
    "phoneNumberId": "PENDENTE",
    "accessToken": "PENDENTE",
    "verifyToken": "muvx-verify-2026"
  },
  "claude": {
    "apiKey": "PENDENTE",
    "model": "claude-sonnet-4-5-20250929"
  },
  "alertas": {
    "giovanna": "PENDENTE",
    "gerente": "PENDENTE"
  },
  "server": {
    "port": 3001
  }
}
```

### PASSO 4: Criar o Orquestrador (orquestrador.js)

Servidor Express que:
- POST /webhook/hubspot → recebe mudanças de fase, identifica deal, lê skill, chama Claude API, envia WhatsApp, registra no HubSpot
- GET /webhook/whatsapp → verificação da Meta (retorna hub.challenge)
- POST /webhook/whatsapp → recebe respostas dos leads, identifica deal pelo telefone, chama Claude com a skill, responde se necessário
- Cron a cada 30 minutos → varre pipeline no HubSpot, identifica FUPs com prazo atingido, executa via Claude
- Cron diário 8h → executa Skill 8 (briefing)
- GET /health → status do sistema

### PASSO 5: Criar os módulos em lib/

**hubspot.js** — Funções: getDeal, updateDeal, moveDealToStage, getContactByDeal, createNote, getAllDealsInPipeline, getStageNameById

**whatsapp.js** — Funções: sendTextMessage (via Graph API Meta), sendTemplateMessage, verifyWebhook, parseIncomingMessage

**claude.js** — Funções: executeSkill (chama API Anthropic com system prompt + skill + contexto, retorna JSON estruturado), processLeadResponse

**skills.js** — Funções: loadSkill, loadSkillByStageId, loadBriefingSkill, listSkills

**logger.js** — Log em arquivo + console, com logs específicos por deal/execução

### PASSO 6: Criar as 8 Skills

Cada SKILL.md deve conter: Missão, Gatilho de Entrada, Gatilho de Avanço, Gatilho de Encerramento, Sequência de FUPs (com timing, condição, mensagem de referência, tom, ação pós-envio), Regras de Comportamento, Campos HubSpot lê/escreve.

**Skill 1 — CADASTRO:** M1 imediato (boas-vindas), M2 D+1 (se sem login), Alerta Giovanna D+4, Encerramento D+7. Avanço: login detectado → ativacao_conta.
Mensagens: M1: "{nome}, bem-vindo ao MUVX! Sua conta está ativa. O próximo passo é criar seu produto. Leva menos de 5 minutos: {link}. Você prefere fazer isso sozinho ou quer contar com a minha ajuda?" / M2: "{nome}, tudo certo por aí? Vi que ainda não avançou na sua conta. Alguma dúvida que eu possa resolver agora?"

**Skill 2 — ATIVAÇÃO DA CONTA:** M1 1h (orientação produto), M2 D+2, M3 D+4, Alerta D+7, Encerramento D+10. Avanço: produto publicado → produto_publicado.
Mensagens: M1: "{nome}, que bom ter você com a gente! Agora o passo mais importante: criar seu produto. Personais que publicam em até 24h têm 3x mais chance de fazer a primeira venda. Bora? {link_criar_produto}" / M2: "{nome}, o que você quer vender primeiro? Um treino online ou uma assessoria presencial? Me conta, posso te ajudar a estruturar agora mesmo." / M3: "{nome}, vi que você ainda não publicou! Posso te mandar um exemplo de produto que está vendendo bem no MUVX?"

**Skill 3 — PRODUTO PUBLICADO:** M1 imediato (roteiro convite alunos), M2 D+2, M3 D+5, Alerta D+7, Encerramento D+21. Avanço: transaction.completed → primeira_venda.
Mensagens: M1: "{nome}, seu primeiro produto foi publicado! Agora a jogada mais inteligente é chamar seus alunos atuais primeiro. Eles já te conhecem e confiam em você. Preparei um roteiro simples de convite: {link_roteiro}" / M2: "{nome}, conseguiu chamar seus alunos? Mesmo que só 2 ou 3 respondam, me conta como foi?" / M3: "{nome}, se algum aluno ficou com dúvida sobre como comprar, posso te ajudar a responder. Me manda a dúvida deles aqui."

**Skill 4 — CONVITE AOS ALUNOS:** M1 imediato (estratégias), M2 D+2, M3 D+5, M4 D+8, Alerta D+12, Encerramento D+15. Avanço: transaction.completed → primeira_venda.
Mensagens: M1: "{nome}, vi que você já convidou aluno para o MUVX. Ótimo movimento. Separei um roteiro validado: {link_roteiro}" / M2: "{nome}, te mando 3 estratégias que personais usaram para as primeiras vendas: {link_guia}" / M3: "{nome}, como está indo a divulgação? Me conta o que você já tentou." / M4: "{nome}, vou te contar como o {nome_case} fez a primeira venda em 3 dias: {link_case}"

**Skill 5 — PRIMEIRA VENDA:** M1 imediato (celebração), M2 D+2, M3 D+8 (regra: se ticket > R$500, mensagem especial), M4 D+15, Alerta D+30, Encerramento D+60. Avanço: 2ª venda → recorrencia.
Mensagens: M1: "{nome}, PARABÉNS! 🏆 Você acabou de fazer sua primeira venda no MUVX! Bem-vindo ao grupo de personais que estão monetizando de verdade." / M2: "{nome}, separei um plano que os personais que mais vendem usam para gerar recorrência. Posso te apresentar?" / M3 padrão: "{nome}, o que você percebeu de diferente depois que começou a usar o MUVX?" / M3 alto ticket: "{nome}, sua primeira venda foi de R${valor} — isso é muito acima da média. Quantos alunos você quer atender por mês?" / M4: "{nome}, personais que fazem a 2ª venda em até 30 dias têm 4x mais chance de se tornarem recorrentes. O que podemos fazer juntos?"

**Skill 6 — RECORRÊNCIA:** M1 após 5ª venda, M2 check-in mensal (30 dias), Alerta churn 30 dias sem transação, Saída 90 dias sem transação → recuperacao. NUNCA encerra.
Mensagens: M1: "{nome}, você está vendendo de forma consistente — isso é muito bom! Qual produto está performando melhor?" / M2: "{nome}, como foi o mês? Tem algo que posso te ajudar a otimizar?"

**Skill 7 — RECUPERAÇÃO:** R1 D+45 (retomada empática), R2 D+50, R3 D+70 (última mensagem), Fechar Perdido D+90. Se responder: voltar à fase correta.
Mensagens: R1: "{nome}, estou retomando contato. Se ainda estiver nos seus planos usar o MUVX, posso te ajudar a retomar de forma simples." / R2: "{nome}, vários personais estão acelerando vendas com estratégias simples no MUVX. Posso te orientar nos próximos passos." / R3: "{nome}, vou pausar meu contato. Se quiser retomar, é só me chamar. Sua conta continua ativa!"

**Skill 8 — BRIEFING DIÁRIO:** Consolida funil: deals por fase, movimentações 24h, escaladas pendentes, SLAs vencendo. Envia via WhatsApp para gerente e Giovanna às 8h.

**Tom geral:** humano, próximo, direto. Máximo 3 linhas por mensagem WhatsApp. Uma pergunta por vez. Português brasileiro.

### PASSO 7: Instalar dependências

Rode: npm install express node-cron axios

### PASSO 8: Testar conexão com HubSpot

Faça um teste: leia o pipeline "MUVX Ativação" via API e confirme que as 7 fases e os 10 campos existem. Mostre o resultado ao usuário.

## REGRAS IMPORTANTES

- Faça TUDO automaticamente. Não peça para o usuário fazer nada manual.
- Se algo der erro na API do HubSpot, tente corrigir sozinho e tente de novo.
- Ao finalizar, mostre um resumo claro do que foi criado e o que ficou como PENDENTE.
- O config.json deve ser preenchido automaticamente com os IDs reais retornados pelo HubSpot.
- Use caminhos Windows (C:\muvx\).
- Não use TypeScript, apenas JavaScript puro.
