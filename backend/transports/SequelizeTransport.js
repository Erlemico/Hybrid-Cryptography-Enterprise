const Transport = require("winston-transport");

class SequelizeTransport extends Transport {
  constructor(opts = {}) {
    super(opts);
    this.LogModel = opts.model;
  }

  async log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    const { level, message, ...meta } = { ...info };

    const importantActions = [
      "LOGIN",
      "LOGOUT",
      "UPLOAD",
      "ENCRYPT",
      "DECRYPT",
      "BRUTEFORCE",
      "GET_ALL",
      "DOWNLOAD",
      "DELETE",
      "INTEGRITY_CHECK",
    ];

    const action = meta.action || message;

    // Skip log jika bukan action penting
    if (!importantActions.includes(action.toUpperCase())) {
      return callback();
    }

    // Jika userId tidak tersedia, abaikan log daripada error
    if (meta.userId === undefined || meta.userId === null) {
      console.warn(
        `[SequelizeTransport] SKIPPED: userId is null for action ${action}`
      );
      return callback();
    }

    try {
      await this.LogModel.create({
        userId: meta.userId, // ← wajib tersedia
        filename: meta.filename || "-",
        action: action,
        status: meta.status || level.toUpperCase(),
      });
    } catch (error) {
      console.error("[SequelizeTransport] DB insert failed:", error);
    }

    callback();
  }
}

module.exports = SequelizeTransport;