const express = require("express");
const publicRoutes = require("./routes/rtUsers").public;
const protectedRoutes = require("./routes/rtUsers").protected;

/**
 * Users module router factory
 * @param {Object} options - Configuration options
 * @param {boolean} options.publicOnly - Mount only public routes (no auth required)
 * @param {boolean} options.protectedOnly - Mount only protected routes (auth required)
 * @returns {express.Router} Configured Express router
 */
module.exports = function ({ publicOnly, protectedOnly } = {}) {
    const router = express.Router();

    if (publicOnly) {
        router.use("/", publicRoutes);
    } else if (protectedOnly) {
        router.use("/", protectedRoutes);
    } else {
        router.use("/", publicRoutes);
        router.use("/", protectedRoutes);
    }

    return router;
};
