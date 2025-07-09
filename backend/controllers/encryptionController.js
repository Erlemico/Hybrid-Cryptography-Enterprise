const logger = require("../utils/logger");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const osutils = require("os-utils");
const pidusage = require("pidusage");
const {
  encryptWithAES,
  encryptAESKeyWithRSA,
} = require("../utils/cryptoUtils");

const RSA_PUBLIC_KEY = fs.readFileSync("public.pem", "utf8");

exports.uploadAndEncryptFile = async (req, res) => {
  const user = req.user || { username: "Guest", role: "Unknown" };

  try {
    const startTime = process.hrtime();
    const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    if (!req.files || !req.files.file) {
      logger.warn(
        `[UPLOAD FAILED] ${user.username} tried to upload without file`
      );
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const file = req.files.file;
    const uploadsDir = path.join(__dirname, "../encrypted");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filePath = path.join(uploadsDir, file.name);
    await file.mv(filePath);
    logger.info(
      `[UPLOAD] ${user.username} (${user.role}) uploaded: ${file.name}`
    );

    const aesKey = crypto.randomBytes(32);
    const fileBuffer = fs.readFileSync(filePath);
    let encryptedData, iv;
    ({ encryptedData, iv } = encryptWithAES(fileBuffer, aesKey));
    logger.info(`[ENCRYPT] ${user.username} encrypted: ${file.name}`);

    const encryptedFileName = `${file.name}.enc`;
    const encryptedFilePath = path.join(uploadsDir, encryptedFileName);
    fs.writeFileSync(encryptedFilePath, encryptedData);
    logger.info(`[SAVE ENCRYPTED] Saved encrypted file: ${encryptedFileName}`);

    const rsaKey = encryptAESKeyWithRSA(aesKey, RSA_PUBLIC_KEY);
    logger.info(`[RSA] AES key encrypted for file: ${encryptedFileName}`);

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
      `[PERFORMANCE] ${
        user.username
      } - Time: ${elapsedTime}ms | Memory: ${memoryDifference}MB | CPU: ${cpuUsage.toFixed(
        2
      )}%`
    );

    res.status(201).json({
      status: "success",
      message: "File encrypted successfully",
      data: {
        fileName: encryptedFileName,
        rsaKey: rsaKey.toString("base64"),
        iv: iv.toString("base64"),
        performance: {
          elapsedTime: `${elapsedTime} ms`,
          memoryUsed: `${memoryDifference} MB`,
          cpuUsage: `${cpuUsage.toFixed(2)}%`,
        },
      },
    });
  } catch (err) {
    logger.error(`[ENCRYPT ERROR] ${user.username} - ${err.message}`);
    res.status(500).json({
      status: "error",
      message: "Failed to process file",
      error: err.message,
    });
  }
};