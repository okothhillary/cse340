const { body, validationResult } = require("express-validator");
const validate = {};

// Validation for Adding Classification

validate.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must contain only letters and numbers, with no spaces or special characters.")
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const utilities = require(".");
    let nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(), // You can choose to pass the entire array if desired
      classification_name: req.body.classification_name // Sticky value
    });
  }
  next();
};


// Validation for Adding Inventor
validate.addInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle year.")
      .matches(/^\d{4}$/)
      .withMessage("Vehicle year must be 4 digits."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide the image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide the thumbnail path."),
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle price.")
      .isNumeric()
      .withMessage("Price must be a number."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle mileage.")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a valid number."),
    body("inv_colour")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle colour."),
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please choose a classification.")
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const utilities = require(".");
    let nav = await utilities.getNav();
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      errors: errors.array(),
      // Sticky form fields
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_colour: req.body.inv_colour,
      classification_id: req.body.classification_id,
    });
  }
  next();
}

module.exports = validate;
