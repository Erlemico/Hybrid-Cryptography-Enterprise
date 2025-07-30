const { createLogger, format, transports } = require("winston");
const path = require("path");
const { Log } = require("../models"); // sesuaikan path kalau beda struktur

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(
      (info) =>
        `[${info.timestamp}] ${info.level.toUpperCase()} - ${info.message}`
    )
  ),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "../logs/activity.log"),
    }),
    new transports.Console(),
    // ❌ SequelizeTransport dihapus, tidak log ke DB otomatis
  ],
});

// ✅ Helper khusus log audit ke DB
logger.audit = async (entry) => {
  try {
    await Log.create({
      userId: entry.userId ?? null,
      endpointAccess: entry.endpointAccess ?? "-",
      action: entry.action ?? "-",
      status: entry.status ?? "-",
      file: entry.file ?? "-",
      ip: entry.ip ?? "-",
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
};

module.exports = logger;