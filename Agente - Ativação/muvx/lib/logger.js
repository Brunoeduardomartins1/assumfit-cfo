const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
const EXEC_DIR = path.join(LOG_DIR, "execucoes");

// Garantir que diretórios existem
[LOG_DIR, EXEC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function timestamp() {
  return new Date().toISOString();
}

function formatMessage(level, msg, meta = {}) {
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp()}] [${level}] ${msg}${metaStr}`;
}

function writeToFile(filepath, line) {
  fs.appendFileSync(filepath, line + "\n");
}

const mainLogPath = path.join(LOG_DIR, "orquestrador.log");

const logger = {
  info(msg, meta) {
    const line = formatMessage("INFO", msg, meta);
    console.log(line);
    writeToFile(mainLogPath, line);
  },

  warn(msg, meta) {
    const line = formatMessage("WARN", msg, meta);
    console.warn(line);
    writeToFile(mainLogPath, line);
  },

  error(msg, meta) {
    const line = formatMessage("ERROR", msg, meta);
    console.error(line);
    writeToFile(mainLogPath, line);
  },

  // Log de execução específica (por deal)
  execution(dealId, fase, msg, meta) {
    const date = new Date().toISOString().split("T")[0];
    const filename = `${date}_deal${dealId}_${fase}.log`;
    const filepath = path.join(EXEC_DIR, filename);
    const line = formatMessage("EXEC", msg, meta);
    writeToFile(filepath, line);
    // Também escreve no log principal
    this.info(`[deal:${dealId}] [${fase}] ${msg}`, meta);
  },
};

module.exports = logger;
