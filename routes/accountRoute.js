const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;