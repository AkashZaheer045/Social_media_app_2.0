const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return the first error message
      const firstError = errors.array()[0];
      const err = new TypeError(firstError.msg);
      next(err);
    } else {
      next();
    }
  } catch (_err) {
    const returnObj = {
      data: [],
      status: false,
      statusCode: 500,
      message: `Bad Request`,
      error: [],
    };
    next(returnObj);
  }
};
