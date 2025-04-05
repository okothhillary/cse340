const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists.rows.length > 0) {
                    throw new Error("Email exists. Please log in or use different email");

                }
            }),

        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required."),

        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

validate.passwordRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

validate.checkUpdatePassword = async (req, res, next) => {
    const { account_password, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const accountData = await accountModel.getAccountById(account_id)
        res.locals.accountData = accountData 
        res.render("account/update", {
            errors,
            title: "Update Password",
            nav,
        })
        return
    }
    next()
}

/*  **********************************
  *  Update Account Data Validation Rules
  * ********************************* */
validate.updateRules = () => {
    return [
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                const account_id = parseInt(req.body.account_id);
                const emailResult = await accountModel.checkExistingEmail(account_email);
                if (emailResult.rows.length > 0) {
                    const existingAccountId = emailResult.rows[0].account_id;
                    if (existingAccountId !== account_id) {
                        throw new Error("Email exists. Please log in or use a different email");
                    }
                }
            }),


        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isString(),

        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isString(),
    ]
}

validate.checkUpdateData = async (req, res, next) => {
    const { account_email, account_firstname, account_lastname } = req.body
    let errors = []
    //  calls the express-validator "validationResult" function and sends the request object (containing all the incoming data) as a parameter. 
    // All errors, if any, will be stored into the errors array.
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/account-management", {
            errors,
            title: "Done",
            nav,
            account_email,
            account_firstname, 
            account_lastname
        })
        return
    }
    next()
}


module.exports = validate