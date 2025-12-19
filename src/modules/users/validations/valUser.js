const { check, body } = require('express-validator');

const ValidationRules = {};

const isFieldValid = (field) => field && field.length > 0 && field !== ' ' && field != 'undefined'; // number does not have a length

ValidationRules.rule = (method) => {
  switch (method) {
    case 'create': {
      return [
        check('name')
          .notEmpty()
          .withMessage('required')
          .isString()
          .trim()
          .withMessage('invalid_value')
          .isLength({ max: 50 })
          .withMessage('length_limit_exceded'),
        // check('profilePictureUrl').notEmpty().withMessage("required").isString().trim().withMessage("invalid_value").isLength({ max: 50 }).withMessage('Length Limit exceded'),
        check('email')
          .notEmpty()
          .withMessage('email')
          .trim()
          .isEmail()
          .withMessage('invalid_email')
          .isLength({ max: 50 })
          .withMessage('length_limit_exceded'),
        check('password')
          .notEmpty()
          .trim()
          .withMessage('required')
          .isLength({ min: 6 })
          .withMessage('length_is_short')
          .isLength({ max: 15 })
          .withMessage('length_limit_exceded'),
        check('confirmPassword')
          .notEmpty()
          .trim()
          .withMessage('required')
          .isLength({ min: 6 })
          .withMessage('length_is_short')
          .isLength({ max: 15 })
          .withMessage('length_limit_exceded'),
        // check('phoneNumber').notEmpty().trim().isLength({ min: 10, max: 15 }).withMessage('invalid_phone'),
        // check('customerNumber').notEmpty().trim().isLength({ min: 1, max: 8 }).withMessage('invalid_phone')
      ];
    }

    case 'login': {
      return [
        check('email')
          .notEmpty()
          .withMessage('email')
          .trim()
          .isEmail()
          .withMessage('invalid_email')
          .isLength({ max: 50 })
          .withMessage('length_limit_exceded'),
        check('password').notEmpty().trim().withMessage('password'),
        // check('device_token').notEmpty().trim().withMessage('device_token').isLength({ max: 100 }).withMessage('Length Limit exceded'),
        // check('device_info').notEmpty().trim().withMessage('device_info').isLength({ max: 100 }).withMessage('Length Limit exceded'),
        // check('device_type').notEmpty().trim().withMessage('device_type').isLength({ max: 100 }).withMessage('Length Limit exceded')
      ];
    }

    case 'generateAccessToken': {
      return [check('refresh_token').notEmpty().trim().withMessage('required')];
    }
    case 'updateEmail': {
      return [
        body('newEmail')
          .isEmail()
          .withMessage('Please provide a valid email')
          .trim()
          .isEmail()
          .withMessage('invalid_email')
          .isLength({ max: 50 })
          .withMessage('length_limit_exceded'),
      ];
    }
    case 'forgotPassword': {
      return [
        check('email')
          .notEmpty()
          .withMessage('email')
          .trim()
          .isEmail()
          .withMessage('invalid_email')
          .isLength({ max: 50 })
          .withMessage('length_limit_exceded'),
      ];
    }

    case 'updatePassword': {
      return [
        check('email')
          .notEmpty()
          .withMessage('email')
          .trim()
          .isEmail()
          .withMessage('invalid_email')
          .isLength({ max: 50 })
          .withMessage('length_limit_exceded'),
        check('password')
          .notEmpty()
          .trim()
          .withMessage('password')
          .isLength({ min: 6 })
          .withMessage('length_is_short')
          .isLength({ max: 15 })
          .withMessage('length_limit_exceded'),
        check('confirmPassword')
          .notEmpty()
          .trim()
          .withMessage('confirmPassword')
          .isLength({ min: 6 })
          .withMessage('length_is_short')
          .isLength({ max: 15 })
          .withMessage('length_limit_exceded'),
      ];
    }
  }
};

module.exports = ValidationRules;
