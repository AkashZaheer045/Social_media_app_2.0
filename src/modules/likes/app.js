const express = require('express');

/**
 * Likes module router factory
 * @returns {express.Router} Configured Express router
 */
module.exports = function () {
  const router = express.Router();
  router.use('/', require('./routes/rtLikes'));
  return router;
};
