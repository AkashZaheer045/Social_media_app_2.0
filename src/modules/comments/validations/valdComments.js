const { check } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = (method) => {
  switch (method) {
    case 'add': {
      return [
        check('postId').notEmpty().withMessage('Post ID is required').isNumeric(),
        check('text').notEmpty().withMessage('Text is required'),
        check('parentId').optional().isNumeric(),
      ];
    }
    case 'edit': {
      return [
        check('commentId').notEmpty().withMessage('Comment ID is required').isNumeric(),
        check('text').notEmpty().withMessage('Text is required'),
      ];
    }
    case 'delete': {
      return [check('commentId').notEmpty().withMessage('Comment ID is required').isNumeric()];
    }
    case 'toggleLike': {
      return [check('commentId').notEmpty().withMessage('Comment ID is required').isNumeric()];
    }
  }
};

module.exports = ValidationRules;
