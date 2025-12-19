const { generateRandomString } = require('eb-butler-utils');
const constants = require('../../config/constants.json');
const keys_length = constants.keys_length;

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'temp_tokens',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      token: { type: DataTypes.STRING, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: true },
      used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: 'temp_tokens',
    }
  );

  // Add the same generateAccessToken method as in schAuthorizations
  Model.prototype.generateAccessToken = function () {
    this.token = generateRandomString(keys_length.access_token, constants.char_set);
  };

  return Model;
};
