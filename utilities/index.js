const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  //console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + 'details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Ni kama gari zimeenda na Kairo. Iza!</p>'
  }
  return grid
}

//vehicle details

Util.buildVehicleDetail = function (vehicle) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(vehicle.inv_price)

  const formattedMiles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

  let detail = `
      <div class="vehicle-detail">
        <div>
          <img src="${vehicle.inv_image}" 
            alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </div>
        <div class="detail-info">
          <h2>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h2>
          <p><strong>Price:</strong> ${formattedPrice}</p>
          <p><strong>Mileage:</strong> ${formattedMiles} miles</p>
          <p><strong>Color:</strong> ${vehicle.inv_colour}</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
          <p><strong>Classification:</strong> ${vehicle.classification_name}</p>
        </div>
      </div>
    `
  return detail
}

//building login view

Util.buildLoginView = function () {
  return `
  <div class="login">
    <h2>About to Own a Car!</h2>
    <form action="/account/login" method="post">
      <label for="email">Email:</label>
      <input type="email" id="email" name="account_email" required>
      
      <label for="password">Password:</label>
      <input type="password" id="password" name="account_password" required>
      
      <button type="submit">Login</button>
    </form>
    <hr>
    <p>Don't have an account? <a href="/account/register">Register</a></p>
  </div>`;
}


Util.buildClassificationList = async function (selectedClassificationId = null) {
  let data = await invModel.getClassifications();
  
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  
  classificationList += "<option value=''>Choose a Classification</option>";
  
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    
    if (selectedClassificationId != null && row.classification_id == selectedClassificationId) {
      classificationList += " selected";
    }
    
    classificationList += `>${row.classification_name}</option>`;
  });
  
  classificationList += "</select>";
  return classificationList;
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util