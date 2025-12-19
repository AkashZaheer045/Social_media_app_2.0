const base_encoder = require('eb-butler-utils');
const constants = require('../config/constants.json');
const keys_length = constants.keys_length;
const index_separator = keys_length.index_separator;
const sequelize = require('../db/sequelize/sequelize');
const userService = require('../src/modules/users/services/srvcUsers');

async function verifyAuth(req, res, next) {
  try {
    const accessHeader = req.header('authorization') || req.header('Authorization');
    if (!accessHeader) return next(new TypeError('Access token required'));
    const access_token = accessHeader;
    const accessParts = access_token.split(index_separator);
    if (accessParts.length !== 4) return next(new TypeError('Invalid access token format'));

    const userId = base_encoder.decode(accessParts[0], constants.data_set);
    const authId = base_encoder.decode(accessParts[1], constants.data_set);
    const accessExpiry = parseInt(base_encoder.decode(accessParts[3], constants.data_set), 10);

    if (Date.now() > accessExpiry) {
      // Token expired
      return res.status(601).json({ error: 'Access token expired' });
    }

    // Check user existence and extract role using findUserById
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = { userId, authId };
    req.role = user.userrole_id;
    // console.log("Token authenticated for userId:", userId, "authId:", authId, "role:", user.userrole_id);
    return next();
  } catch (err) {
    return next(new TypeError('Authentication failed: ' + err.message));
  }
}

module.exports = verifyAuth;
