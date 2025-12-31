const util = require('util');

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie'];

function maskHeaders(headers) {
	// shallow copy and mask sensitive values
	const out = {};
	for (const [k, v] of Object.entries(headers || {})) {
		out[k] = SENSITIVE_HEADERS.includes(k.toLowerCase()) ? '***masked***' : v;
	}
	return out;
}

function safeStringify(obj, maxLen = 1000) {
	try {
		if (typeof obj === 'string') {
			if (obj.length > maxLen) return obj.slice(0, maxLen) + '...[truncated]';
			return obj;
		}
		const str = JSON.stringify(obj);
		if (str.length > maxLen) return str.slice(0, maxLen) + '...[truncated]';
		return str;
	} catch (e) {
		const inspected = util.inspect(obj, { depth: 2 });
		return inspected.length > maxLen ? inspected.slice(0, maxLen) + '...[truncated]' : inspected;
	}
}

module.exports = function requestResponseLogger(req, res, next) {
	// Skip static or health endpoints if desired
	const skipPrefixes = ['/uploads', '/api/v1/health', '/health'];
	for (const p of skipPrefixes) {
		if (req.originalUrl && req.originalUrl.startsWith(p)) return next();
	}

	// Log incoming request
	try {
		console.log('---▶ Request Start ---');
		console.log('Method:', req.method, 'URL:', req.originalUrl);
		console.log('IP:', req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress);
		if (req.query && Object.keys(req.query).length) console.log('Query:', safeStringify(req.query));
		if (req.params && Object.keys(req.params).length) console.log('Params:', safeStringify(req.params));

		// Headers (mask sensitive)
		console.log('Headers:', safeStringify(maskHeaders(req.headers)));

		// Body handling
		const contentType = (req.headers['content-type'] || '').toLowerCase();
		if (contentType.includes('multipart/form-data') || contentType.includes('application/octet-stream')) {
			// file upload / binary — don't attempt to print body
			if (req.files) {
				// multer-like files
				const filesSummary = Array.isArray(req.files)
					? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size }))
					: Object.keys(req.files || {}).reduce((acc, k) => {
						acc[k] = (req.files[k] || []).map(f => ({ originalname: f.originalname, size: f.size }));
						return acc;
					}, {});
				console.log('Files:', safeStringify(filesSummary));
			} else {
				console.log('Body: <multipart/binary data - omitted>');
			}
		} else {
			// Normal JSON / urlencoded
			if (req.body && Object.keys(req.body).length) {
				console.log('Body:', safeStringify(req.body));
			} else if (req._rawBody) {
				// if you capture raw body earlier, log small portion
				console.log('RawBody:', safeStringify(req._rawBody));
			} else {
				// nothing parsed
				console.log('Body: <empty or not parsed>');
			}
		}
	} catch (e) {
		console.error('Request logging error:', e);
	}

	// Hook res.send/res.json to capture response body (non-error responses)
	const originalSend = res.send.bind(res);
	const originalJson = res.json ? res.json.bind(res) : null;

	function shouldSkipResponseLogging() {
		const status = res.statusCode || 200;
		return status >= 400;
	}

	function isBinaryResponse() {
		const ct = (res.getHeader && res.getHeader('content-type') || '') + '';
		return ct.includes('application/octet-stream') || ct.includes('multipart/') || ct.includes('image/') || ct.includes('video/');
	}

	function logResponseBody(body) {
		try {
			if (shouldSkipResponseLogging()) {
				console.log(`Response skipped (status ${res.statusCode})`);
				console.log('---▶ Request End ---');
				return;
			}
			if (isBinaryResponse()) {
				console.log('Response skipped (binary/stream)');
				console.log('---▶ Request End ---');
				return;
			}
			console.log('Status:', res.statusCode);
			// body may be Buffer, object, string
			if (Buffer.isBuffer(body)) {
				console.log('Response Body: <Buffer length=' + body.length + '>');
			} else {
				console.log('Response Body:', safeStringify(body));
			}
			console.log('---▶ Request End ---');
		} catch (e) {
			console.error('Response logging error:', e);
		}
	}

	res.send = function (body) {
		const result = originalSend(body);
		// log after send so statusCode is set
		logResponseBody(body);
		return result;
	};

	if (originalJson) {
		res.json = function (body) {
			const result = originalJson(body);
			logResponseBody(body);
			return result;
		};
	}

	// Fallback for streamed responses
	res.on('finish', () => {
		try {
			if (res.__logged_by_middleware) return;
			// mark to avoid duplicate logs if send/json already logged
			res.__logged_by_middleware = true;
			if (shouldSkipResponseLogging()) {
				console.log(`Response skipped on finish (status ${res.statusCode})`);
			} else {
				console.log('Status (finish):', res.statusCode);
			}
			console.log('---▶ Request End ---');
		} catch (e) {
			/* ignore */
		}
	});

	return next();
};
