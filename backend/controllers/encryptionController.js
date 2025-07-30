const logger = require("../utils/logger");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const pidusage = require("pidusage");
const {
  encryptWithAES,
  encryptAESKeyWithRSA,
} = require("../utils/cryptoUtils");

const RSA_PUBLIC_KEY = fs.readFileSync("public.pem", "utf8");
const { EncryptedFile, Log } = require("../models");

exports.uploadAndEncryptFile = async (req, res) => {
  const user = req.user;

  try {
    const startTime = process.hrtime();
    const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    if (!req.files || !req.files.file) {
      logger.warn(`[UPLOAD FAILED] ${user.username} tried to upload without file`);

      await Log.create({
        userId: user.id,
        endpointAccess: req.originalUrl,
        action: "ENCRYPT",
        status: "FAILED",
        fileName: "-",
        ip: req.ip,
      });

      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const file = req.files.file;
    const uploadsDir = path.join(__dirname, "../encrypted");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const originalFileName = file.name;
    const filePath = path.join(uploadsDir, originalFileName);
    await file.mv(filePath);

    logger.info(`[UPLOAD] ${user.username} uploaded: ${originalFileName}`);

    // IN_PROGRESS log
    await Log.create({
      userId: user.id,
      endpointAccess: req.originalUrl,
      action: "ENCRYPT",
      status: "IN_PROGRESS",
      fileName: originalFileName,
      ip: req.ip,
    });

    // Enkripsi AES
    const aesKey = crypto.randomBytes(32);
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const { encryptedData, iv } = encryptWithAES(fileBuffer, aesKey);
    const encryptedFileName = `${originalFileName}.enc`;
    const encryptedFilePath = path.join(uploadsDir, encryptedFileName);
    fs.writeFileSync(encryptedFilePath, encryptedData);

    // Enkripsi AES key dengan RSA
    const rsaKey = encryptAESKeyWithRSA(aesKey, RSA_PUBLIC_KEY);

    await EncryptedFile.create({
      fileName: encryptedFileName,
      rsaKey: rsaKey.toString("base64"),
      iv: iv.toString("base64"),
      originalHash: fileHash,
      userId: user.id,
    });

    // SUCCESS log
    await Log.create({
      userId: user.id,
      endpointAccess: req.originalUrl,
      action: "ENCRYPT",
      status: "SUCCESS",
      fileName: encryptedFileName,
      ip: req.ip,
    });

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDifference = Math.abs(finalMemoryUsage - initialMemoryUsage).toFixed(2);
    const cpuUsage = (await pidusage(process.pid)).cpu.toFixed(2);

    logger.info(
      `[PERFORMANCE] ${user.username} - Time: ${elapsedTime}ms | Memory: ${memoryDifference}MB | CPU: ${cpuUsage}%`
    );

    res.status(201).json({
      status: "success",
      message: "File encrypted successfully",
      data: {
        fileName: encryptedFileName,
        rsaKey: rsaKey.toString("base64"),
        iv: iv.toString("base64"),
        originalHash: fileHash,
        performance: {
          elapsedTime: `${elapsedTime} ms`,
          memoryUsed: `${memoryDifference} MB`,
          cpuUsage: `${cpuUsage}%`,
        },
      },
    });
  } catch (err) {
    const fallbackFileName = req.files?.file?.name
      ? `${req.files.file.name}.enc`
      : "-";

    await Log.create({
      userId: user?.id || null,
      endpointAccess: req.originalUrl,
      action: "ENCRYPT",
      status: "FAILED",
      fileName: fallbackFileName,
      ip: req.ip,
    });

    logger.error(
      `[ENCRYPT ERROR] ${user?.username || "Unknown"} - ${err.message}`
    );

    res.status(500).json({
      status: "error",
      message: "Failed to process file",
      error: err.message,
    });
  }
};