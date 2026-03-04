# MUVX Orquestrador — Guia de Deploy

## O que é isso
Este é o sistema completo de ativação comercial do MUVX. Um único serviço Node.js (orquestrador.js) que:
- Recebe webhooks do HubSpot quando deals mudam de fase
- Recebe mensagens dos leads via WhatsApp (Meta Cloud API)
- Lê a skill da fase correspondente
- Chama o Claude para gerar mensagens personalizadas
- Envia as mensagens via WhatsApp
- Registra tudo no HubSpot
- Verifica FUPs pendentes a cada 30 minutos
- Envia briefing diário às 8h

## Pré-requisitos
1. **Servidor** com Node.js 18+ (VPS DigitalOcean, AWS EC2, etc.)
2. **HubSpot** com pipeline "MUVX Ativação" configurado (7 fases + 10 campos)
3. **WhatsApp Business Cloud API** (acesso via Meta Developer Portal)
4. **API Key da Anthropic** (Claude)

## Como fazer deploy

### 1. Copiar projeto para o servidor
```bash
scp -r ./muvx/ usuario@seu-servidor:/opt/muvx/
```

### 2. Instalar dependências
```bash
cd /opt/muvx
npm install
```

### 3. Preencher config.json
Abra `/opt/muvx/config.json` e substitua todos os valores "SEU_..." pelas credenciais reais.

### 4. Testar
```bash
node orquestrador.js
```
Deve mostrar: "Orquestrador MUVX rodando na porta 3001"

### 5. Rodar em produção com pm2
```bash
npm install -g pm2
pm2 start orquestrador.js --name "muvx"
pm2 save
pm2 startup
```

### 6. Configurar webhooks
- **HubSpot:** Settings → Integrations → apontar para `http://SEU-IP:3001/webhook/hubspot`
- **Meta/WhatsApp:** Developer Portal → Webhook → apontar para `http://SEU-IP:3001/webhook/whatsapp`

### 7. Verificar se está funcionando
```bash
curl http://localhost:3001/health
```

## Como ajustar comportamento
Para mudar qualquer mensagem, timing ou regra:
1. Abrir o arquivo da skill: `/opt/muvx/skills/faseN_nome/SKILL.md`
2. Editar o que quiser (é texto puro)
3. Salvar — a mudança entra em vigor na próxima execução automaticamente

**Não precisa reiniciar o orquestrador.** As skills são lidas a cada execução.

## Comandos úteis via Claude Code
```bash
# Ver estado do funil
$ claude "Conecte na HubSpot API e me diga quantos deals em cada fase"

# Debugar um lead específico
$ claude "O lead João não recebeu M1. Leia os logs em /opt/muvx/logs/ e descubra o que aconteceu"

# Gerar variações de mensagem
$ claude "Leia a skill /opt/muvx/skills/fase1_cadastro/SKILL.md e sugira 3 variações da M1 com tom mais direto"
```
