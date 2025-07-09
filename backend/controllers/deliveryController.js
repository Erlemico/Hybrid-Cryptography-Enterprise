const crypto = require("crypto");
const { EncryptedFile } = require("../models");
const logger = require("../utils/logger");

exports.saveData = async (req, res, next) => {
  try {
    const { fileName, rsaKey, iv } = req.body;

    if (!fileName || !rsaKey || !iv) {
      logger.warn("[SAVE-DATA] Missing required fields");
      return res.status(400).json({
        status: "error",
        message: "Field is empty. All fields are required.",
      });
    }

    const ivBuffer = Buffer.from(iv, "base64");
    if (ivBuffer.length !== 16) {
      logger.warn("[SAVE-DATA] Invalid IV length");
      return res.status(400).json({
        status: "error",
        message: "IV invalid. Must be 16 bytes when decoded.",
      });
    }

    const SECRET_KEY = process.env.SECRET_KEY
      ? Buffer.from(process.env.SECRET_KEY, "hex")
      : Buffer.from("12345678901234567890123456789012");

    if (SECRET_KEY.length !== 32) {
      throw new Error("SECRET_KEY must be 32 bytes for AES-256.");
    }

    const newFile = await EncryptedFile.create({
      fileName,
      rsaKey: rsaKey,
      iv,
    });

    logger.info(`[SAVE-DATA] Encrypted data saved: ${fileName}`);

    res.status(201).json({
      status: "success",
      message: "Data saved successfully.",
    });
  } catch (error) {
    logger.error(`[SAVE-DATA] Error: ${error.message}`);
    next(error);
  }
};

exports.getAllData = async (req, res, next) => {
  try {
    const files = await EncryptedFile.findAll();

    if (!files || files.length === 0) {
      logger.warn("[GET-ALL] No data found");
      return res.status(404).json({
        status: "error",
        message: "No data found.",
        data: {},
      });
    }

    const data = files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      rsaKey: file.rsaKey,
      iv: file.iv,
      createdAt: file.createdAt,
    }));

    logger.info(`[GET-ALL] Retrieved ${data.length} records`);

    res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data: data,
    });
  } catch (error) {
    logger.error(`[GET-ALL] Error: ${error.message}`);
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await EncryptedFile.findByPk(id);

    if (!file) {
      logger.warn(`[GET-BY-ID] Record not found: ID ${id}`);
      return res.status(404).json({
        status: "error",
        message: "Record not found.",
      });
    }

    const data = {
      id: file.id,
      fileName: file.fileName,
      rsaKey: file.rsaKey,
      iv: file.iv,
      createdAt: file.createdAt,
    };

    logger.info(`[GET-BY-ID] Retrieved record: ID ${id}`);

    res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data: data,
    });
  } catch (error) {
    logger.error(`[GET-BY-ID] Error: ${error.message}`);
    next(error);
  }
};