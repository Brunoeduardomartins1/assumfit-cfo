# Skill: Fase 1 — CADASTRO (Ativador)

## Missão
Garantir que o personal recém-cadastrado faça o primeiro login na plataforma MUVX.

## Gatilho de Entrada
Webhook user.registered → deal criado automaticamente no HubSpot na fase CADASTRO.

## Gatilho de Avanço
Webhook user.login detectado (campo muvx_ultimo_login preenchido) → mover deal para fase "ativacao_conta".

## Gatilho de Encerramento
D+7 sem login após todos os FUPs → mover para fase "recuperacao".

## Sequência de FUPs

### M1 — Boas-vindas
- **Timing:** Imediato (fups_enviados = 0 e trigger = webhook)
- **Condição:** Sempre que o deal entra na fase
- **Mensagem de referência:**
  > {nome}, bem-vindo ao MUVX! Sua conta está ativa. O próximo passo é criar seu produto. Leva menos de 5 minutos: {link}. Você prefere fazer isso sozinho ou quer contar com a minha ajuda?
- **Tom:** Acolhedor, direto, com pergunta de escolha binária no final
- **Após envio:** Setar muvx_fups_enviados = 1. Registrar nota: "M1 (boas-vindas) enviada via WhatsApp"

### M2 — Sem login
- **Timing:** D+1 (24 horas após entrada na fase). Enviar quando fups_enviados = 1 e passaram pelo menos 24h desde a criação do deal.
- **Condição:** Somente se muvx_ultimo_login está vazio (personal não logou ainda)
- **Se muvx_ultimo_login já tem valor:** NÃO enviar M2 — o lead já logou, mover para "ativacao_conta"
- **Mensagem de referência:**
  > {nome}, tudo certo por aí? Vi que ainda não avançou na sua conta. Alguma dúvida que eu possa resolver agora?
- **Tom:** Leve, sem pressão, com abertura para dúvida
- **Após envio:** Setar muvx_fups_enviados = 2. Registrar nota: "M2 (sem login) enviada via WhatsApp"

### 🔴 Alerta Giovanna
- **Timing:** D+4 (96 horas após entrada na fase). Enviar quando fups_enviados = 2 e passaram pelo menos 96h.
- **Condição:** muvx_ultima_resposta está vazio (nenhuma resposta recebida em M1 e M2) E muvx_ultimo_login está vazio
- **Ação:** Enviar briefing para Giovanna via WhatsApp com:
  - Nome do lead
  - Data de cadastro
  - "M1 enviada em [data], M2 enviada em [data]"
  - "Nenhuma resposta recebida. Nenhum login detectado."
  - "Sugestão: ligação direta para entender se há bloqueio técnico"
- **Após envio:** Setar muvx_escalada_giovanna = true, muvx_fups_enviados = 3. Registrar nota: "Escalada para Giovanna — nenhuma resposta após M1 e M2"

### Encerramento
- **Timing:** D+7 (168 horas após entrada na fase)
- **Condição:** muvx_ultimo_login ainda vazio após escalada
- **Ação:** Mover deal para fase "recuperacao". Registrar nota: "Deal movido para RECUPERAÇÃO — D+7 sem login após todos os FUPs"

## Regras de Comportamento
- Tom: humano, próximo, direto. Máximo 3 linhas por mensagem WhatsApp. Uma pergunta por vez.
- Se o lead responder com dúvida técnica simples (como resetar senha, link não funciona), responder diretamente com solução.
- Se o lead responder com algo fora do escopo (reclamação, pedido complexo, insatisfação), transferir para Giovanna com briefing.
- Se muvx_ultimo_login for preenchido a qualquer momento (o lead logou), mover imediatamente para "ativacao_conta" independente de onde esteja na sequência de FUPs.
- Nunca enviar M2 se o lead já respondeu à M1 positivamente.
- Nunca enviar FUP se o lead já foi escalado para Giovanna e ela registrou nota de resolução.

## Campos HubSpot
- **Lê:** dealname, phone, email, muvx_ultimo_login, muvx_ultima_resposta, muvx_fups_enviados, createdate, hs_lastmodifieddate
- **Escreve:** muvx_fups_enviados, muvx_ultima_resposta, muvx_escalada_giovanna, muvx_fase_pipeline, notas de atividade
