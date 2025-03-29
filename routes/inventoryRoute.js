const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to build management view (currently through http://localhost:5500/inv/)
router.get(
    "/",
    utilities.handleErrors(invController.buildManagementView)
)

// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build vehicle detail view
router.get(
    "/detail/:invId",
    utilities.handleErrors(invController.buildByInvId)
)

// Route to display the add-classification view
router.get(
    "/add-classification",
    utilities.handleErrors(invController.buildAddClassificationView)
)

// Route to process the add-classification form submission with validation
router.post(
    "/add-classification",
    invValidate.addClassificationRules,
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to process the add-inventory form submission with validation
router.post(
    "/add-inventory",
    invValidate.addInventoryRules,
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddInventoryView)
)

module.exports = router;
