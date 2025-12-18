// Response utility class

//--//
module.exports = class {
    constructor() {
        this.status = null;
        this.statusCode = null;
        this.message = null;
        this.data = null;
        this.error = null;
        this.errorStack = null;
    };
    setSuccess(data, message, statusCode) {
        this.status = "success";
        this.statusCode = statusCode || 200;
        this.message = message || "OK";
        this.data = data;
        this.error = null;
        return this;
    };
    setError(error, message, statusCode) {
        this.status = "error";
        this.statusCode = statusCode || 500;
        this.message = message || "Error";
        this.data = {};
        this.error = error;
        this.errorStack = null;
        return this;
    };
    setErrorStack(stack) {
        this.errorStack = stack || null;
        return this;
    };
    sendRes(req, res) {
        let result = {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            error: this.error,
            errorStack: this.errorStack
        };
        if (req.statusMessage && req.statusMessage !== "") { result.message = req.statusMessage; }
        return res.status(this.statusCode).json(result);
    }
};
