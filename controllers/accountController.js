const utilities = require("../utilities/")

//Login view
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let login = utilities.buildLoginView()
  res.render("account/login", {
    title: "Login",
    nav,
    login,
  })
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  let register = utilities.buildRegisterView()
  res.render("account/register", {
    title: "Register",
    nav,
    register,
    errors: null,
  })
}

module.exports = { buildLogin, buildRegister }
