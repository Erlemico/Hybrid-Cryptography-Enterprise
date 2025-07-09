'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EncryptedFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EncryptedFile.init({
    fileName: DataTypes.STRING,
    rsaKey: DataTypes.TEXT,
    iv: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EncryptedFile',
  });
  return EncryptedFile;
};