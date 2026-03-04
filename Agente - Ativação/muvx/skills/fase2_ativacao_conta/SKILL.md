# Skill: Fase 2 — ATIVAÇÃO DA CONTA (Ativador de Conta)

## Missão
Garantir que o personal publique seu primeiro produto na plataforma MUVX.

## Gatilho de Entrada
Deal movido para esta fase (via webhook user.login ou movimentação manual).

## Gatilho de Avanço
Campo muvx_produto_publicado = true (webhook product.published) → mover deal para fase "produto_publicado".

## Gatilho de Encerramento
D+10 sem produto publicado após todos os FUPs → mover para fase "recuperacao".

## Sequência de FUPs

### M1 — Orientação produto
- **Timing:** 1h após entrada na fase (fups_enviados = 0 e pelo menos 1h desde entrada)
- **Condição:** Sempre
- **Mensagem de referência:**
  > {nome}, que bom ter você com a gente! Agora o passo mais importante: criar seu produto. Personais que publicam em até 24h têm 3x mais chance de fazer a primeira venda. Bora? {link_criar_produto}
- **Tom:** Energético, com dado de urgência positiva
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota.

### M2 — Sem produto
- **Timing:** D+2 (fups_enviados = 1 e pelo menos 48h desde entrada)
- **Condição:** muvx_produto_publicado = false
- **Se produto já publicado:** NÃO enviar — mover para "produto_publicado"
- **Mensagem de referência:**
  > {nome}, o que você quer vender primeiro? Um treino online ou uma assessoria presencial? Me conta, posso te ajudar a estruturar agora mesmo.
- **Tom:** Consultivo, pergunta direcionada
- **Após envio:** Setar muvx_fups_enviados = 2. Registrar nota.

### M3 — Suporte direto
- **Timing:** D+4 (fups_enviados = 2 e pelo menos 96h desde entrada)
- **Condição:** muvx_produto_publicado = false
- **Mensagem de referência:**
  > {nome}, vi que você ainda não publicou! Posso te mandar um exemplo de produto que está vendendo bem no MUVX? Certamente irá ajudar a ter uma ideia do que criar.
- **Tom:** Prestativo, sem julgamento
- **Após envio:** Setar muvx_fups_enviados = 3. Registrar nota.

### 🔴 Alerta Giovanna
- **Timing:** D+7 (fups_enviados = 3 e pelo menos 168h desde entrada)
- **Condição:** muvx_produto_publicado = false após todos os FUPs
- **Briefing:** Histórico de login, mensagens enviadas, sem produto publicado. Sugestão: ligação para entender o bloqueio.
- **Após envio:** Setar muvx_escalada_giovanna = true, muvx_fups_enviados = 4. Registrar nota.

### Encerramento
- **Timing:** D+10
- **Condição:** muvx_produto_publicado = false após escalada
- **Ação:** Mover para "recuperacao". Registrar nota.

## Regras de Comportamento
- Se o lead perguntar "o que vende bem?", dar 2-3 exemplos de produtos populares no MUVX.
- Se disser que não sabe criar, oferecer link do tutorial ou sugerir produto simples.
- Se muvx_produto_publicado mudar para true a qualquer momento, mover imediatamente para "produto_publicado".
- Nunca enviar próximo FUP se o lead respondeu ao anterior (aguardar processamento).

## Campos HubSpot
- **Lê:** dealname, phone, muvx_produto_publicado, muvx_ultimo_login, muvx_ultima_resposta, muvx_fups_enviados, createdate, hs_lastmodifieddate
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_fase_pipeline, notas
