# Skill: Fase 8 — BRIEFING DIÁRIO (Radar do Funil)

## Missão
Enviar para o Gerente Comercial e para a Giovanna (CS) um resumo completo do funil todo dia às 8h via WhatsApp, garantindo visibilidade total sem precisar abrir o HubSpot.

## Gatilho de Entrada
Cron job diário às 8h. Não depende de webhook — executa automaticamente.

## Instruções de Geração

Com base nos dados recebidos (deals_por_fase), gere uma mensagem WhatsApp concisa e informativa seguindo este formato:

### Formato da Mensagem

```
📊 MUVX — Briefing {data}

FUNIL:
CADASTRO: {N} | ATIVAÇÃO: {N} | PRODUTO: {N} | CONVITE: {N} | 1ª VENDA: {N} | RECORRÊNCIA: {N} | RECUPERAÇÃO: {N}

🔄 MOVIMENTAÇÕES (24h):
- {nome} avançou de {fase_anterior} → {fase_atual}
[listar todas as movimentações das últimas 24h — identificar pelo campo hs_lastmodifieddate]

🔴 ESCALADAS PENDENTES:
- {nome} — {fase} — escalado há {X} dias — sem resolução
[listar deals onde muvx_escalada_giovanna = true e NÃO há nota de resolução recente]

⏰ SLAs VENCENDO HOJE:
- {nome} — {fase} — FUP {N} vence hoje
[listar deals com próximo FUP previsto para hoje, baseado em fups_enviados + data de entrada na fase]
```

### Regras da Mensagem
- Se não houver itens em alguma seção (movimentações, escaladas, SLAs), OMITIR a seção inteira — não mostrar seção vazia.
- Se o funil estiver vazio (0 deals), enviar: "📊 MUVX — Briefing {data}: Funil vazio. Nenhum deal ativo."
- Se houver mais de 5 escaladas pendentes sem resolução, adicionar no início: "⚠️ {N} escaladas pendentes sem resolução — atenção!"
- Mensagem deve ser concisa — WhatsApp não é lugar para relatório longo.
- Nunca incluir dados sensíveis (email, telefone completo) na mensagem — apenas nome e fase.
- Usar emojis com moderação (apenas os do template acima).

## Cálculo de SLAs

Para determinar se um FUP "vence hoje", usar os timings de cada fase:
- Fase 1 (CADASTRO): M1 = imediato, M2 = D+1, Alerta = D+4, Encerramento = D+7
- Fase 2 (ATIVAÇÃO): M1 = 1h, M2 = D+2, M3 = D+4, Alerta = D+7
- Fase 3 (PRODUTO PUBLICADO): M1 = imediato, M2 = D+2, M3 = D+5, Alerta = D+7
- Fase 4 (CONVITE AOS ALUNOS): M1 = imediato, M2 = D+2, M3 = D+5, M4 = D+8, Alerta = D+12
- Fase 5 (PRIMEIRA VENDA): M1 = imediato, M2 = D+2, M3 = D+8, M4 = D+15, Alerta = D+30
- Fase 6 (RECORRÊNCIA): M1 = após 5ª venda, M2 = a cada 30 dias, Alerta = 30 dias sem transação
- Fase 7 (RECUPERAÇÃO): R1 = D+45, R2 = D+50, R3 = D+70, Fechar = D+90

## Campos que Recebe
- data: data atual
- total_deals: número total de deals no pipeline
- deals_por_fase: objeto com arrays de deals por fase, cada deal com: id, nome, fups, escalada, ultima_resposta, modificado

## Formato de Resposta
Retornar JSON com a mensagem formatada no campo "mensagem". Não são necessárias ações no HubSpot (este skill é somente leitura).
