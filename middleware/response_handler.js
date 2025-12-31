const multer = require('multer');
const responseH = require('./../utils/response');
const Exception = require('eb-butler-utils').exceptions;
const custom_exceptions = require('./../utils/custom_exceptions.json');
const sequelize = require('../db/sequelize/sequelize');

const uc_words = (str) =>
  String(str)
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (s) => s.toUpperCase());
const setField = (field) =>
  String(field || '')
    .trim()
    .replace(/_/g, ' ');

// Helpers

const getMessage = (lang, key, fallback) => {
  const messages = custom_exceptions[lang] || custom_exceptions.en;
  return messages[key] || fallback || key;
};

const parseSequelizeValidationError = (error, messages) => {
  const key = error?.validatorKey;
  const path = uc_words(setField(error?.path));
  const value = String(error?.value || '');

  const msgMap = {
    min: `Please enter positive integer value for ${path}`,
    isIn: `Please enter valid value for ${path}`,
    isInt: `Please enter valid integer value for ${path}`,
    isDate: `Please enter valid date for ${path}`,
    notNull: `${path} is required, and can not be empty`,
    isEmail: `Please enter valid email address for ${path}`,
    isUnique: `${path} '${value}' is already taken`,
    notEmpty: `${path} can not be empty`,
  };

  return messages[key] || msgMap[key] || error?.message;
};

/**
 * Main response handler middleware
 * This is a 4-argument middleware that handles both success data and errors
 * passed via next(data) or next(err)
 */
const responseHandler = async function (data, req, res, next) {
  // If response is already sent, skip
  if (res.headersSent) {
    return next();
  }

  const response = new responseH();
  const lang = req.language || 'en';
  const messages = custom_exceptions[lang] || custom_exceptions.en;

  let console_error = true;

  try {
    // Handle numeric HTTP status codes (e.g., next(404), next(401))
    if (data && !isNaN(data) && typeof data === 'number') {
      response.setError(data, Exception(data), data);
      console_error = false;
    }
    // Handle Sequelize ValidationError
    else if (data instanceof sequelize.sequelize.ValidationError) {
      const error = data.errors?.[0];
      const key = `${error.path}_${error.validatorKey}`; // like "email_isUnique"
      const fallback = `${uc_words(setField(error.path))} '${error.value}' is already taken`;
      let message = messages[key] || messages[error.validatorKey] || fallback;

      if (error?.message === 'dob_not_future') {
        message = getMessage(lang, 'dob_not_future', error.message);
      }

      if (data.type === 'EXPRESS_VALIDATOR_ERROR' && data.errors?.length) {
        const firstError = data.errors[0];
        message = getMessage(lang, firstError.msg, firstError.msg);

        response.setError(422, message, 422);
        response.error = {
          message: firstError.msg,
          type: 'Express Validation Error',
        };
      } else {
        response.setError(error, Exception(422), 422);
        response.message = message;
        response.error = {
          message: error.message,
          type: 'Validation error',
        };
      }

      console_error = false;
    }
    // Handle Sequelize ValidationErrorItem
    else if (data instanceof sequelize.sequelize.ValidationErrorItem) {
      const error = data;
      response.setError(error, Exception(422), 422);
      response.message = parseSequelizeValidationError(error, messages);
      console_error = false;
    }
    // Handle Sequelize database errors
    else if (
      data instanceof sequelize.sequelize.SequelizeScopeError ||
      data instanceof sequelize.sequelize.DatabaseError ||
      data instanceof sequelize.sequelize.InstanceError
    ) {
      response.setError(data, Exception(400), 400);
    }
    // Handle Multer errors
    else if (data instanceof multer.MulterError) {
      response.setError(data, Exception(411), 411);
    }
    // Handle other Sequelize base errors
    else if (data instanceof sequelize.sequelize.BaseError) {
      response.setError(data.message, Exception(500), 500);
    }
    // Handle TypeError
    else if (data instanceof TypeError) {
      try {
        const parsed = JSON.parse(data.message);
        const { type, limit, field } = parsed;
        const key = `${field}_${limit}_length`;
        const message = getMessage(lang, key, `Length ${limit} limit issue for ${field}`);
        const responseData = response.setError(data, message, 412);
        responseData.errorStack = data.stack;
        return res.status(412).json(responseData);
      } catch {
        const message = getMessage(lang, data.message, data.message);
        return res.status(412).json({
          status: 'error',
          statusCode: 412,
          message,
          data: {},
          error: data,
          errorStack: data.stack,
        });
      }
    }
    // Handle generic Error objects
    else if (data instanceof Error) {
      response.setError(data.message, Exception(500), 500);
    }
    // Handle success cases - plain objects with data (e.g., login response)
    else {
      response.setSuccess(data, Exception(200), 200);
      console_error = false;
    }

    if (response.status === 'error' && data?.stack) {
      response.setErrorStack(data.stack);
    }

    response.sendRes(req, res);
    // Don't call next() after sending response - it can cause issues
    return;
  } catch (err) {
    console.log('Unexpected error in response handler:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Unexpected server error',
        error: err.message,
      });
    }
  }
};

module.exports = responseHandler;
