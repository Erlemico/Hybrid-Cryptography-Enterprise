// middlewares/logActivity.js
const logger = require("../utils/logger");
const { mapToAction } = require("../utils/actionMapper");

const logActivity = () => async (req, res, next) => {
  res.on("finish", async () => {
    try {
      const action = mapToAction(req.method, req.originalUrl);
      await logger.audit({
        userId: req.user?.id ?? null,
        endpointAccess: req.originalUrl,
        action,
        status: res.statusCode >= 200 && res.statusCode < 400 ? "SUCCESS" : "FAILED",
        ip: req.ip,
      });
    } catch (err) {
      logger.error("Failed to log audit activity:", err.message);
    }
  });
  next();
};

module.exports = logActivity;