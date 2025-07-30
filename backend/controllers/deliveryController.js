const crypto = require("crypto");
const { EncryptedFile, Log } = require("../models");
const logger = require("../utils/logger");

exports.getAllData = async (req, res, next) => {
  let logEntry;
  const user = req.user;
  const userId = user?.id || null;
  const ip = req.ip;
  const endpoint = req.originalUrl;

  try {
    logEntry = await Log.create({
      userId,
      endpointAccess: endpoint,
      action: "GET_ALL",
      status: "IN_PROGRESS",
      fileName: "-",
      ip,
    });

    const files = await EncryptedFile.findAll();

    if (!files.length) {
      logger.warn("[GET_ALL] No data found");
      await logEntry.update({ status: "FAILED" });

      return res.status(404).json({
        status: "error",
        message: "No data found.",
        data: [],
      });
    }

    const data = files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      rsaKey: file.rsaKey,
      iv: file.iv,
      createdAt: file.createdAt,
    }));

    logger.info(`[GET_ALL] Retrieved ${data.length} records`);
    await logEntry.update({ status: "SUCCESS" });

    res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data,
    });
  } catch (error) {
    if (logEntry) await logEntry.update({ status: "FAILED" });
    logger.error(`[GET_ALL] Error: ${error.message}`);
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  let logEntry;
  const user = req.user;
  const userId = user?.id || null;
  const ip = req.ip;
  const endpoint = req.originalUrl;
  const { id } = req.params;

  try {
    logEntry = await Log.create({
      userId,
      endpointAccess: endpoint,
      ip,
      action: "GET_BY_ID",
      status: "IN_PROGRESS",
      fileName: "-",
    });

    const file = await EncryptedFile.findByPk(id);

    if (!file) {
      logger.warn(`[GET_BY_ID] Record not found: ID ${id}`);
      await logEntry.update({ status: "FAILED" });

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

    logger.info(`[GET_BY_ID] Retrieved record: ID ${id}`);
    await logEntry.update({ status: "SUCCESS" });

    res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data,
    });
  } catch (error) {
    if (logEntry) await logEntry.update({ status: "FAILED" });
    logger.error(`[GET_BY_ID] Error: ${error.message}`);
    next(error);
  }
};