const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { EncryptedFile, Log } = require("../models");
const logger = require("../utils/logger");

const RSA_PRIVATE_KEY = fs.readFileSync("private.pem", "utf8");

exports.simulateBruteForceById = async (req, res) => {
  const { id } = req.body;
  const user = req.user;
  const userId = req.user?.id || null;
  const endpoint = req.originalUrl;
  const ip = req.ip;

  let logEntry;
  let fileName = "-";

  if (!id) {
    logger.warn("[BRUTEFORCE] Missing required parameter: id", {
      userId,
      endpointAccess: endpoint,
      action: "BRUTEFORCE",
      status: "FAILED",
      fileName: null,
      ip,
    });

    await Log.create({
      userId,
      endpointAccess: endpoint,
      action: "BRUTEFORCE",
      status: "FAILED",
      fileName: null,
      ip,
    });

    return res.status(400).json({
      status: "error",
      message: "Missing required parameter: id",
    });
  }

  try {
    const fileRecord = await EncryptedFile.findOne({ where: { id } });

    if (!fileRecord) {
      logger.warn(`[BRUTEFORCE] File record not found for ID: ${id}`, {
        userId,
        endpointAccess: endpoint,
        action: "BRUTEFORCE",
        status: "FAILED",
        fileName: null,
        ip,
      });

      await Log.create({
        userId,
        endpointAccess: endpoint,
        action: "BRUTEFORCE",
        status: "FAILED",
        fileName: null,
        ip,
      });

      return res.status(404).json({
        status: "error",
        message: "File record not found in database",
      });
    }

    const { fileName, rsaKey, iv, originalHash } = fileRecord;

    logEntry = await Log.create({
      userId,
      endpointAccess: endpoint,
      action: "BRUTEFORCE",
      status: "IN PROGRESS",
      fileName: null,
      ip,
    });

    const encryptedKeyBuffer = Buffer.from(rsaKey, "base64");
    const ivBuffer = Buffer.from(iv, "base64");

    let decryptedAESKey;
    try {
      decryptedAESKey = crypto.privateDecrypt(
        RSA_PRIVATE_KEY,
        encryptedKeyBuffer
      );
    } catch (err) {
      logger.error(`[BRUTEFORCE] Error decrypting AES key: ${err.message}`, {
        userId,
        endpointAccess: endpoint,
        action: "BRUTEFORCE",
        status: "FAILED",
        fileName: null,
        ip,
      });

      await logEntry.update({ status: "FAILED" });
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
      logger.warn(`[BRUTEFORCE] Encrypted file not found: ${filePath}`, {
        userId,
        endpointAccess: endpoint,
        action: "BRUTEFORCE",
        status: "FAILED",
        fileName: null,
        ip,
      });

      await logEntry.update({ status: "FAILED" });
      return res.status(404).json({
        status: "error",
        message: "Encrypted file not found",
      });
    }

    const encryptedData = fs.readFileSync(filePath);

    const keySpace = 256;
    let foundKey = null;
    let decryptedData = null;

    for (let key = 0; key < keySpace; key++) {
      const testKey = Buffer.alloc(32, key);
      try {
        const decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          testKey,
          ivBuffer
        );
        const output = Buffer.concat([
          decipher.update(encryptedData),
          decipher.final(),
        ]);

        const hash = crypto.createHash("sha256").update(output).digest("hex");
        if (hash === originalHash) {
          foundKey = testKey;
          decryptedData = output;
          break;
        }
      } catch (_) {
        // decryption failed, continue
      }
    }

    if (!foundKey) {
      logger.warn(`[BRUTEFORCE] Brute-force failed on file ${fileName}`, {
        userId,
        endpointAccess: endpoint,
        action: "BRUTEFORCE",
        status: "FAILED",
        fileName: fileName,
        ip,
      });

      await logEntry.update({ status: "FAILED" });

      return res.status(500).json({
        status: "error",
        message: "Failed to brute-force the encrypted file",
      });
    }

    const decryptedDir = path.join(__dirname, "../decrypted");
    if (!fs.existsSync(decryptedDir)) {
      fs.mkdirSync(decryptedDir, { recursive: true });
    }

    const decryptedFileName = path.basename(filePath.replace(".enc", ""));
    const file = path.join(decryptedDir, decryptedFileName);
    fs.writeFileSync(file, decryptedData);

    const isOriginalKey = foundKey.equals(decryptedAESKey);

    logger.info(
      `[BRUTEFORCE] File brute-forced and saved. Key Match: ${isOriginalKey}`,
      {
        userId,
        endpointAccess: endpoint,
        action: "BRUTEFORCE",
        status: "SUCCESS",
        fileName: decryptedFileName,
        ip,
      }
    );

    await logEntry.update({ status: "SUCCESS" });

    res.json({
      status: "success",
      message: "Brute-force simulation completed successfully",
      data: {
        keyMatch: isOriginalKey,
        file: decryptedFileName,
        foundKeyHex: foundKey.toString("hex"),
      },
    });
  } catch (err) {
    if (logEntry) await logEntry.update({ status: "ERROR" });

    logger.error(`[BRUTEFORCE] Unhandled error: ${err.message}`, {
      userId,
      endpointAccess: endpoint,
      action: "BRUTEFORCE",
      status: "ERROR",
      fileName: null,
      ip,
    });

    res.status(500).json({
      status: "error",
      message: "An error occurred during brute-force simulation",
      error: err.message,
    });
  }
};