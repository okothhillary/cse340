const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

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
  let register = utilities.buildRegisterView({})

  res.render("account/register", {
    title: "Register",
    nav,
    register,
    errors: null,
  })
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered, ${account_firstname}. Please log in.`
    );

    let login = utilities.buildLoginView();

    res.status(201).render("account/login", {
      title: "Login",
      nav,
      login,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    
    let register = utilities.buildRegisterView({
      account_firstname,
      account_lastname,
      account_email,
    });

    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      register,
      errors: "Registration failed. Please try again."
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }
