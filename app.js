const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const os = require('os');
const path = require('path');
require('dotenv').config();

// Utility imports
const { request_getters, request_parser, not_found, allowed_methods } = require('eb-butler-utils');
const common = require('./helpers/common');

// Middleware imports
const verifyAuth = require('./middleware/auth');
const responseHandler = require("./middleware/response_handler");
const requestResponseLogger = require('./middleware/logging');

// Database
const sequelize = require('./db/sequelize/sequelize.js');

// ============================================
// System Information Helper
// ============================================
const getSystemInfo = () => {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    // Get primary network interface
    const networkInterfaces = os.networkInterfaces();
    let primaryIP = '127.0.0.1';
    for (const [, interfaces] of Object.entries(networkInterfaces)) {
        if (!interfaces) continue; // Skip if interfaces is undefined or null
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                primaryIP = iface.address;
                break;
            }
        }
        if (primaryIP !== '127.0.0.1') break;
    }

    return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        osRelease: os.release(),
        cpuModel: cpus[0]?.model?.trim() || 'Unknown',
        cpuCores: cpus.length,
        totalMemoryGB: (totalMemory / (1024 ** 3)).toFixed(1),
        freeMemoryGB: (freeMemory / (1024 ** 3)).toFixed(1),
        primaryIP,
        nodeVersion: process.version,
        appVersion: process.env.npm_package_version || '2.0.0',
        pid: process.pid,
        env: process.env.NODE_ENV || 'development',
    };
};

const printStartupInfo = (port, sysInfo, dbName) => {
    console.log('');
    console.log('  Social Media API v' + sysInfo.appVersion);
    console.log('  - Local:    http://localhost:' + port);
    console.log('  - Database: ' + dbName + ' ✓ connected');
    console.log('');
};

// ============================================
// Helper Functions
// ============================================
const formatDate = (date = new Date()) => {
    return date.toISOString().replace('T', ' ').slice(0, 19);
};

// Custom console logging with timestamps (Node.js 24 native approach)
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => originalLog(`[${formatDate()}]`, ...args);
console.error = (...args) => originalError(`[${formatDate()}]`, ...args);

// ============================================
// Express Application Setup
// ============================================
const app = express();

// CORS configuration - Express 5 compatible
app.use(cors({ optionsSuccessStatus: 200 }));
// Enable pre-flight for all routes (Express 5: use '{*path}' instead of '*')
app.options('{*path}', cors({ optionsSuccessStatus: 200 }));

// Body parsing (Express 5 built-in)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// Request Logging (Morgan)
// ============================================
morgan.token('date', () => formatDate());

morgan.token('status', (_req, res) => {
    const headersSent = typeof res.headersSent !== 'boolean' ? Boolean(res._header) : res.headersSent;
    const status = headersSent ? res.statusCode : undefined;
    const color =
        status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
    return `\x1b[${color}m${status}\x1b[0m`;
});

app.use(morgan('[:date] [:method] :url :status :res[content-length] - :response-time ms'));

// ============================================
// Health Check Endpoints (Before any restrictive middleware)
// ============================================
app.get('/health', (_req, res) => {
    console.log('Health check requested');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (_req, res) => {
    console.log('API Health check requested');
    res.json({
        status: 'healthy',
        version: 'v1',
        node: process.version,
        timestamp: new Date().toISOString(),
    });
});

// ============================================
// Request Preprocessing
// ============================================
app.use(allowed_methods);
app.use(request_getters);
app.use(request_parser);
app.use(common.languageSet);

// Add request/response logger so it wraps the whole request lifecycle
app.use(requestResponseLogger);

// Request URL logging
app.use(function (req, res, next) {
    console.log("======> req.originalUrl : ", req.originalUrl);
    next();
});

// ============================================
// API Routes (v1)
// ============================================

// Public routes (no authentication required)
app.use('/api/v1/user', require('./src/modules/users/app.js')({ publicOnly: true }));

// Public endpoints for viewing content (no auth required)
app.post('/api/v1/public/comments/list', require('./src/modules/comments/controllers/ctrlComments').getByPost);
app.post('/api/v1/public/posts/list', require('./src/modules/posts/controllers/ctrlPosts').getListItems);

// Apply global authentication middleware
app.use(verifyAuth);

// Protected routes (authentication required)
app.use('/api/v1/user', require('./src/modules/users/app.js')({ protectedOnly: true }));
app.use('/api/v1/posts', require('./src/modules/posts/app.js')());
app.use('/api/v1/comments', require('./src/modules/comments/app.js')());
app.use('/api/v1/likes', require('./src/modules/likes/app.js')());
app.use('/api/v1/files', require('./src/modules/files/app.js')());

// ============================================
// Error Handling (Express 5 compatible)
// ============================================
app.use(not_found);

// Log error stack to terminal, then forward to response handler
app.use((err, req, res, next) => {
    if (err) {
        // Prefer stack when available for full trace
        console.error('Error stack:', err.stack || err);
    }
    next(err);
});

app.use(responseHandler);

// ============================================
// Database Connection & Server Startup
// ============================================
const startServer = async () => {
    try {
        await sequelize.connection.authenticate({ alter: true });
        await sequelize.connection.sync();

        const PORT = process.env.PORT || 3000;
        const sysInfo = getSystemInfo();

        app.listen(PORT, () => {
            printStartupInfo(PORT, sysInfo);
        });
    } catch (error) {
        console.error('Unable to connect to database:', error.message);
        process.exit(1);
    }
};

startServer();

// ============================================
// Graceful Shutdown (Node.js 24 best practice)
// ============================================
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    sequelize.connection.close().then(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// Module Export
// ============================================
module.exports = app;
