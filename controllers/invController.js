const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId;
  try {
    const vehicleData = await invModel.getVehicleByInvId(inv_id);
    if (!vehicleData) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    let nav = await utilities.getNav();
    const vehicleDetail = utilities.buildVehicleDetail(vehicleData);

    return res.render("./vehicledetail/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleDetail,
    });
  } catch (error) {
    console.error("buildByInvId error:", error);
    next(error);
  }
};

invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
};

invCont.addClassification = async function (req, res, next) {
  try {
    console.log(req.body);
    let nav = await utilities.getNav();
    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("notice", "Classification added successfully.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add classification.");
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: "Failed to add classification. Please try again.",
        classification_name
      });
    }
  } catch (error) {
    next(error);
  }
}

invCont.addInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_colour,
      classification_id,
    } = req.body;

    // Build a new item object from the form data.
    const newItem = {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_colour,
      classification_id,
    };

    // model function to insert new inventory item
    const result = await invModel.addInventory(newItem);

    if (result) {
      req.flash("notice", "Inventory item added successfully.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Ni kama gari zimeenda na Kairo.");
      res.status(501).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        errors: "Failed to add inventory item. Please try again.",
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_colour,
        classification_id,
      });
    }
  } catch (error) {
    next(error);
  }
}

invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Management Dashboard",
      nav,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      // Sticky fields – default empty values:
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_colour: "",
      classification_id: ""
    });
  } catch (error) {
    next(error);
  }
}

module.exports = invCont;
