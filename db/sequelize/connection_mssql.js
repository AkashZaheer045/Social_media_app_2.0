let connection = null;
const sequelize = require('sequelize');
const config = require('./../config/db');
//--//
sequelize.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);
  return date.format('YYYY-MM-DD HH:mm:ss');
};
//--//
const dbConfig = {
  host: config.host,
  port: config.port,
  logging: config.logging,
  dialect: config.dialect,
  dialectOptions: {
    charset: config.charset,
    options: {
      server: config.host,
      authentication: {
        type: 'default',
        options: {
          userName: config.user,
          password: config.pass,
        },
      },
      options: {
        encrypt: true,
        database: config.name,
        trustServerCertificate: true,
      },
    },
  },
  define: {
    paranoid: true,
    timestamp: true,
    underscored: true,
    underscoredAll: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    defaultScope: {
      paranoid: false,
      where: { deleted_at: null },
      attributes: { exclude: ['deleted_at'] },
    },
  },
  pool: {
    min: config.pool.min,
    max: config.pool.max,
    idle: config.pool.idle,
    evict: config.pool.evict,
    handleDisconnects: config.pool.handleDisconnects,
  },
};
///*if(config.dialect === "mssql"){dbConfig.define.schema = config.schema;}*/
//--//
if (!connection) {
  connection = new sequelize(config.name, config.user, config.pass, dbConfig);
}
//--//
module.exports = {
  config,
  sequelize,
  connection,
};
