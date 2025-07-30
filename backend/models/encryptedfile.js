"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EncryptedFile extends Model {
    static associate(models) {
      EncryptedFile.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  EncryptedFile.init(
    {
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rsaKey: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      iv: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      originalHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "EncryptedFile",
      tableName: "EncryptedFiles",
      timestamps: true,
    }
  );

  return EncryptedFile;
};