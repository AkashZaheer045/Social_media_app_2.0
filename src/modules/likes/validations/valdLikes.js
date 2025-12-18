const { check } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = (method) => {
    switch (method) {
        //1- Toggle like on a post
        case 'toggleLike': {
            return [
                check('targetId').notEmpty().withMessage("Target ID is required").isNumeric(),
                check('targetType').notEmpty().withMessage("Target type is required").isIn(['post', 'comment'])
            ];
        }
        //2- Total likes on a post
        case 'countLikes': {
            return [
                check('targetId').notEmpty().withMessage("Target ID is required").isNumeric(),
                check('targetType').notEmpty().withMessage("Target type is required").isIn(['post', 'comment'])
            ];
        }
        //3- Toggle like on a comment
        case 'toggleComment': {
            return [
                check('commentId').notEmpty().withMessage("Comment ID is required").isNumeric(),
            ];
        }
        case 'getByPost': {
            return [
                check('postId').notEmpty().withMessage("Post ID is required").isNumeric(),
            ];
        }
        case 'getByComment': {
            return [
                check('commentId').notEmpty().withMessage("Comment ID is required").isNumeric(),
            ];
        }
        case 'getByUser': {
            return [
                check('userId').notEmpty().withMessage("User ID is required").isNumeric(),
            ];
        }
        case 'getByUserAndPost': {
            return [
                check('userId').notEmpty().withMessage("User ID is required").isNumeric(),
                check('postId').notEmpty().withMessage("Post ID is required").isNumeric(),
            ];
        }
        default: {
            return [];
        }
    }
};

module.exports = ValidationRules;