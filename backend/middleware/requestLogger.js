const logger = require("../utils/logger");
const { Log } = require("../models");

const mapToAction = (method, path) => {
  const route = `${method} ${path}`;
  const mapping = {
    "POST /api/auth/login": "LOGIN",
    "POST /api/encrypt": "ENCRYPT",
    "POST /api/decrypt": "DECRYPT",
    "POST /api/decrypt/by-id": "DECRYPT",
    "POST /api/delivery/send-key": "DELIVERY_SEND_KEY",
    "GET /api/delivery/get-key": "DELIVERY_GET_ALL",
    "GET /api/delivery/get-key/:id": "DELIVERY_GET_BY_ID",
    "GET /api/logs/json": "LOG_VIEW_JSON",
    "GET /api/logs/csv": "LOG_EXPORT_CSV",
    "POST /api/bruteforce": "BRUTEFORCE_ATTEMPT",
  };
  return mapping[route] || "UNKNOWN_ACTION";
};

async function logRequest(req, res, next) {
  const { method, originalUrl, ip } = req;

  const user = req.user || {
    id: null,
    username: "Guest",
    role: "Unknown",
  };

  const action = mapToAction(method, originalUrl);

  // Logger ke file/console
  logger.info(`[${action}] ${method} ${originalUrl}`, {
    userId: user.id,
    username: user.username,
    role: user.role,
    action,
    status: "SUCCESS",
    endpointAccess: originalUrl,
    ip,
  });

  // Simpan ke DB jika ada user login
  if (user.id) {
    await Log.create({
      userId: user.id,
      endpointAccess: originalUrl,
      action,
      status: "SUCCESS",
      fileName: null,
      ip,
    });
  }

  next();
}

module.exports = logRequest;