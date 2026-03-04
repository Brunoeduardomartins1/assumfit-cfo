# Skill: Fase 3 — PRODUTO PUBLICADO (Acelerador de Venda)

## Missão
Garantir que o personal convide sua base atual de alunos e faça a primeira venda.

## Gatilho de Entrada
Deal movido após webhook product.published.

## Gatilho de Avanço
Campo muvx_data_primeira_venda preenchido (webhook transaction.completed) → mover para fase "primeira_venda".

## Gatilho de Encerramento
D+21 sem venda após todos os FUPs → mover para fase "recuperacao".

## Sequência de FUPs

### M1 — Roteiro de convite
- **Timing:** Imediato (fups_enviados = 0 e trigger = webhook)
- **Condição:** Sempre
- **Mensagem de referência:**
  > {nome}, seu primeiro produto foi publicado! Agora a jogada mais inteligente é chamar seus alunos atuais primeiro. Eles já te conhecem e confiam em você. Preparei um roteiro simples de convite: {link_roteiro}
- **Tom:** Celebratório + estratégico
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota.

### M2 — Confirmação
- **Timing:** D+2 (fups_enviados = 1 e pelo menos 48h)
- **Condição:** muvx_data_primeira_venda vazio (sem venda ainda)
- **Mensagem de referência:**
  > {nome}, conseguiu chamar seus alunos? Mesmo que só 2 ou 3 respondam, me conta como foi?
- **Tom:** Encorajador, baixa expectativa para gerar resposta
- **Após envio:** Setar muvx_fups_enviados = 2. Registrar nota.

### M3 — Suporte de conversão
- **Timing:** D+5 (fups_enviados = 2 e pelo menos 120h)
- **Condição:** muvx_data_primeira_venda vazio
- **Mensagem de referência:**
  > {nome}, se algum aluno ficou com dúvida sobre como comprar, posso te ajudar a responder. Me manda a dúvida deles aqui e a gente resolve junto.
- **Tom:** Parceiro, resolutivo
- **Após envio:** Setar muvx_fups_enviados = 3. Registrar nota.

### 🔴 Alerta Giovanna
- **Timing:** D+7 (fups_enviados = 3 e pelo menos 168h)
- **Condição:** muvx_data_primeira_venda vazio após todos os FUPs
- **Briefing:** Produto publicado, nome do produto, preço, dias sem venda, mensagens enviadas.
- **Após envio:** Setar muvx_escalada_giovanna = true, muvx_fups_enviados = 4. Registrar nota.

### Encerramento
- **Timing:** D+21
- **Condição:** Sem venda após escalada
- **Ação:** Mover para "recuperacao". Registrar nota.

## Regras de Comportamento
- Foco total em ativar a base existente de alunos — NÃO sugerir tráfego pago ou captação nova nesta fase.
- Se o lead reportar dificuldade técnica de aluno para comprar, oferecer passo a passo imediato.
- Se disser que não tem alunos, recomendar: stories, lista de transmissão, posts no Instagram.
- Se muvx_data_primeira_venda for preenchido a qualquer momento, mover para "primeira_venda".

## Campos HubSpot
- **Lê:** dealname, phone, muvx_produto_publicado, muvx_data_primeira_venda, muvx_ultima_resposta, muvx_fups_enviados, createdate, hs_lastmodifieddate
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_alunos_convidados, muvx_fase_pipeline, notas
