const express = require('express');
const controller = require('../controllers/ctrlLikes');
const rules = require('../validations/valdLikes');
const Validation = require('../validations/validation');
const router = express.Router();

//1- Toggle like on a post
router.post('/toggle', rules.rule('toggleLike'), Validation.validate, controller.toggleLike);
//2- Toggle like on a comment
router.post(
  '/toggleComment',
  rules.rule('toggleComment'),
  Validation.validate,
  controller.toggleComment
);
//3- Get likes by post ID
router.post('/post/:postId', controller.getByPost);
//4- Get likes by comment ID        \
router.post('/comment/:commentId', controller.getByComment);
//5- Get likes by user ID
router.post('/user/:userId', controller.getByUser);
//6- Get likes by user ID and post ID
router.post('/user/:userId/post/:postId', controller.getByUserAndPost);
//7- Get likes by user ID and comment ID
router.post('/user/:userId/comment/:commentId', controller.getByUserAndComment);
//8-Total likes on a post
router.post('/post/:postId/count', controller.countLikes);

/*1.toggle like on a post
2.toggle like on a comment
3.get likes by post id
4.get likes by comment id
5.get likes by user id
6.get likes by user id and post id
7.get likes by user id and comment id
*/

module.exports = router;
