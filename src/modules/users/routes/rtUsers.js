const express = require('express');
const commonController = require('../controllers/ctrlUsers');
const subController = require('../controllers/ctrlUserStripe');
const userRules = require('../validations/valUser');
const Validation = require('../validations/validation');
//const checkRoleForCreation = require("../../../../middleware/checkRoleForCreation");
// --- Public Router ---

const publicRouter = express.Router({ mergeParams: true });
publicRouter.post(
  '/create',
  userRules.rule('create'),
  Validation.validate,
  commonController.create
);
publicRouter.post('/login', userRules.rule('login'), Validation.validate, commonController.login);
publicRouter.post(
  '/forgotPassword',
  userRules.rule('forgotPassword'),
  commonController.forgotPassword
);
publicRouter.post(
  '/updatePassword',
  userRules.rule('updatePassword'),
  commonController.updatePassword
);
publicRouter.post('/getAllUsers', commonController.getAllUsers);
publicRouter.post('/getUserTotalCount', commonController.getUserTotalCount);
publicRouter.post('/Refresh-Token', commonController.refreshToken);
publicRouter.post('/subscribe', subController.createSubscriptionIntent);

// --- Protected Router ---
const protectedRouter = express.Router({ mergeParams: true });
protectedRouter.post('/update', commonController.update);
protectedRouter.post(
  '/updateEmail',
  userRules.rule('updateEmail', 'generateAccessToken'),
  commonController.updateEmail
);
protectedRouter.post('/get-user', commonController.getUser);

protectedRouter.post('/soft-delete', commonController.softDeleteUser);

module.exports = {
  public: publicRouter,
  protected: protectedRouter,
};
