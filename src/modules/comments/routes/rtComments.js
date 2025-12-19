// routes/rtComments.js
const express = require('express');
const controller = require('../controllers/ctrlComments');
// const rules = require('../validations/valdComments');
// const Validation = require('../validations/validation');
const router = express.Router();
//1- Add a comment
router.post('/add', /* rules.rule('add'), Validation.validate, */ controller.add);
//2- Get comments by post ID
router.post('/getby-post', controller.getByPost);
//3- Edit a comment
router.post('/edit', /*rules.rule('edit'), Validation.validate, */ controller.edit);
//4- Delete a comment
router.post('/delete', /*rules.rule('delete'), Validation.validate, */ controller.delete);
//5- Toggle like on a comment
router.post('/like', /* rules.rule('toggleLike'), Validation.validate,*/ controller.toggleLike);

module.exports = router;
