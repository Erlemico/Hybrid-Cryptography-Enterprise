"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  Log.init(
    {
      username: DataTypes.STRING,
      role: DataTypes.STRING,
      filename: DataTypes.STRING,
      action: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Log",
      tableName: "logs", // sesuaikan jika nama tabel beda
    }
  );

  return Log;
};