# Skill: Fase 4 — CONVITE AOS ALUNOS (Mobilizador de Base)

## Missão
Garantir que a primeira venda aconteça — seja da base atual ou de novos clientes.

## Gatilho de Entrada
Deal movido após confirmação de que os alunos foram convidados (muvx_alunos_convidados = true).

## Gatilho de Avanço
Campo muvx_data_primeira_venda preenchido (webhook transaction.completed) → mover para fase "primeira_venda".

## Gatilho de Encerramento
D+15 sem venda após todos os FUPs → mover para fase "recuperacao".

## Sequência de FUPs

### M1 — Estratégias de venda
- **Timing:** Imediato (fups_enviados = 0 e trigger = webhook)
- **Condição:** Sempre
- **Mensagem de referência:**
  > {nome}, vi que você já convidou aluno para o MUVX. Ótimo movimento. Agora o foco é transformar isso na sua primeira venda. Separei um roteiro validado: {link_roteiro}
- **Tom:** Reconhecimento + direcionamento prático
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota.

### M2 — Diagnóstico
- **Timing:** D+2 (fups_enviados = 1 e pelo menos 48h)
- **Condição:** muvx_data_primeira_venda vazio
- **Mensagem de referência:**
  > {nome}, seu produto está ativo e você já convidou alunos. Te mando 3 estratégias que personais usaram para fazer as primeiras vendas fora da base: {link_guia}
- **Tom:** Expansivo, mostrando possibilidades
- **Após envio:** Setar muvx_fups_enviados = 2. Registrar nota.

### M3 — Case de sucesso
- **Timing:** D+5 (fups_enviados = 2 e pelo menos 120h)
- **Condição:** muvx_data_primeira_venda vazio
- **Mensagem de referência:**
  > {nome}, como está indo a divulgação? Me conta o que você já tentou — posso te ajudar a ajustar.
- **Tom:** Diagnóstico, investigativo com empatia
- **Após envio:** Setar muvx_fups_enviados = 3. Registrar nota.

### M4 — Última tentativa automática
- **Timing:** D+8 (fups_enviados = 3 e pelo menos 192h)
- **Condição:** muvx_data_primeira_venda vazio
- **Mensagem de referência:**
  > {nome}, vou te contar como o {nome_case} fez a primeira venda aqui no MUVX em 3 dias. Estratégia simples: {link_case}
- **Tom:** Prova social, case real
- **Após envio:** Setar muvx_fups_enviados = 4. Registrar nota.

### 🔴 Alerta Giovanna
- **Timing:** D+12 (fups_enviados = 4 e pelo menos 288h)
- **Condição:** muvx_data_primeira_venda vazio após todos os FUPs
- **Briefing:** Produto ativo, dias sem venda, mensagens enviadas, última resposta. Sugestão: call estratégica.
- **Após envio:** Setar muvx_escalada_giovanna = true, muvx_fups_enviados = 5. Registrar nota.

### Encerramento
- **Timing:** D+15
- **Condição:** Sem venda após escalada
- **Ação:** Mover para "recuperacao". Registrar nota.

## Regras de Comportamento
- Nesta fase, já é aceitável sugerir divulgação em redes sociais e captação fora da base.
- Se o lead mencionar dificuldade com preço, sugerir ajuste de oferta (desconto de lançamento, pacote).
- Se estiver ativo mas sem venda, investigar se o problema é divulgação ou produto.
- Se muvx_data_primeira_venda for preenchido a qualquer momento, mover para "primeira_venda".

## Campos HubSpot
- **Lê:** dealname, phone, muvx_alunos_convidados, muvx_data_primeira_venda, muvx_ultima_resposta, muvx_fups_enviados, createdate, hs_lastmodifieddate
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_fase_pipeline, notas
