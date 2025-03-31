require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


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

async function buildAccountView(req, res, next) {
  let nav = await utilities.getNav();

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    messages: req.flash(),
    errors: null
  });
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error.message)
    req.flash("notice", "An error occurred during login. Please try again.")
    return res.redirect("/account/login")
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountView }
