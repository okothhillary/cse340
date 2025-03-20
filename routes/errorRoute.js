const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")
const utilities = require("../utilities")

// to intentionally throw an error
router.get(
  "/throw", 
  utilities.handleErrors(errorController.throwError)
)

module.exports = router
