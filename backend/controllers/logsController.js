const { Log, User } = require("../models");
const { Parser } = require("json2csv");

// GET Logs dalam format JSON
exports.getLogsJson = async (req, res) => {
  const userId = req.user?.id || null;
  const endpoint = req.originalUrl;
  const ip = req.ip;

  let logEntry;

  try {
    logEntry = await Log.create({
      userId,
      endpointAccess: endpoint,
      action: "EXPORT_LOGS_JSON",
      status: "IN_PROGRESS",
      fileName: "-",
      ip,
    });

    const logs = await Log.findAll({
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username", "role"],
      },
      raw: true,
      nest: true,
      order: [["id", "ASC"]],
    });

    const result = logs.map((log) => ({
      id: log.id,
      userId: log.user?.id || null,
      username: log.user?.username || "Unknown",
      role: log.user?.role || "Unknown",
      endpointAccess: log.endpointAccess || "-",
      action: log.action,
      status: log.status,
      fileName: log.fileName || "-",
      ip: log.ip || "-",
      createdAt: log.createdAt,
    }));

    await logEntry.update({ status: "SUCCESS" });

    const jsonContent = JSON.stringify(result, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=logs.json");

    res.send(jsonContent);
  } catch (err) {
    if (logEntry) await logEntry.update({ status: "FAILED" });
    res.status(500).json({
      message: "Gagal mengambil log",
      error: err.message,
    });
  }
};

// GET Logs dalam format CSV
exports.getLogsCsv = async (req, res) => {
  const userId = req.user?.id || null;
  const endpoint = req.originalUrl;
  const ip = req.ip;

  let logEntry;

  try {
    logEntry = await Log.create({
      userId,
      endpointAccess: endpoint,
      action: "EXPORT_LOGS_CSV",
      status: "IN_PROGRESS",
      fileName: "-",
      ip,
    });

    const logs = await Log.findAll({
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username", "role"],
      },
      raw: true,
      nest: true,
      order: [["id", "ASC"]],
    });

    const result = logs.map((log) => ({
      id: log.id,
      userId: log.user?.id || null,
      username: log.user?.username || "Unknown",
      role: log.user?.role || "Unknown",
      endpointAccess: log.endpointAccess || "-",
      action: log.action,
      status: log.status,
      fileName: log.fileName || "-",
      ip: log.ip || "-",
      createdAt: log.createdAt,
    }));

    const fields = [
      "id",
      "userId",
      "username",
      "role",
      "endpointAccess",
      "action",
      "status",
      "fileName",
      "ip",
      "createdAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(result);

    await logEntry.update({ status: "SUCCESS" });

    res.header("Content-Type", "text/csv");
    res.attachment("logs.csv");
    return res.send(csv);
  } catch (err) {
    if (logEntry) await logEntry.update({ status: "FAILED" });
    res.status(500).json({
      message: "Gagal generate CSV",
      error: err.message,
    });
  }
};