const errorController = {}

/**
 * Throw an intentional 500 error
 */
errorController.throwError = async function (req, res, next) {
  throw new Error("Intentional 500 error to fulfill the demonstration requirement")
}

module.exports = errorController
