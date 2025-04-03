const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}


/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildInventoryItem = async function (req, res, next) {
  try {
    const item_id = parseInt(req.params.itemId)
    // the below returns the data.rows
    const item = await invModel.getInventoryItemDetail(item_id)
    // build page for itemId
    const card = await utilities.buildItemDetailView(item)
    // maintain the same nav though we need to make another call to db
    let nav = await utilities.getNav()
    const className = item.inv_make + " " + item.inv_model
    res.render("./inventory/item", {
      title: className + " vehicle",
      nav,
      card,
      errors: null,
    })
  } catch (error) {
    console.error("Error ", error.message)
    next(error)
  }
}

invCont.addNewInventory = async function (req, res, next) {
  let nav = await utilities.getNav();

  try {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_colour, classification_id } = req.body;

    await invModel.insertNewInventory(
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
      inv_price, inv_miles, inv_colour, classification_id
    );

    req.flash("success", `Great! Inventory for ${inv_make} ${inv_model} created!`);
    res.redirect("/inv/management");
  } catch (error) {
    console.error("❌ Error adding inventory:", error.message);

    let classificationList = await utilities.buildClassificationList()

    req.flash("notice", "Sorry, there was an error processing the new inventory.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make: req.body.inv_make || "",
      inv_model: req.body.inv_model || "",
      inv_year: req.body.inv_year || "",
      inv_description: req.body.inv_description || "",
      inv_image: req.body.inv_image || "/images/no-image-available.png",
      inv_thumbnail: req.body.inv_thumbnail || "/images/no-image-available-tn.png",
      inv_price: req.body.inv_price || "",
      inv_miles: req.body.inv_miles || "",
      inv_colour: req.body.inv_colour || "",
      errors: [{ msg: error.message }],
    });
  }
};


invCont.addNewClassification = async function (req, res, next) {

  try {
    const { classification_name } = req.body
    const data = await invModel.insertClassification(classification_name)
    const className = data.rows[0].classification_name

    nav = await utilities.getNav()

    req.flash("success", 'Great! ' + className + ' classification created!')
    res.render("./inventory/management", {
      title: "Management",
      // title: className + " vehicles",
      nav,
      errors: null,
    })
  } catch (error) {
    let nav = await utilities.getNav()

    req.flash("notice", 'Sorry, there was an error processing the new classification.')
    res.status(500).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Management",
      nav,
      classificationSelect,
      errors: null,
    })
  } catch (error) {
    console.error("Error ", error.message)
    next(error)
  }
}

invCont.buildClassificationForm = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  } catch (error) {
    console.error("Error ", error.message)
    next(error)
  }
}

invCont.buildInventoryForm = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    console.log('Inventory ID:', req.params.inventory_id)

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/no-image-available.png",
      inv_thumbnail: "/images/no-image-available-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_colour: "",
      errors: null
    });
  } catch (error) {
    console.error("❌ Error in buildInventoryForm:", error.message);
    next(error);
  }
}


invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_colour,
      classification_id,
    } = req.body

    const updateResult = await invModel.updateInventoryItem(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_colour,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the insert failed.")
      res.status(501).render("inventory/edit", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_colour,
        classification_id
      })
    }
  }
  catch (error) {
    console.error("❌ Error updating inventory:", error.message);
    next(error);
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build inventory edit form view
 * ************************** */

invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inventory_id = parseInt(req.params.inventory_id);
    let nav = await utilities.getNav();

    const itemData = await invModel.getInventoryById(inventory_id);
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      classification_id: itemData.classification_id,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_colour: itemData.inv_colour,
      errors: null,
    });
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the inventory item.");
    res.status(500).render("./inventory/edit", {
      title: "Error Editing Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(),
      errors: [{ msg: error.message }],
    });
  }
};

//delete view
invCont.deleteItemView = async function (req, res, next) {
  try {
    const inventory_id = parseInt(req.params.inventory_id);
    let nav = await utilities.getNav();

    const itemData = await invModel.getInventoryById(inventory_id);
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      classificationList,
      classification_id: itemData.classification_id,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_colour: itemData.inv_colour,
      errors: null,
    });
  } catch (error) {
    req.flash("notice", "Sorry, there was an error in deleting the inventory item.");
    res.status(500).render("./inventory/delete-confirm", {
      title: "Error Editing Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(),
      errors: [{ msg: error.message }],
    });
  }
};

//deleting item

invCont.deleteItemHandler = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    const {inv_id} = req.body

    const updateResult = await invModel.deleteItem(inv_id )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully deleted.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, deleting failed.")
      res.status(501).render("inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_price
      })
    }
  }
  catch (error) {
    console.error("❌ Error deleting inventory:", error.message);
    next(error);
  }
};



module.exports = invCont