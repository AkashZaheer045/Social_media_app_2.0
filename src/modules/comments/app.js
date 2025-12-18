const express = require("express");

/**
 * Comments module router factory
 * @returns {express.Router} Configured Express router
 */
module.exports = function () {
    const router = express.Router();
    router.use("/", require("./routes/rtComments"));
    return router;
};
