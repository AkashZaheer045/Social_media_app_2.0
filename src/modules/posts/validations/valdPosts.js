const { check } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = (method) => {
  switch (method) {
    case 'create': {
      return [check('content').notEmpty().withMessage('Text is required')];
    }
    case 'delete': {
      return [
        check('postId')
          .notEmpty()
          .withMessage('Post ID is required')
          .isNumeric()
          .withMessage('Invalid post ID'),
      ];
    }
    case 'get': {
      return [
        check('postId')
          .notEmpty()
          .withMessage('Post ID is required')
          .isNumeric()
          .withMessage('Invalid post ID'),
      ];
    }
    case 'update': {
      return [
        check('postId')
          .notEmpty()
          .withMessage('Post ID is required')
          .isNumeric()
          .withMessage('Invalid post ID'),

        check('text').optional().notEmpty().withMessage('Text cannot be empty'),

        // Uncomment if mediaUrl is used later
        // check('mediaUrl')
        //     .optional()
        //     .isURL().withMessage("Invalid media URL"),
      ];
    }
    case 'getUserPosts': {
      return [
        check('userId')
          .notEmpty()
          .withMessage('User ID is required')
          .isNumeric()
          .withMessage('Invalid user ID'),
      ];
    }
  }
};

module.exports = ValidationRules;
