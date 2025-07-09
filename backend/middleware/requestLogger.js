const logger = require("../utils/logger");

function logRequest(req, res, next) {
  const user = req.user ? `${req.user.username} (${req.user.role})` : "Guest";
  const { method, originalUrl } = req;

  logger.info(`[REQUEST] ${user} accessed ${method} ${originalUrl}`);
  next();
}

module.exports = logRequest;