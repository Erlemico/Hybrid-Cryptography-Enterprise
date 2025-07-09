const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "hybrid-secret";

function generateToken(user) {
  return jwt.sign(
    {
      username: user.username,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = { generateToken, verifyToken };