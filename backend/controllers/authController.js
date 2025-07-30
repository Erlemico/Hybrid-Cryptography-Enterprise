require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { User, Log } = require("../models");
const logger = require("../utils/logger");

const secretKey = process.env.JWT_SECRET;

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    const ipAddress = req.ip || req.connection.remoteAddress;
    const endpoint = req.originalUrl;

    // Jika user tidak ditemukan atau password salah
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`[LOGIN FAILED] Invalid credentials`, {
        username,
        role: user?.role || "Unknown",
        action: "LOGIN",
        status: "FAILED",
        userId: user?.id || null,
      });

      // Jika user ditemukan, simpan log gagal
      if (user) {
        await Log.create({
          userId: user.id,
          endpointAccess: endpoint,
          action: "LOGIN",
          status: "FAILED",
          fileName: "-",
          ip: ipAddress,
        });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      secretKey,
      { expiresIn: "1h" }
    );

    // Logging ke file
    logger.info(`[LOGIN SUCCESS] ${user.username} berhasil login`, {
      userId: user.id,
      username: user.username,
      role: user.role,
      endpointAccess: endpoint,
      action: "LOGIN",
      status: "SUCCESS",
      fileName: "-",
      ip: ipAddress,
    });

    // Simpan ke database log
    await Log.create({
      userId: user.id,
      endpointAccess: endpoint,
      action: "LOGIN",
      status: "SUCCESS",
      fileName: "-",
      ip: ipAddress,
    });

    res.json({ token });
  } catch (err) {
    logger.error(`[LOGIN ERROR] ${err.message}`, {
      username,
      role: "Unknown",
      endpointAccess: endpoint,
      action: "LOGIN",
      status: "ERROR",
      fileName: "-",
      ip: ipAddress,
    });

    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { login };