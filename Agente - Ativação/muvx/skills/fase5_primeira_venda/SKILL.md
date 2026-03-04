# Skill: Fase 5 — PRIMEIRA VENDA (Consolidador)

## Missão
Celebrar a primeira venda, garantir recorrência e preparar para a segunda venda.

## Gatilho de Entrada
Webhook transaction.completed recebido pela primeira vez para este personal.

## Gatilho de Avanço
Segunda transaction.completed detectada (muvx_total_vendas_30d >= 2) → mover para fase "recorrencia".

## Gatilho de Encerramento
D+60 sem segunda venda → mover para fase "recuperacao".

## Sequência de FUPs

### M1 — Celebração
- **Timing:** Imediato (fups_enviados = 0 e trigger = webhook)
- **Condição:** Sempre
- **Mensagem de referência:**
  > {nome}, PARABÉNS! 🏆 Você acabou de fazer sua primeira venda no MUVX! Bem-vindo ao grupo de personais que estão monetizando de verdade. Isso é só o começo.
- **Tom:** Genuinamente celebratório, caloroso
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota.

### M2 — Próximos passos
- **Timing:** D+2 (fups_enviados = 1 e pelo menos 48h)
- **Condição:** Sempre
- **Mensagem de referência:**
  > {nome}, agora que você já sentiu como funciona, separei um plano simples que os personais que mais vendem usam para gerar recorrência. Posso te apresentar?
- **Tom:** Estratégico, parceiro de crescimento
- **Após envio:** Setar muvx_fups_enviados = 2. Registrar nota.

### M3 — Check-in
- **Timing:** D+8 (fups_enviados = 2 e pelo menos 192h)
- **Condição:** muvx_total_vendas_30d < 2 (sem segunda venda)
- **REGRA ESPECIAL:** Se o valor da primeira venda (valor_deal) > 500, PULAR a M3 padrão e enviar:
  > {nome}, sua primeira venda foi de R${valor} — isso é muito acima da média. Você claramente tem um público que valoriza seu trabalho. Quantos alunos você quer atender por mês no MUVX?
- **Mensagem padrão (se valor <= 500):**
  > {nome}, a primeira venda já foi e é só o começo. O que você percebeu de diferente nas conversas depois que começou a usar o MUVX?
- **Tom:** Reflexivo, buscando engajamento
- **Após envio:** Setar muvx_fups_enviados = 3. Registrar nota.

### M4 — Incentivo à recorrência
- **Timing:** D+15 (fups_enviados = 3 e pelo menos 360h)
- **Condição:** muvx_total_vendas_30d < 2
- **Mensagem de referência:**
  > {nome}, você fez a primeira venda há {X} dias. Personais que fazem a segunda venda em até 30 dias têm 4x mais chance de se tornarem recorrentes. O que podemos fazer juntos para isso acontecer?
- **Tom:** Dados + parceria, sem pressão
- **Após envio:** Setar muvx_fups_enviados = 4. Registrar nota.

### 🔴 Alerta Giovanna
- **Timing:** D+30 (fups_enviados = 4 e pelo menos 720h)
- **Condição:** muvx_total_vendas_30d < 2 após todos os FUPs
- **Briefing:** Data da primeira venda, ticket, produto vendido, mensagens enviadas. Sugestão: entender o que travou.
- **Após envio:** Setar muvx_escalada_giovanna = true, muvx_fups_enviados = 5. Registrar nota.

### Encerramento
- **Timing:** D+60
- **Condição:** Sem segunda venda após escalada
- **Ação:** Mover para "recuperacao". Registrar nota.

## Regras de Comportamento
- Se o lead responder que está com dificuldade em atrair novos clientes, sugerir estratégias de indicação e recompra.
- Nunca pressionar — esta fase é sobre consolidar confiança.
- Se muvx_total_vendas_30d >= 2 a qualquer momento, mover para "recorrencia".

## Campos HubSpot
- **Lê:** dealname, phone, muvx_data_primeira_venda, muvx_total_vendas_30d, muvx_ultima_resposta, muvx_fups_enviados, amount, createdate, hs_lastmodifieddate
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_fase_pipeline, notas
