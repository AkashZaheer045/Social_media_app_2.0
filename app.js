const cors = require("cors");
const morgan = require("morgan");
const moment = require("moment");
const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
require('dotenv').config();

// Utility imports
const { request_getters, request_parser, not_found, allowed_methods } = require('eb-butler-utils');
const common = require('./helpers/common');

// Middleware imports
const verifyAuth = require('./middleware/auth');
const responseHandler = require("./middleware/response_handler");

// Database
const sequelize = require('./db/sequelize/sequelize.js');

// ============================================
// Express Application Setup
// ============================================
const app = express();

// CORS configuration
app.use(cors({ optionsSuccessStatus: 200 }));
app.options("*", cors({ optionsSuccessStatus: 200 }));

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));



// Static file serving
app.use("/uploads", express.static(__dirname + "/uploads"));

// ============================================
// Console Logging Setup
// ============================================
const console_stamp = require("console-stamp");
const TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";

console_stamp(console, {
    pattern: TIMESTAMP_FORMAT,
    formatter: () => moment().format(TIMESTAMP_FORMAT)
});

// ============================================
// Request Logging (Morgan)
// ============================================
morgan.token("date", () => moment().format(TIMESTAMP_FORMAT));

morgan.token("status", (req, res) => {
    const headersSent = (typeof res.headersSent !== "boolean") ? Boolean(res._header) : res.headersSent;
    const status = headersSent ? res.statusCode : undefined;
    const color =
        status >= 500 ? 31 :
            status >= 400 ? 33 :
                status >= 300 ? 36 :
                    status >= 200 ? 32 : 0;
    return `\x1b[${color}m${status}\x1b[0m`;
});

app.use(morgan("[:date] [:method] :url :status :res[content-length] - :response-time ms"));

// ============================================
// Health Check Endpoints (Before any restrictive middleware)
// ============================================
app.get('/health', function (req, res) {
    console.log('Health check requested');
    res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/api/v1/health', function (req, res) {
    console.log('API Health check requested');
    res.json({ status: 'healthy', version: 'v1', timestamp: new Date() });
});

// ============================================
// Request Preprocessing
// ============================================
app.use(allowed_methods);
app.use(request_getters);
app.use(request_parser);
app.use(common.languageSet);

// Request URL logging
app.use(function (req, res, next) {
    console.log("======> req.originalUrl : ", req.originalUrl);
    next();
});

// ============================================
// API Routes (v1)
// ============================================

// Public routes (no authentication required)
app.use("/api/v1/user", require("./src/modules/users/app.js")({ publicOnly: true }));

// Apply global authentication middleware
app.use(verifyAuth);

// Protected routes (authentication required)
app.use("/api/v1/user", require("./src/modules/users/app.js")({ protectedOnly: true }));
app.use("/api/v1/posts", require("./src/modules/posts/app.js")());
app.use("/api/v1/comments", require("./src/modules/comments/app.js")());
app.use("/api/v1/likes", require("./src/modules/likes/app.js")());
app.use("/api/v1/files", require("./src/modules/files/app.js")());

// ============================================
// Error Handling
// ============================================
app.use(not_found);

// Log error stack to terminal, then forward to response handler
app.use(function (err, req, res, next) {
    if (err) {
        // Prefer stack when available for full trace
        console.error("Error stack:", err.stack || err);
    }
    next(err);
});

app.use(responseHandler);

// ============================================
// Database Connection & Server Startup
// ============================================
sequelize.connection.authenticate({ alter: true })
    .then(async function () {
        // Sync database tables with models
        await sequelize.connection.sync();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, async function (error) {
            if (error) {
                console.log("Server is not listening...", error);
            } else {
                console.log("DB connected & Server is listening on HOST", os.hostname(), "on PORT", PORT);
            }
        });
    })
    .catch(function (error) {
        console.log("Unable to connect to database", error);
    });

// ============================================
// Module Export   
// ============================================
module.exports = app;
