const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { EncryptedFile } = require("../models");
const logger = require("../utils/logger");

const RSA_PRIVATE_KEY = fs.readFileSync("private.pem", "utf8");

exports.simulateBruteForceById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      logger.warn("[BRUTEFORCE] Missing required parameter: id");
      return res.status(400).json({
        status: "error",
        message: "Missing required parameter: id",
      });
    }

    const fileRecord = await EncryptedFile.findOne({ where: { id } });
    if (!fileRecord) {
      logger.warn(`[BRUTEFORCE] File record not found for ID: ${id}`);
      return res.status(404).json({
        status: "error",
        message: "File record not found in database",
      });
    }

    const { fileName, rsaKey, iv } = fileRecord;

    const encryptedKeyBuffer = Buffer.from(rsaKey, "base64");
    let decryptedAESKey;
    try {
      decryptedAESKey = crypto.privateDecrypt(
        RSA_PRIVATE_KEY,
        encryptedKeyBuffer
      );
      logger.info(
        `[BRUTEFORCE] Decrypted AES Key: ${decryptedAESKey.toString("hex")}`
      );
    } catch (err) {
      logger.error(`[BRUTEFORCE] Error decrypting AES key: ${err.message}`);
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
      logger.warn(`[BRUTEFORCE] Encrypted file not found: ${filePath}`);
      return res.status(404).json({
        status: "error",
        message: "Encrypted file not found",
      });
    }

    const encryptedData = fs.readFileSync(filePath);
    const ivBuffer = Buffer.from(iv, "base64");

    const keySpace = 256;
    let foundKey = null;
    let decryptedData = null;

    logger.info(
      `[BRUTEFORCE] Starting brute-force over ${keySpace} possible keys...`
    );
    for (let key = 0; key < keySpace; key++) {
      const testKey = Buffer.alloc(32, key);
      try {
        const decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          testKey,
          ivBuffer
        );
        decryptedData = Buffer.concat([
          decipher.update(encryptedData),
          decipher.final(),
        ]);

        logger.info(`[BRUTEFORCE] Key ${key} successfully decrypted the file!`);
        foundKey = key;
        break;
      } catch (err) {
        // Silent fail
      }
    }

    if (!foundKey) {
      logger.warn(`[BRUTEFORCE] Failed to brute-force the encrypted file`);
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
    const decryptedFilePath = path.join(decryptedDir, decryptedFileName);
    fs.writeFileSync(decryptedFilePath, decryptedData);

    logger.info(`[BRUTEFORCE] Decrypted file saved to: ${decryptedFilePath}`);

    res.json({
      status: "success",
      message: "Brute-force simulation completed successfully",
      data: {
        foundKey,
        decryptedFilePath: decryptedFileName,
      },
    });
  } catch (err) {
    logger.error(
      `[BRUTEFORCE] Error during brute-force simulation: ${err.message}`
    );
    res.status(500).json({
      status: "error",
      message: "An error occurred during brute-force simulation",
      error: err.message,
    });
  }
};