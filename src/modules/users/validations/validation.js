const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      if (errors.array()[0].msg === 'Invalid value') {
        const err = new TypeError(`Invalid value for ${errors.array()[0].param}`);
        next(err);
      } else if (errors.array()[0].msg === 'required') {
        console.log('======> errors.array()[0].param : ', errors.array()[0].param);
        console.log('request contains : ', req.body);

        const err = new TypeError(`${errors.array()[0].param} is required`);
        next(err);
      } else if (errors.array()[0].msg === 'string') {
        const err = new TypeError(`${errors.array()[0].param} should be string`);
        next(err);
      } else if (errors.array()[0].msg === 'int') {
        const err = new TypeError(`${errors.array()[0].param} should be a number`);
        next(err);
      } else if (errors.array()[0].msg === 'array') {
        const err = new TypeError(`${errors.array()[0].param} should be array`);
        next(err);
      } else if (errors.array()[0].msg === 'invalid_value') {
        const err = new TypeError(`Invalid value for ${errors.array()[0].param}`);
        next(err);
      } else if (errors.array()[0].msg === 'length_limit_exceded') {
        const err = new TypeError(
          JSON.stringify({
            type: 'length',
            limit: 'maximum',
            field: errors.array()[0].param,
          })
        );
        next(err);
      } else if (errors.array()[0].msg === 'length_is_short') {
        const err = new TypeError(
          JSON.stringify({
            type: 'length',
            limit: 'minimum',
            field: errors.array()[0].param,
          })
        );
        next(err);
      } else {
        const err = new TypeError(errors.array()[0].msg);
        next(err);
      }

      // let returnObj = { data: [], status: false, statusCode: 412, message: `Validation Error`, error: errors.array() }
      // res.status(returnObj.statusCode).send(returnObj);
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
