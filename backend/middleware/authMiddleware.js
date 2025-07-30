require("dotenv").config();
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const secretKey = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Unauthorized access: Malformed or missing token");
    return res
      .status(401)
      .json({ message: "Unauthorized: Token required or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    logger.info(
      `[AUTH] Token verified. User:\n${JSON.stringify(req.user, null, 2)}`
    );
    next();
  } catch (err) {
    logger.warn(`Forbidden: Invalid token. Error: ${err.message}`);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
}

function allowRoles(roles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      logger.warn("Forbidden: No user found in request");
      return res.status(403).json({ message: "Forbidden: No user found" });
    }

    if (!roles.includes(user.role)) {
      logger.warn(
        `[FORBIDDEN] ${user.username} (${user.role}) tried to access a restricted route`
      );
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied for role: " + user.role });
    }

    logger.info(`[ALLOWED] ${user.username} (${user.role}) has access`);
    next();
  };
}

module.exports = { verifyToken, allowRoles };