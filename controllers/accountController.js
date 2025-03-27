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

  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  })
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname: "",
      account_lastname: "",
      account_email: "",
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
    
   
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: "Registration failed. Please try again.",
      account_firstname: "",
      account_lastname: "",
      account_email: "",
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }
