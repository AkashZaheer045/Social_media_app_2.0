const express = require('express');
const controller = require('../controllers/ctrlPosts');
//const authChecker = require('../../../../middleware/auth_checker')
//let { upload } = require('../../../../utils/uploader')
const rules = require('../validations/valdPosts');
const Validation = require('../validations/validation');
//--//
// let superAccessRoles = "super-admin";
// let adminAccessRoles = "super-admin,advisor";
// let commonAccessRoles = "super-admin,advisor,guest";

const router = express.Router();

// 1. Create a post-Done
router.post('/create', rules.rule('create'), Validation.validate, controller.add);

// 2. Update a post (only if owner)-Done
router.post('/update', rules.rule('update'), Validation.validate, controller.update);

// 3. Get all posts (feed)-Done
router.post('/list', controller.getListItems);

// 4. Get a single post by ID -Done
router.post('/get', rules.rule('get'), Validation.validate, controller.get);

// 5. Delete a post (only if owner)
router.post('/soft-delete', rules.rule('delete'), Validation.validate, controller.deleteRecord);

// 6. Get all posts by a user-Done
router.post('/user-posts', controller.getUserPosts);

module.exports = router;
