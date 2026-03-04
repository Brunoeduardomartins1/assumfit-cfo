const express = require("express");
const cron = require("node-cron");
const config = require("./config.json");
const logger = require("./lib/logger");
const hubspot = require("./lib/hubspot");
const whatsapp = require("./lib/whatsapp");
const claude = require("./lib/claude");
const skills = require("./lib/skills");

const app = express();
app.use(express.json());

// ═══════════════════════════════════════════════════════════
// WEBHOOK: HubSpot (mudança de fase)
// ═══════════════════════════════════════════════════════════

app.post("/webhook/hubspot", async (req, res) => {
  res.sendStatus(200); // Responde imediatamente para o HubSpot não retentar

  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      // HubSpot envia propertyName + propertyValue para mudanças de propriedade
      // e subscriptionType para mudanças de deal
      const dealId = event.objectId;
      if (!dealId) continue;

      logger.info(`Webhook HubSpot recebido`, { dealId, type: event.subscriptionType });
      await processarDeal(dealId, "webhook");
    }
  } catch (err) {
    logger.error("Erro ao processar webhook HubSpot", { error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// WEBHOOK: WhatsApp / Meta (respostas dos leads)
// ═══════════════════════════════════════════════════════════

// GET — Verificação do webhook pela Meta
app.get("/webhook/whatsapp", (req, res) => {
  whatsapp.verifyWebhook(req, res);
});

// POST — Mensagens recebidas
app.post("/webhook/whatsapp", async (req, res) => {
  res.sendStatus(200);

  try {
    const message = whatsapp.parseIncomingMessage(req.body);
    if (!message || !message.text) return; // Ignorar mensagens não-texto e status updates

    logger.info(`WhatsApp: mensagem recebida de ${message.from}`, {
      text: message.text.substring(0, 100),
    });

    await processarRespostaLead(message);
  } catch (err) {
    logger.error("Erro ao processar mensagem WhatsApp", { error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CRON: Verificar FUPs pendentes (a cada 30 minutos)
// ═══════════════════════════════════════════════════════════

cron.schedule("*/30 * * * *", async () => {
  logger.info("Cron: verificando FUPs pendentes...");
  try {
    const deals = await hubspot.getAllDealsInPipeline();
    logger.info(`Cron: ${deals.length} deals no pipeline`);

    for (const deal of deals) {
      await processarDeal(deal.id, "cron");
    }

    logger.info("Cron: verificação de FUPs concluída");
  } catch (err) {
    logger.error("Cron: erro na verificação de FUPs", { error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CRON: Briefing diário às 8h (Skill 8)
// ═══════════════════════════════════════════════════════════

cron.schedule("0 8 * * *", async () => {
  logger.info("Cron: executando briefing diário (Skill 8)...");
  try {
    await executarBriefingDiario();
  } catch (err) {
    logger.error("Cron: erro no briefing diário", { error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════

async function processarDeal(dealId, trigger) {
  try {
    const deal = await hubspot.getDeal(dealId);
    const props = deal.properties;
    const stageId = props.dealstage;
    const fase = hubspot.getStageNameById(stageId);

    if (!fase) {
      logger.warn(`Deal ${dealId}: fase não mapeada (stageId: ${stageId})`);
      return;
    }

    // Carregar skill da fase
    const skillContent = skills.loadSkillByStageId(stageId);
    if (!skillContent) {
      logger.warn(`Deal ${dealId}: skill não encontrada para fase ${fase}`);
      return;
    }

    // Buscar contato associado
    const contact = await hubspot.getContactByDeal(dealId);
    const phone = contact?.properties?.phone;
    if (!phone) {
      logger.warn(`Deal ${dealId}: contato sem telefone`);
      return;
    }

    // Montar contexto do deal
    const dealContext = {
      dealId,
      fase,
      trigger,
      nome: [contact.properties.firstname, contact.properties.lastname].filter(Boolean).join(" "),
      email: contact.properties.email,
      telefone: phone,
      dealName: props.dealname,
      fups_enviados: parseInt(props.muvx_fups_enviados || "0"),
      ultima_resposta: props.muvx_ultima_resposta || null,
      ultimo_login: props.muvx_ultimo_login || null,
      produto_publicado: props.muvx_produto_publicado === "true",
      alunos_convidados: props.muvx_alunos_convidados === "true",
      data_primeira_venda: props.muvx_data_primeira_venda || null,
      total_vendas_30d: parseInt(props.muvx_total_vendas_30d || "0"),
      escalada_giovanna: props.muvx_escalada_giovanna === "true",
      plano: props.muvx_plano || null,
      valor_deal: props.amount || null,
      data_criacao: props.createdate,
      data_modificacao: props.hs_lastmodifieddate,
      data_entrada_fase: props.hs_lastmodifieddate, // aproximação
      agora: new Date().toISOString(),
    };

    // Determinar ação
    const action = trigger === "webhook"
      ? "O deal acabou de entrar nesta fase (ou foi atualizado). Verifique se deve enviar o próximo FUP imediato (M1) de acordo com as regras da skill."
      : `O deal está nesta fase. FUPs já enviados: ${dealContext.fups_enviados}. Verifique se há algum FUP com prazo atingido que deve ser enviado agora, considerando a data de entrada na fase e os timings definidos na skill. Se todos os FUPs já foram enviados e os prazos de escalada foram atingidos, execute a escalada.`;

    logger.execution(dealId, fase, `Processando (trigger: ${trigger})`, dealContext);

    // Chamar Claude com a skill
    const resultado = await claude.executeSkill(skillContent, dealContext, action);

    // Executar resultado
    await executarResultado(dealId, fase, dealContext, resultado);
  } catch (err) {
    logger.error(`Erro ao processar deal ${dealId}`, { error: err.message, stack: err.stack });
  }
}

async function processarRespostaLead(message) {
  try {
    // Buscar deal pelo telefone do lead
    // HubSpot: buscar contato pelo telefone, depois pegar deal associado
    const phone = message.from;

    // Buscar contato no HubSpot pelo telefone
    const { data: searchResult } = require("axios").post(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        filterGroups: [{
          filters: [{
            propertyName: "phone",
            operator: "EQ",
            value: phone,
          }],
        }],
      },
      {
        headers: {
          Authorization: `Bearer ${config.hubspot.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Nota: esta busca é simplificada. Em produção, considerar variações de formato do telefone.
    if (!searchResult.results || searchResult.results.length === 0) {
      logger.warn(`WhatsApp: nenhum contato encontrado para ${phone}`);
      return;
    }

    const contactId = searchResult.results[0].id;

    // Buscar deal associado ao contato
    const axios = require("axios");
    const { data: assocData } = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/deals`,
      {
        headers: {
          Authorization: `Bearer ${config.hubspot.accessToken}`,
        },
      }
    );

    if (!assocData.results || assocData.results.length === 0) {
      logger.warn(`WhatsApp: nenhum deal encontrado para contato ${contactId}`);
      return;
    }

    const dealId = assocData.results[0].id;
    const deal = await hubspot.getDeal(dealId);
    const stageId = deal.properties.dealstage;
    const fase = hubspot.getStageNameById(stageId);
    const skillContent = skills.loadSkillByStageId(stageId);

    if (!skillContent) return;

    const contact = await hubspot.getContactByDeal(dealId);

    const dealContext = {
      dealId,
      fase,
      trigger: "resposta_lead",
      nome: [contact?.properties?.firstname, contact?.properties?.lastname].filter(Boolean).join(" "),
      email: contact?.properties?.email,
      telefone: phone,
      fups_enviados: parseInt(deal.properties.muvx_fups_enviados || "0"),
      ultima_resposta: deal.properties.muvx_ultima_resposta,
      ultimo_login: deal.properties.muvx_ultimo_login,
      produto_publicado: deal.properties.muvx_produto_publicado === "true",
      data_primeira_venda: deal.properties.muvx_data_primeira_venda,
      total_vendas_30d: parseInt(deal.properties.muvx_total_vendas_30d || "0"),
      escalada_giovanna: deal.properties.muvx_escalada_giovanna === "true",
      agora: new Date().toISOString(),
    };

    // Atualizar última resposta no HubSpot
    await hubspot.updateDeal(dealId, {
      muvx_ultima_resposta: new Date().toISOString(),
    });

    // Chamar Claude para processar a resposta
    const resultado = await claude.processLeadResponse(skillContent, dealContext, message.text);

    logger.execution(dealId, fase, `Resposta do lead processada`, { texto: message.text, resultado: resultado.motivo });

    await executarResultado(dealId, fase, dealContext, resultado);
  } catch (err) {
    logger.error("Erro ao processar resposta do lead", { error: err.message });
  }
}

async function executarResultado(dealId, fase, dealContext, resultado) {
  // 1. Enviar mensagem WhatsApp (se houver)
  if (resultado.mensagem) {
    await whatsapp.sendTextMessage(dealContext.telefone, resultado.mensagem);
    logger.execution(dealId, fase, `Mensagem enviada`, { mensagem: resultado.mensagem.substring(0, 80) });
  }

  // 2. Atualizar campos HubSpot
  if (resultado.acoes_hubspot?.campos && Object.keys(resultado.acoes_hubspot.campos).length > 0) {
    await hubspot.updateDeal(dealId, resultado.acoes_hubspot.campos);
  }

  // 3. Registrar nota
  if (resultado.acoes_hubspot?.nota) {
    await hubspot.createNote(dealId, resultado.acoes_hubspot.nota);
  }

  // 4. Mover de fase
  if (resultado.mover_para_fase) {
    await hubspot.moveDealToStage(dealId, resultado.mover_para_fase);
    logger.execution(dealId, fase, `Deal movido para ${resultado.mover_para_fase}`);
  }

  // 5. Alerta Giovanna
  if (resultado.alerta_giovanna?.enviar && resultado.alerta_giovanna?.briefing) {
    await whatsapp.sendTextMessage(config.alertas.giovanna, resultado.alerta_giovanna.briefing);
    await hubspot.updateDeal(dealId, { muvx_escalada_giovanna: "true" });
    logger.execution(dealId, fase, `Alerta enviado para Giovanna`);
  }
}

async function executarBriefingDiario() {
  const skillContent = skills.loadBriefingSkill();
  if (!skillContent) {
    logger.error("Skill do briefing diário não encontrada");
    return;
  }

  const deals = await hubspot.getAllDealsInPipeline();

  // Organizar deals por fase
  const porFase = {};
  for (const deal of deals) {
    const fase = hubspot.getStageNameById(deal.properties.dealstage) || "desconhecida";
    if (!porFase[fase]) porFase[fase] = [];
    porFase[fase].push({
      id: deal.id,
      nome: deal.properties.dealname,
      fups: deal.properties.muvx_fups_enviados,
      escalada: deal.properties.muvx_escalada_giovanna === "true",
      ultima_resposta: deal.properties.muvx_ultima_resposta,
      modificado: deal.properties.hs_lastmodifieddate,
    });
  }

  const contexto = {
    data: new Date().toISOString().split("T")[0],
    total_deals: deals.length,
    deals_por_fase: porFase,
    agora: new Date().toISOString(),
  };

  const action = "Gere o briefing diário conforme as regras da skill. Retorne a mensagem formatada para WhatsApp.";

  const resultado = await claude.executeSkill(skillContent, contexto, action);

  if (resultado.mensagem) {
    // Enviar para gerente e Giovanna
    await whatsapp.sendTextMessage(config.alertas.gerente, resultado.mensagem);
    await whatsapp.sendTextMessage(config.alertas.giovanna, resultado.mensagem);
    logger.info("Briefing diário enviado com sucesso");
  }
}

// ═══════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════

app.get("/health", (req, res) => {
  const skillList = skills.listSkills();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    skills: skillList,
    uptime: process.uptime(),
  });
});

// ═══════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════

const PORT = config.server?.port || 3001;
app.listen(PORT, () => {
  logger.info(`Orquestrador MUVX rodando na porta ${PORT}`);
  logger.info(`Skills disponíveis:`, { skills: skills.listSkills().map((s) => s.folder) });
  logger.info(`Cron FUPs: a cada 30 minutos`);
  logger.info(`Cron Briefing: todo dia às 8h`);
});
