const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

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

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered, ${account_firstname}. Please log in.`
    )

    let login = utilities.buildLoginView();

    res.status(201).render("account/login", {
      title: "Login",
      nav,
      login,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }
