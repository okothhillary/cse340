require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Login view
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

  let hashedPassword
  try {
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
  let login = utilities.buildLoginView()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    let login = utilities.buildLoginView();
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      login,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      const accessToken = jwt.sign(
        {
          id: accountData.account_id,
          first_name: accountData.account_firstname,
          last_name: accountData.account_lastname,
          email: accountData.account_email,
          role: accountData.account_type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      )
      console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        login,
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

async function getUpdateAccountView(req, res, next) {
  let nav = await utilities.getNav()
  try {
    const account_id = parseInt(req.params.accountId)
    let accountData = await accountModel.getAccountById(account_id)
    res.locals.accountData = accountData

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      accountData,
      errors: null
    })
  } catch (error) {
    next(error)
  }

}


async function updateAccountView(req, res, next) {
  let nav = await utilities.getNav()
  const {
      account_firstname,
      account_lastname,
      account_email,
      account_id
  } = req.body

  console.log("data: ", {account_firstname, account_lastname, account_email, account_id})

  const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
  )
  console.log(updateResult)

  if (updateResult) {
    
      res.locals.accountData = updateResult
      req.flash("notice", `Information for ${updateResult.account_firstname + ' ' + updateResult.account_lastname} was successfully updated.`)
      res.redirect("/account/")
  } else {
      const accountData = await accountModel.getAccountByEmail(account_email)
      if (!accountData) {
          req.flash("notice", "Sorry, the updating your account failed.")
          res.status(500).render("account/login", {
              title: "Update Account",
              nav,
              
              errors: null,
              account_email,
          })
          return
      }
  }
}


async function passwordUpdateHandler(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  let accountData = await accountModel.getAccountById(account_id)

  // Hash the password before storing
  let hashedPassword = ''
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    res.locals.accountData = accountData
    req.flash("notice", 'Sorry, there was an error updating the password.')
    return res.status(500).render("account/account-management", {
      title: "Update Information",
      nav,
      errors: null,
    })
  }

  try {
    accountData = await accountModel.updatePassword(account_id, hashedPassword)
    console.log("account", accountData)
  } catch (error) {
    console.error('Error updating password:', error)
  }

  res.locals.accountData = accountData
  if (accountData) {
    req.flash("notice", `Your password has been changed`)
    return res.redirect("/account/") 
  } else {
    req.flash("notice", "Sorry, the update of the password failed.")
    return res.status(501).render("account/account-management", {
      title: "Update Information",
      nav
    })
  }
}

async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, accountLogout, buildAccountView, passwordUpdateHandler, updateAccountView, getUpdateAccountView }
