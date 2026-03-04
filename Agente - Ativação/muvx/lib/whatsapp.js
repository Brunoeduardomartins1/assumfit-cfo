const axios = require("axios");
const config = require("../config.json");
const logger = require("./logger");

const GRAPH_API = "https://graph.facebook.com/v21.0";

const api = axios.create({
  baseURL: `${GRAPH_API}/${config.whatsapp.phoneNumberId}`,
  headers: {
    Authorization: `Bearer ${config.whatsapp.accessToken}`,
    "Content-Type": "application/json",
  },
});

// ─── Enviar mensagem de texto livre ──────────────────────
// Funciona dentro da janela de 24h (após lead responder)
// ou como resposta a uma mensagem recebida

async function sendTextMessage(phoneNumber, text) {
  try {
    const { data } = await api.post("/messages", {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: text },
    });
    logger.info(`WhatsApp: mensagem enviada para ${phoneNumber}`, {
      messageId: data.messages?.[0]?.id,
    });
    return data;
  } catch (err) {
    logger.error(`WhatsApp: erro ao enviar para ${phoneNumber}`, {
      error: err.response?.data || err.message,
    });
    throw err;
  }
}

// ─── Enviar template (mensagem proativa fora da janela 24h) ───

async function sendTemplateMessage(phoneNumber, templateName, languageCode = "pt_BR", components = []) {
  try {
    const { data } = await api.post("/messages", {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components.length > 0 ? components : undefined,
      },
    });
    logger.info(`WhatsApp: template '${templateName}' enviado para ${phoneNumber}`, {
      messageId: data.messages?.[0]?.id,
    });
    return data;
  } catch (err) {
    logger.error(`WhatsApp: erro ao enviar template para ${phoneNumber}`, {
      error: err.response?.data || err.message,
    });
    throw err;
  }
}

// ─── Verificar webhook da Meta (GET de validação) ────────

function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    logger.info("WhatsApp: webhook verificado com sucesso");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// ─── Extrair mensagem recebida do payload da Meta ────────

function parseIncomingMessage(body) {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages || value.messages.length === 0) return null;

    const message = value.messages[0];
    const contact = value.contacts?.[0];

    return {
      from: message.from,               // número do remetente (lead)
      name: contact?.profile?.name,      // nome do perfil
      messageId: message.id,
      timestamp: message.timestamp,
      type: message.type,                // text, image, etc.
      text: message.text?.body || null,  // conteúdo se for texto
      raw: message,
    };
  } catch (err) {
    logger.error("WhatsApp: erro ao parsear mensagem recebida", { error: err.message });
    return null;
  }
}

module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  verifyWebhook,
  parseIncomingMessage,
};
