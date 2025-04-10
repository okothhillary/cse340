const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// Apply checkJWTToken globally for all routes that need account data
// It checks if the user is logged in and sets `accountData` in res.locals
router.use(utilities.checkJWTToken);

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Login post route
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Registration post route
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Account management view (requires login)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountView));
router.get('/update/:accountId', utilities.handleErrors(accountController.getUpdateAccountView));
router.post('/update', regValidate.updateRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccountView));
router.post('/password', regValidate.passwordRules(), regValidate.checkUpdatePassword, utilities.handleErrors(accountController.passwordUpdateHandler));

// Logout route
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

//Deleting Account
router.get(
  "/admin",
  utilities.handleErrors(accountController.buildAdminManagement)
);

router.post('/admin/:accountId',utilities.handleErrors(accountController.deleteAccount));

module.exports = router;
