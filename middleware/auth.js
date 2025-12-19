const base_encoder = require('eb-butler-utils');
const constants = require('../config/constants.json');
const userService = require('../src/modules/users/services/srvcUsers');

const keys_length = constants.keys_length;
const index_separator = keys_length.index_separator;

/**
 * Authentication middleware factory
 * Creates middleware that verifies access tokens and attaches user info to request
 * @param {Object} options - Configuration options (reserved for future use)
 * @returns {Function} Express middleware function
 */
function createAuthMiddleware(options = {}) {
  return async function verifyAuth(req, res, next) {
    try {
      const accessHeader = req.header('authorization') || req.header('Authorization');
      if (!accessHeader) {
        const err = new Error('Access token required');
        err.statusCode = 412;
        err.data = {};
        throw err;
      }

      const access_token = accessHeader;
      const accessParts = access_token.split(index_separator);
      if (accessParts.length !== 4) {
        const err = new Error('Invalid access token format');
        err.statusCode = 401;
        err.data = {};
        throw err;
      }

      const userId = base_encoder.decode(accessParts[0], constants.data_set);
      const authId = base_encoder.decode(accessParts[1], constants.data_set);
      const accessExpiry = parseInt(base_encoder.decode(accessParts[3], constants.data_set), 10);

      if (Date.now() > accessExpiry) {
        const err = new Error('Access token expired');
        err.statusCode = 601;
        err.data = {};
        throw err;
      }

      // Fetch user with role information
      const user = await userService.findUserWithRoleById(userId);
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        err.data = {};
        throw err;
      }

      // Check if user is active
      if (!user.active) {
        const err = new Error('User account is inactive. Please contact support.');
        err.statusCode = 401;
        err.data = {};
        throw err;
      }

      // Attach user info and role to request object
      req.user = {
        userId: user.id,
        authId,
        name: user.name,
        email: user.email,
        userName: user.userName,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        role: user.role, // Contains { id, name } from roles table
      };
      req.role = user.userrole_id; // Numeric role ID for authorization checks

      return next();
    } catch (err) {
      // Ensure the error has a stack and a statusCode property before forwarding
      if (!err.stack) Error.captureStackTrace(err, verifyAuth);
      if (!err.statusCode && !err.status) err.statusCode = err.statusCode || 500;

      // Log error to terminal
      console.error(
        `[AUTH ERROR] [${req.method}] ${req.originalUrl} - Status: ${err.statusCode || 500} - Message: ${err.message}`
      );

      return next(err);
    }
  };
}

// Export factory function and a default instance for backward compatibility
module.exports = createAuthMiddleware();
module.exports.createAuthMiddleware = createAuthMiddleware;
