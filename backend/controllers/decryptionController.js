const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { EncryptedFile, Log } = require("../models");
const pidusage = require("pidusage");
const logger = require("../utils/logger");

const RSA_PRIVATE_KEY = fs.readFileSync("private.pem", "utf8");

exports.downloadAndDecryptFile = async (req, res) => {
  const startTime = process.hrtime();
  const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

  const { fileName, rsaKey, iv } = req.body;
  const user = req.user;
  const userId = user?.id || null;
  const username = user?.username || "Guest";
  const endpoint = req.originalUrl;
  const ip = req.ip;

  let decryptedFileName = fileName?.replace(".enc", "") || "-";
  let logEntry;

  try {
    // Buat log IN_PROGRESS
    logEntry = await Log.create({
      userId,
      endpointAccess: endpoint,
      action: "DECRYPT",
      status: "IN_PROGRESS",
      fileName: decryptedFileName,
      ip,
    });

    if (!fileName || !rsaKey || !iv) {
      logger.warn(`[DECRYPT FAILED] Missing parameter oleh ${username}`);
      await logEntry.update({ status: "FAILED" });

      return res.status(400).json({
        status: "error",
        message: "Missing required parameters",
      });
    }

    const encryptedKeyBuffer = Buffer.from(rsaKey, "base64");
    let decryptedAESKey;
    try {
      decryptedAESKey = crypto.privateDecrypt(RSA_PRIVATE_KEY, encryptedKeyBuffer);
    } catch (err) {
      logger.error(`[RSA ERROR] Gagal dekripsi AES key oleh ${username}`);
      await logEntry.update({ status: "FAILED" });

      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt AES key",
        error: err.message,
      });
    }

    const filePath = path.join(__dirname, "../encrypted", path.basename(fileName));
    if (!fs.existsSync(filePath)) {
      logger.warn(`[DECRYPT FAILED] File terenkripsi tidak ditemukan: ${fileName}`);
      await logEntry.update({ status: "FAILED" });

      return res.status(404).json({
        status: "error",
        message: "Encrypted file not found",
      });
    }

    const encryptedData = fs.readFileSync(filePath);
    const ivBuffer = Buffer.from(iv, "base64");

    let decryptedData;
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", decryptedAESKey, ivBuffer);
      decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);
    } catch (err) {
      logger.error(`[DECRYPT FAILED] Gagal dekripsi konten file oleh ${username}`);
      await logEntry.update({ status: "FAILED" });

      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt file",
        error: err.message,
      });
    }

    const decryptedDir = path.join(__dirname, "../decrypted");
    if (!fs.existsSync(decryptedDir)) fs.mkdirSync(decryptedDir, { recursive: true });

    const decryptedFilePath = path.join(decryptedDir, decryptedFileName);
    fs.writeFileSync(decryptedFilePath, decryptedData);

    const computedHash = crypto.createHash("sha256").update(decryptedData).digest("hex");

    const fileRecord = await EncryptedFile.findOne({ where: { fileName } });
    const storedHash = fileRecord?.originalHash;
    const isValid = computedHash === storedHash;

    if (isValid) {
      logger.info(`[INTEGRITY CHECK] File ${fileName} valid SHA-256 oleh ${username}`);
    } else {
      logger.warn(`[INTEGRITY FAILED] File ${fileName} SHA-256 tidak cocok`);
    }

    await logEntry.update({ status: "SUCCESS" });

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDifference = Math.abs(finalMemoryUsage - initialMemoryUsage).toFixed(2);

    const cpuUsage = await new Promise((resolve, reject) => {
      pidusage(process.pid, (err, stats) => {
        if (err) return reject(err);
        resolve(stats.cpu.toFixed(2));
      });
    });

    logger.info(`[DECRYPT SUCCESS] ${username} sukses decrypt ${fileName} dalam ${elapsedTime} ms`);

    res.json({
      status: "success",
      message: "File decrypted successfully",
      data: {
        fileName: decryptedFileName,
        integrityVerified: isValid,
        performance: {
          elapsedTime: `${elapsedTime} ms`,
          memoryUsed: `${memoryDifference} MB`,
          cpuUsage: `${cpuUsage}%`,
        },
      },
    });
  } catch (err) {
    logger.error(`[UNEXPECTED ERROR] ${username} gagal decrypt ${fileName}: ${err.message}`);
    if (logEntry) {
      await logEntry.update({ status: "FAILED" });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to decrypt file",
      error: err.message,
    });
  }
};

exports.decryptById = async (req, res) => {
  const startTime = process.hrtime();
  const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

  const { id } = req.body;
  const user = req.user;
  const userId = user?.id || null;
  const username = user?.username || "Guest";

  let decryptedFileName = "-";
  let logEntry;

  try {
    logger.info(`[DECRYPT BY ID REQUEST] ${username} mencoba mendekripsi file ID: ${id}`);

    // Buat log awal: IN_PROGRESS
    logEntry = await Log.create({
      userId,
      endpointAccess: req.originalUrl,
      action: "DECRYPT",
      status: "IN_PROGRESS",
      fileName: "-",
      ip: req.ip,
    });

    if (!id) {
      logger.warn(`[DECRYPT FAILED] Missing ID oleh ${username}`);
      await logEntry.update({ status: "FAILED" });
      return res.status(400).json({
        status: "error",
        message: "Missing ID parameter in body",
      });
    }

    const fileRecord = await EncryptedFile.findByPk(id);
    if (!fileRecord) {
      logger.warn(`[DECRYPT FAILED] Record tidak ditemukan untuk ID: ${id}`);
      await logEntry.update({ status: "FAILED" });
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    const { fileName, rsaKey, iv, originalHash } = fileRecord;
    decryptedFileName = fileName?.replace(".enc", "") || "-";

    if (!rsaKey || !iv || !originalHash) {
      logger.warn(`[DECRYPT FAILED] Kolom tidak lengkap untuk ID: ${id}`);
      await logEntry.update({ status: "FAILED", fileName });
      return res.status(400).json({
        status: "error",
        message: "File record is missing required fields",
      });
    }

    let decryptedAESKey;
    try {
      const encryptedKeyBuffer = Buffer.from(rsaKey, "base64");
      decryptedAESKey = crypto.privateDecrypt(RSA_PRIVATE_KEY, encryptedKeyBuffer);
    } catch (err) {
      logger.error(`[DECRYPT FAILED] RSA Key Error oleh ${username}: ${err.message}`);
      await logEntry.update({ status: "FAILED", fileName });
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt AES key",
        error: err.message,
      });
    }

    const filePath = path.join(__dirname, "../encrypted", fileName);
    if (!fs.existsSync(filePath)) {
      logger.warn(`[DECRYPT FAILED] File terenkripsi tidak ditemukan: ${fileName}`);
      await logEntry.update({ status: "FAILED", fileName });
      return res.status(404).json({
        status: "error",
        message: "Encrypted file not found",
      });
    }

    const encryptedData = fs.readFileSync(filePath);
    const ivBuffer = Buffer.from(iv, "base64");

    let decryptedData;
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", decryptedAESKey, ivBuffer);
      decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);
    } catch (err) {
      logger.error(`[DECRYPT FAILED] AES Error oleh ${username}: ${err.message}`);
      await logEntry.update({ status: "FAILED", fileName });
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt file",
        error: err.message,
      });
    }

    const decryptedDir = path.join(__dirname, "../decrypted");
    if (!fs.existsSync(decryptedDir)) fs.mkdirSync(decryptedDir, { recursive: true });

    const decryptedFilePath = path.join(decryptedDir, decryptedFileName);
    fs.writeFileSync(decryptedFilePath, decryptedData);

    const computedHash = crypto
      .createHash("sha256")
      .update(decryptedData)
      .digest("hex");

    const isValid = computedHash === originalHash;

    if (isValid) {
      logger.info(`[INTEGRITY OK] File ID ${id} lolos verifikasi oleh ${username}`);
    } else {
      logger.warn(`[INTEGRITY FAIL] File ID ${id} gagal verifikasi SHA-256`);
    }

    // Update log ke SUCCESS
    await logEntry.update({
      status: "SUCCESS",
      fileName: decryptedFileName,
    });

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDifference = (finalMemoryUsage - initialMemoryUsage).toFixed(2);

    const cpuUsage = await new Promise((resolve, reject) => {
      pidusage(process.pid, (err, stats) => {
        if (err) return reject(err);
        resolve(stats.cpu.toFixed(2));
      });
    });

    logger.info(
      `[DECRYPT SUCCESS] ${username} sukses dekripsi ID ${id} dalam ${elapsedTime}ms`
    );

    res.json({
      status: "success",
      message: "File decrypted successfully",
      data: {
        file: decryptedFileName,
        integrityVerified: isValid,
        performance: {
          elapsedTime: `${elapsedTime} ms`,
          memoryUsed: `${memoryDifference} MB`,
          cpuUsage: `${cpuUsage}%`,
        },
      },
    });
  } catch (err) {
    logger.error(`[DECRYPT FAILED] Fatal error oleh ${username}: ${err.message}`);
    if (logEntry) {
      await logEntry.update({ status: "FAILED", fileName: decryptedFileName });
    }
    res.status(500).json({
      status: "error",
      message: "Failed to decrypt file",
      error: err.message,
    });
  }
};