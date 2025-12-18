/**
 * Database Connection Configuration
 * Uses environment variables with fallback to config.json
 */
require('dotenv').config();

const Sequelize = require("sequelize");

// Determine environment
const env = process.env.NODE_ENV || 'development';

// Database configuration - prefer environment variables
const dbConfig = {
    name: process.env.DB_NAME || 'social_media_app',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: env === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: false
    }
};

// Try to load config.json for additional settings (if exists)
let fileConfig = {};
try {
    fileConfig = require("../../config/config.json");
    if (fileConfig[env]) {
        // Merge file config with env config (env takes priority)
        Object.keys(fileConfig[env]).forEach(key => {
            if (!process.env[`DB_${key.toUpperCase()}`]) {
                dbConfig[key] = fileConfig[env][key];
            }
        });
    }
} catch (e) {
    console.log("No config.json found, using environment variables only");
}

// Fix DATE formatting
Sequelize.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    date = this._applyTimezone(date, options);
    return date.format("YYYY-MM-DD HH:mm:ss");
};

// Create connection
let connection = new Sequelize(
    dbConfig.name,
    dbConfig.user,
    dbConfig.pass,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        define: dbConfig.define
    }
);

module.exports = {
    config: { [env]: dbConfig },
    sequelize: Sequelize,
    connection
};
