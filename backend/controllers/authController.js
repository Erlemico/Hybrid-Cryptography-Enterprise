// const { User } = require("../models");
// const { generateToken } = require("../utils/jwtHelper");

// async function login(req, res) {
//   const { username, password } = req.body;
//   const user = await User.findOne({ where: { username } });

//   if (!user || user.password !== password) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const token = generateToken({
//     id: user.id,
//     username: user.username,
//     role: user.role,
//   });
//   res.json({ token });
// }

// module.exports = { login };

require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const logger = require("../utils/logger");

const users = [
  { username: "cfo_user", password: "12345", role: "CFO" },
  { username: "auditor_user", password: "12345", role: "Auditor" },
  { username: "employee", password: "12345", role: "Employee" },
];

async function login(req, res) {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    logger.warn(`[LOGIN FAILED] Username: ${username}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    secretKey,
    { expiresIn: "1h" }
  );

  logger.info(`[LOGIN SUCCESS] ${user.username} (${user.role}) berhasil login`);

  res.json({ token });
}

module.exports = { login };