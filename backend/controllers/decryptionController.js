const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { EncryptedFile } = require("../models");
const pidusage = require("pidusage");
const logger = require("../utils/logger");

const RSA_PRIVATE_KEY = fs.readFileSync("private.pem", "utf8");

exports.downloadAndDecryptFile = async (req, res) => {
  try {
    const startTime = process.hrtime();
    const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    const { fileName, rsaKey, iv } = req.body;
    const username = req.user?.username || "Guest";

    logger.info(
      `[DECRYPT REQUEST] ${username} mencoba mendekripsi file: ${fileName}`
    );

    if (!fileName || !rsaKey || !iv) {
      logger.warn(`[DECRYPT FAILED] Missing parameters oleh ${username}`);
      return res.status(400).json({
        status: "error",
        message: "Missing required parameters",
      });
    }

    const encryptedKeyBuffer = Buffer.from(rsaKey, "base64");
    let decryptedAESKey;
    try {
      decryptedAESKey = crypto.privateDecrypt(
        RSA_PRIVATE_KEY,
        encryptedKeyBuffer
      );
    } catch (err) {
      logger.error(
        `[DECRYPT FAILED] AES Key gagal didekripsi oleh ${username}: ${err.message}`
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt AES key",
        error: err.message,
      });
    }

    const filePath = path.join(
      __dirname,
      "../encrypted",
      path.basename(fileName)
    );
    if (!fs.existsSync(filePath)) {
      logger.warn(
        `[DECRYPT FAILED] File terenkripsi tidak ditemukan: ${fileName}`
      );
      return res.status(404).json({
        status: "error",
        message: "Encrypted file not found",
      });
    }

    const encryptedData = fs.readFileSync(filePath);
    const ivBuffer = Buffer.from(iv, "base64");
    let decryptedData;
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        decryptedAESKey,
        ivBuffer
      );
      decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);
    } catch (err) {
      logger.error(
        `[DECRYPT FAILED] File gagal didekripsi oleh ${username}: ${err.message}`
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt file",
        error: err.message,
      });
    }

    const decryptedDir = path.join(__dirname, "../decrypted");
    if (!fs.existsSync(decryptedDir)) {
      fs.mkdirSync(decryptedDir, { recursive: true });
    }
    const decryptedFileName = path.basename(filePath.replace(".enc", ""));
    const decryptedFilePath = path.join(decryptedDir, decryptedFileName);
    try {
      fs.writeFileSync(decryptedFilePath, decryptedData);
    } catch (err) {
      logger.error(
        `[DECRYPT FAILED] Gagal menyimpan file hasil dekripsi oleh ${username}: ${err.message}`
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to save decrypted file",
        error: err.message,
      });
    }

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDifference = (finalMemoryUsage - initialMemoryUsage).toFixed(2);

    const cpuUsage = await new Promise((resolve, reject) => {
      pidusage(process.pid, (err, stats) => {
        if (err) return reject(err);
        resolve(stats.cpu);
      });
    });

    logger.info(
      `[DECRYPT SUCCESS] ${username} berhasil mendekripsi file: ${fileName} dalam ${elapsedTime} ms`
    );

    res.json({
      message: "File decrypted successfully",
      decryptedFilePath: decryptedFileName,
      performance: {
        elapsedTime: `${elapsedTime} ms`,
        memoryUsed: `${memoryDifference} MB`,
        cpuUsage: `${cpuUsage.toFixed(2)}%`,
      },
    });
  } catch (err) {
    logger.error(
      `[DECRYPT FAILED] Unexpected error oleh ${
        req.user?.username || "Guest"
      }: ${err.message}`
    );
    res.status(500).json({
      status: "error",
      message: "Failed to decrypt file",
      error: err.message,
    });
  }
};

exports.decryptById = async (req, res) => {
  try {
    const startTime = process.hrtime();
    const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    const { id } = req.body;
    const username = req.user?.username || "Guest";

    logger.info(
      `[DECRYPT BY ID REQUEST] ${username} mencoba mendekripsi file ID: ${id}`
    );

    if (!id) {
      logger.warn(`[DECRYPT FAILED] Missing ID parameter oleh ${username}`);
      return res.status(400).json({
        status: "error",
        message: "Missing ID parameter in body",
      });
    }

    const fileRecord = await EncryptedFile.findByPk(id);

    if (!fileRecord) {
      logger.warn(`[DECRYPT FAILED] Record tidak ditemukan untuk ID: ${id}`);
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    const { fileName, rsaKey, iv } = fileRecord;

    if (!fileName || !rsaKey || !iv) {
      logger.warn(
        `[DECRYPT FAILED] Kolom record tidak lengkap untuk ID: ${id}`
      );
      return res.status(400).json({
        status: "error",
        message: "File record is missing required fields",
      });
    }

    const encryptedKeyBuffer = Buffer.from(rsaKey, "base64");
    let decryptedAESKey;
    try {
      decryptedAESKey = crypto.privateDecrypt(
        RSA_PRIVATE_KEY,
        encryptedKeyBuffer
      );
    } catch (err) {
      logger.error(
        `[DECRYPT FAILED] AES Key gagal didekripsi oleh ${username} untuk ID ${id}: ${err.message}`
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt AES key",
        error: err.message,
      });
    }

    const filePath = path.join(
      __dirname,
      "../encrypted",
      path.basename(fileName)
    );
    if (!fs.existsSync(filePath)) {
      logger.warn(
        `[DECRYPT FAILED] File terenkripsi tidak ditemukan untuk ID: ${id}`
      );
      return res.status(404).json({
        status: "error",
        message: "Encrypted file not found",
      });
    }

    const encryptedData = fs.readFileSync(filePath);
    const ivBuffer = Buffer.from(iv, "base64");
    let decryptedData;
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        decryptedAESKey,
        ivBuffer
      );
      decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);
    } catch (err) {
      logger.error(
        `[DECRYPT FAILED] File gagal didekripsi oleh ${username} untuk ID ${id}: ${err.message}`
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt file",
        error: err.message,
      });
    }

    const decryptedDir = path.join(__dirname, "../decrypted");
    if (!fs.existsSync(decryptedDir)) {
      fs.mkdirSync(decryptedDir, { recursive: true });
    }
    const decryptedFileName = path.basename(filePath.replace(".enc", ""));
    const decryptedFilePath = path.join(decryptedDir, decryptedFileName);
    try {
      fs.writeFileSync(decryptedFilePath, decryptedData);
    } catch (err) {
      logger.error(
        `[DECRYPT FAILED] Gagal menyimpan file hasil dekripsi oleh ${username} untuk ID ${id}: ${err.message}`
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to save decrypted file",
        error: err.message,
      });
    }

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDifference = (finalMemoryUsage - initialMemoryUsage).toFixed(2);

    const cpuUsage = await new Promise((resolve, reject) => {
      pidusage(process.pid, (err, stats) => {
        if (err) return reject(err);
        resolve(stats.cpu);
      });
    });

    logger.info(
      `[DECRYPT SUCCESS] ${username} berhasil mendekripsi file ID ${id} dalam ${elapsedTime} ms`
    );

    res.json({
      status: "success",
      message: "File decrypted successfully",
      data: {
        decryptedFilePath: `/decrypted/${decryptedFileName}`,
        performance: {
          elapsedTime: `${elapsedTime} ms`,
          memoryUsed: `${memoryDifference} MB`,
          cpuUsage: `${cpuUsage.toFixed(2)}%`,
        },
      },
    });
  } catch (err) {
    logger.error(
      `[DECRYPT FAILED] Unexpected error oleh ${
        req.user?.username || "Guest"
      }: ${err.message}`
    );
    res.status(500).json({
      status: "error",
      message: "Failed to decrypt file",
      error: err.message,
    });
  }
};