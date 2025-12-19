const express = require('express');

/**
 * Posts module router factory
 * @returns {express.Router} Configured Express router
 */
module.exports = function () {
  const router = express.Router();
  router.use('/', require('./routes/rtPosts'));
  return router;
};
