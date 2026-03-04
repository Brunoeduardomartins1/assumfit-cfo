const axios = require("axios");
const config = require("../config.json");
const logger = require("./logger");

const api = axios.create({
  baseURL: "https://api.hubapi.com",
  headers: {
    Authorization: `Bearer ${config.hubspot.accessToken}`,
    "Content-Type": "application/json",
  },
});

// ─── Deals ───────────────────────────────────────────────

async function getDeal(dealId) {
  const props = [
    "dealname", "dealstage", "pipeline",
    "muvx_fase_pipeline", "muvx_produto_publicado", "muvx_alunos_convidados",
    "muvx_data_primeira_venda", "muvx_total_vendas_30d", "muvx_ultimo_login",
    "muvx_fups_enviados", "muvx_ultima_resposta", "muvx_escalada_giovanna", "muvx_plano",
    "amount",
  ].join(",");

  const { data } = await api.get(`/crm/v3/objects/deals/${dealId}?properties=${props}`);
  return data;
}

async function updateDeal(dealId, properties) {
  const { data } = await api.patch(`/crm/v3/objects/deals/${dealId}`, { properties });
  logger.info(`HubSpot: deal ${dealId} atualizado`, { properties });
  return data;
}

async function moveDealToStage(dealId, stageName) {
  const stageId = config.hubspot.stageIds[stageName];
  if (!stageId) throw new Error(`Stage desconhecida: ${stageName}`);
  return updateDeal(dealId, {
    dealstage: stageId,
    muvx_fase_pipeline: stageName,
  });
}

// ─── Contatos ────────────────────────────────────────────

async function getContactByDeal(dealId) {
  const { data } = await api.get(
    `/crm/v3/objects/deals/${dealId}/associations/contacts`
  );
  if (!data.results || data.results.length === 0) return null;

  const contactId = data.results[0].id;
  const { data: contact } = await api.get(
    `/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,phone,email`
  );
  return contact;
}

// ─── Notas / Atividades ──────────────────────────────────

async function createNote(dealId, body) {
  const { data: note } = await api.post("/crm/v3/objects/notes", {
    properties: {
      hs_note_body: body,
      hs_timestamp: new Date().toISOString(),
    },
  });

  await api.put(`/crm/v3/objects/notes/${note.id}/associations/deals/${dealId}/note_to_deal`, {});
  logger.info(`HubSpot: nota criada no deal ${dealId}`);
  return note;
}

// ─── Pipeline completo ───────────────────────────────────

async function getAllDealsInPipeline() {
  const allDeals = [];
  let after = undefined;

  do {
    const params = {
      filterGroups: [{
        filters: [{
          propertyName: "pipeline",
          operator: "EQ",
          value: config.hubspot.pipelineId,
        }],
      }],
      properties: [
        "dealname", "dealstage", "muvx_fase_pipeline", "muvx_fups_enviados",
        "muvx_ultima_resposta", "muvx_ultimo_login", "muvx_escalada_giovanna",
        "muvx_produto_publicado", "muvx_alunos_convidados", "muvx_data_primeira_venda",
        "muvx_total_vendas_30d", "muvx_plano", "amount",
        "createdate", "hs_lastmodifieddate",
      ],
      limit: 100,
      after,
    };

    const { data } = await api.post("/crm/v3/objects/deals/search", params);
    allDeals.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return allDeals;
}

// ─── Mapear stageId → nome da fase ──────────────────────

function getStageNameById(stageId) {
  for (const [name, id] of Object.entries(config.hubspot.stageIds)) {
    if (id === stageId) return name;
  }
  return null;
}

module.exports = {
  getDeal,
  updateDeal,
  moveDealToStage,
  getContactByDeal,
  createNote,
  getAllDealsInPipeline,
  getStageNameById,
};
