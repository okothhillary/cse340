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
    })
}

invCont.buildByInvId = async function (req, res, next) {
    const inv_id = req.params.invId
    try {
      const vehicleData = await invModel.getVehicleByInvId(inv_id)
      if (!vehicleData) {
        return next({ status: 404, message: "Vehicle not found." })
      }
  
      let nav = await utilities.getNav()
      const vehicleDetail = utilities.buildVehicleDetail(vehicleData)
  
      return res.render("./vehicledetail/detail", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        vehicleDetail,
      })
    } catch (error) {
      console.error("buildByInvId error:", error)
      next(error)
    }
  }

module.exports = invCont