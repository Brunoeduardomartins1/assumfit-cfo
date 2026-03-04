# Skill: Fase 7 — RECUPERAÇÃO (Reativador)

## Missão
Última tentativa estruturada de reengajamento antes de fechar o deal como Perdido.

## Gatilho de Entrada
Deal movido automaticamente quando todos os FUPs de qualquer fase foram esgotados sem resposta. Giovanna já foi alertada previamente.

## Gatilho de Avanço
Resposta recebida com retomada de atividade → identificar em qual fase o personal parou e mover o deal de volta para a fase correta (resetar muvx_fups_enviados = 0).

## Gatilho de Encerramento
D+90 sem nenhuma resposta → fechar deal como Perdido.

## Sequência de FUPs

### R1 — Retomada empática
- **Timing:** D+45 após entrada na fase (fups_enviados = 0 e pelo menos 45 dias)
- **Condição:** Sempre
- **Mensagem de referência:**
  > {nome}, estou retomando contato porque você iniciou com a gente há um tempo. Se ainda estiver nos seus planos usar o MUVX, posso te ajudar a retomar de forma simples.
- **Tom:** Empático, sem cobrança, porta aberta
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota.

### R2 — Reengajamento com valor
- **Timing:** D+50 (fups_enviados = 1 e pelo menos 50 dias)
- **Condição:** muvx_ultima_resposta vazio (sem resposta à R1)
- **Mensagem de referência:**
  > {nome}, nas últimas semanas vários personais aceleraram vendas com estratégias simples no MUVX. Se quiser explorar essa oportunidade, posso te orientar nos próximos passos.
- **Tom:** Valor social, oportunidade sem pressão
- **Após envio:** Setar muvx_fups_enviados = 2. Registrar nota.

### R3 — Última mensagem
- **Timing:** D+70 (fups_enviados = 2 e pelo menos 70 dias)
- **Condição:** muvx_ultima_resposta vazio (sem resposta à R1 e R2)
- **Mensagem de referência:**
  > {nome}, vou pausar meu contato por enquanto. Se quiser retomar quando fizer sentido, é só me chamar. Sua conta continua ativa!
- **Tom:** Respeitoso, sem ressentimento, porta aberta
- **Após envio:** Setar muvx_fups_enviados = 3. Registrar nota.

### ❌ Fechar como Perdido
- **Timing:** D+90 (fups_enviados = 3 e pelo menos 90 dias)
- **Condição:** muvx_ultima_resposta vazio (sem resposta após R1, R2, R3)
- **Ação:** NÃO enviar mensagem. Apenas atualizar deal no HubSpot:
  - Status: Perdido (closed lost)
  - Registrar nota: "Deal fechado como Perdido — sem resposta após ciclo completo de recuperação"
  - Mover contato para lista de cold outreach futuro

## Regras de Comportamento
- Se o lead responder a QUALQUER FUP desta fase: identificar em qual fase ele parou originalmente. Perguntar o que ele quer fazer. Mover de volta para a fase correta com muvx_fups_enviados = 0.
- Tom significativamente mais espaçado que outras fases — intervalos longos (dias 45, 50, 70, 90) são INTENCIONAIS.
- NUNCA cobrar ou culpar o lead por ter sumido.
- Se o lead responder que desistiu do MUVX, fechar como Perdido imediatamente com nota explicativa.
- Se o lead responder com interesse mas sem clareza, transferir para Giovanna com briefing.

## Campos HubSpot
- **Lê:** dealname, phone, muvx_fase_pipeline (fase anterior), muvx_ultima_resposta, muvx_fups_enviados, createdate, hs_lastmodifieddate, todo o histórico de notas
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_fase_pipeline, deal_status, notas
