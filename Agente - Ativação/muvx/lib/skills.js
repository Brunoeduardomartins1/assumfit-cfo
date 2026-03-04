const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const config = require("../config.json");

const SKILLS_DIR = path.join(__dirname, "..", "skills");

// ─── Mapear stageId do HubSpot → pasta da skill ─────────

const STAGE_TO_SKILL = {};
for (const [stageName, stageId] of Object.entries(config.hubspot.stageIds)) {
  const folderMap = {
    cadastro: "fase1_cadastro",
    ativacao_conta: "fase2_ativacao_conta",
    produto_publicado: "fase3_produto_publicado",
    convite_alunos: "fase4_convite_alunos",
    primeira_venda: "fase5_primeira_venda",
    recorrencia: "fase6_recorrencia",
    recuperacao: "fase7_recuperacao",
  };
  STAGE_TO_SKILL[stageId] = folderMap[stageName] || null;
}

// ─── Carregar skill por nome da pasta ────────────────────

function loadSkill(skillFolder) {
  const skillPath = path.join(SKILLS_DIR, skillFolder, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    logger.error(`Skill não encontrada: ${skillPath}`);
    return null;
  }
  const content = fs.readFileSync(skillPath, "utf-8");
  logger.info(`Skill carregada: ${skillFolder} (${content.length} chars)`);
  return content;
}

// ─── Carregar skill por stageId do HubSpot ───────────────

function loadSkillByStageId(stageId) {
  const folder = STAGE_TO_SKILL[stageId];
  if (!folder) {
    logger.warn(`Nenhuma skill mapeada para stageId: ${stageId}`);
    return null;
  }
  return loadSkill(folder);
}

// ─── Carregar skill do briefing diário ───────────────────

function loadBriefingSkill() {
  return loadSkill("fase8_briefing_diario");
}

// ─── Listar todas as skills disponíveis ──────────────────

function listSkills() {
  const folders = fs.readdirSync(SKILLS_DIR).filter((f) => {
    return fs.statSync(path.join(SKILLS_DIR, f)).isDirectory();
  });
  return folders.map((folder) => {
    const skillPath = path.join(SKILLS_DIR, folder, "SKILL.md");
    const exists = fs.existsSync(skillPath);
    return { folder, exists, path: skillPath };
  });
}

module.exports = {
  loadSkill,
  loadSkillByStageId,
  loadBriefingSkill,
  listSkills,
  STAGE_TO_SKILL,
};
