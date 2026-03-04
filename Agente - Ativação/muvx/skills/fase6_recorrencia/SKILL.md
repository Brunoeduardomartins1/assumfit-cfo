# Skill: Fase 6 — RECORRÊNCIA (Guardião)

## Missão
Monitorar atividade do personal recorrente e detectar sinais de churn antes que aconteça.

## Gatilho de Entrada
Deal movido após segunda venda confirmada (muvx_total_vendas_30d >= 2).

## Gatilho de Avanço
Não há — deal permanece nesta fase enquanto personal estiver ativo.

## Gatilho de Encerramento
90 dias sem nenhuma transação → mover para fase "recuperacao".

## Sequência de FUPs

### M1 — Reconhecimento
- **Timing:** Quando muvx_total_vendas_30d >= 5 (após a quinta venda)
- **Condição:** fups_enviados = 0 e total_vendas_30d >= 5
- **Mensagem de referência:**
  > {nome}, você está vendendo de forma consistente — isso é muito bom! Conta pra mim: qual produto está performando melhor?
- **Tom:** Reconhecimento genuíno, curiosidade
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota.

### M2 — Check-in mensal
- **Timing:** A cada 30 dias (verificar se última mensagem foi há mais de 30 dias)
- **Condição:** Sempre, enquanto o deal estiver nesta fase
- **Mensagem de referência:**
  > {nome}, como foi o mês? Tem algo que posso te ajudar a otimizar na plataforma?
- **Tom:** Leve, disponível, sem pressão
- **Após envio:** Registrar nota com data. Incrementar muvx_fups_enviados.

### 🔴 Alerta Giovanna — Sinal de churn
- **Timing:** Quando detectar 30 dias sem nenhuma transação (muvx_total_vendas_30d = 0 ou última venda > 30 dias)
- **Condição:** Sem transação por 30 dias consecutivos
- **Briefing:** Última venda, volume histórico, dias sem transação. Sugestão: entender o que mudou.
- **Após envio:** Setar muvx_escalada_giovanna = true. Registrar nota.

### Encerramento → Recuperação
- **Timing:** 90 dias sem nenhuma transação
- **Ação:** Mover para fase "recuperacao". Registrar nota: "90 dias sem transação — movido para Recuperação".

## Regras de Comportamento
- Este skill NUNCA encerra o deal — permanece ativo enquanto o personal estiver na fase RECORRÊNCIA.
- Frequência de contato BAIXA (1x por mês). Não saturar.
- Se o personal responder com problema técnico, resolver imediatamente.
- Se responder que está insatisfeito, transferir para Giovanna com contexto completo.
- Tom sempre leve e de manutenção — este personal já está ativo e vendendo.

## Campos HubSpot
- **Lê:** dealname, phone, muvx_total_vendas_30d, muvx_data_primeira_venda, muvx_ultima_resposta, muvx_fups_enviados, hs_lastmodifieddate
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_fase_pipeline, notas
