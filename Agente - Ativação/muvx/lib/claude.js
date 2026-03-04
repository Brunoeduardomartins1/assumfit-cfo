const axios = require("axios");
const config = require("../config.json");
const logger = require("./logger");

const api = axios.create({
  baseURL: "https://api.anthropic.com",
  headers: {
    "x-api-key": config.claude.apiKey,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  },
});

// ─── Chamar Claude com skill + contexto ──────────────────

async function executeSkill(skillContent, dealContext, action) {
  const systemPrompt = `Você é o motor de automação do MUVX. Você recebe uma SKILL (regras da fase) e o CONTEXTO de um deal. Sua tarefa é executar a ação solicitada seguindo rigorosamente as regras da skill.

REGRAS GLOBAIS:
- Gere mensagens em português brasileiro, tom humano e próximo.
- Máximo 3 linhas por mensagem WhatsApp.
- Uma pergunta por vez.
- Substitua todas as variáveis ({nome}, {link}, etc.) pelos valores reais do contexto.
- Responda SEMPRE em JSON válido com a estrutura especificada na ação.`;

  const userPrompt = `## SKILL DA FASE
${skillContent}

## CONTEXTO DO DEAL
${JSON.stringify(dealContext, null, 2)}

## AÇÃO SOLICITADA
${action}

## FORMATO DE RESPOSTA
Responda SOMENTE em JSON válido (sem markdown, sem backticks), com esta estrutura:
{
  "mensagem": "texto da mensagem WhatsApp a enviar (ou null se não houver mensagem)",
  "acoes_hubspot": {
    "campos": { "campo": "valor" },
    "nota": "texto da nota a registrar (ou null)"
  },
  "mover_para_fase": "nome_da_fase (ou null se não mover)",
  "alerta_giovanna": {
    "enviar": true/false,
    "briefing": "texto do briefing (ou null)"
  },
  "motivo": "explicação curta da decisão tomada"
}`;

  try {
    const { data } = await api.post("/v1/messages", {
      model: config.claude.model,
      max_tokens: 1000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const responseText = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Limpar possíveis backticks/markdown
    const cleaned = responseText.replace(/```json\s?|```/g, "").trim();
    const result = JSON.parse(cleaned);

    logger.info("Claude: skill executada com sucesso", {
      fase: dealContext.fase,
      deal: dealContext.dealId,
      motivo: result.motivo,
    });

    return result;
  } catch (err) {
    logger.error("Claude: erro ao executar skill", {
      error: err.response?.data || err.message,
      deal: dealContext.dealId,
    });
    throw err;
  }
}

// ─── Processar resposta de lead ──────────────────────────

async function processLeadResponse(skillContent, dealContext, responseText) {
  const action = `O lead respondeu com a seguinte mensagem:
"${responseText}"

Analise a resposta considerando as regras da skill e decida:
1. Se a resposta é uma dúvida simples que você pode resolver → gere resposta
2. Se a resposta exige julgamento humano → sinalize alerta para Giovanna
3. Se a resposta indica avanço de fase (ex: "já fiz login", "publiquei o produto") → verifique se deve mover de fase
4. Atualize os campos relevantes no HubSpot`;

  return executeSkill(skillContent, dealContext, action);
}

module.exports = {
  executeSkill,
  processLeadResponse,
};
