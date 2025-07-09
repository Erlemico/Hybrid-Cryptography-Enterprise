const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      (info) =>
        `[${info.timestamp}] ${info.level.toUpperCase()} - ${info.message}`
    )
  ),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "../logs/activity.log"),
    }),
    new transports.Console(), // <-- agar log juga tampil di terminal
  ],
});

module.exports = logger;