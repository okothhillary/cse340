const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view (Public)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build each item view (Public)
router.get("/detail/:itemId", utilities.handleErrors(invController.buildInventoryItem));

// Route to view management page (Restricted to Employee/Admin)
router.get(
    "/management",
    utilities.checkJWTToken,
    utilities.checkRole(["Employee", "Admin"]),
    utilities.handleErrors(invController.buildManagement)
  );
  
// Route to add classification (Restricted to Employee/Admin)
router.post("/classification", 
  utilities.checkRole(["Employee", "Admin"]),
  invValidate.addClassificationRules(), 
  invValidate.checkClassificationData, 
  utilities.handleErrors(invController.addNewClassification)
);

// Route to display add classification form (Restricted to Employee/Admin)
router.get("/add-classification", utilities.checkRole(["Employee", "Admin"]), utilities.handleErrors(invController.buildClassificationForm));

// Route to display add inventory form (Restricted to Employee/Admin)
router.get("/add-inventory", utilities.checkRole(["Employee", "Admin"]), utilities.handleErrors(invController.buildInventoryForm));

// Route to handle adding new inventory item (Restricted to Employee/Admin)
router.post("/add-inventory", 
  utilities.checkRole(["Employee", "Admin"]),
  invValidate.addInventoryRules(), 
  invValidate.checkInventoryData, 
  utilities.handleErrors(invController.addNewInventory)
);

// Route to get inventory JSON (Restricted to Employee/Admin)
router.get("/getInventory/:classification_id", utilities.checkRole(["Employee", "Admin"]), utilities.handleErrors(invController.getInventoryJSON));

// Route to display edit inventory view (Restricted to Employee/Admin)
router.get("/edit/:inventory_id", utilities.checkRole(["Employee", "Admin"]), utilities.handleErrors(invController.buildEditInventoryView));

// Route to handle updating an inventory item (Restricted to Employee/Admin)
router.post("/update/", 
  utilities.checkRole(["Employee", "Admin"]),
  invValidate.addInventoryRules(), 
  invValidate.checkUpdateData, 
  utilities.handleErrors(invController.updateInventory)
);

// Route to display delete inventory view (Restricted to Employee/Admin)
router.get("/delete/:inventory_id", utilities.checkRole(["Employee", "Admin"]), utilities.handleErrors(invController.deleteItemView));

// Route to handle deleting an inventory item (Restricted to Employee/Admin)
router.post("/delete/:inventory_id", utilities.checkRole(["Employee", "Admin"]), utilities.handleErrors(invController.deleteItemHandler));

module.exports = router;
