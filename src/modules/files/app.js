const express = require('express');

/**
 * Files module router factory
 * @returns {express.Router} Configured Express router
 */
module.exports = function () {
  const router = express.Router();
  router.use('/', require('./routes/rtFiles'));
  return router;
};
