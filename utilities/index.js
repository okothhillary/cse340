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
};

Util.buildRegisterView = function (locals = {}) {
  return `
  <div class="register">
    <h2>Closer to Owning A Car!</h2>
    <form action="/account/register" method="post">
      <label for="first_name">First Name:</label>
      <input type="text" id="first_name" name="account_firstname" required value="${locals.account_firstname || ''}">
      
      <label for="last_name">Last Name:</label>
      <input type="text" id="last_name" name="account_lastname" required value="${locals.account_lastname || ''}">
      
      <label for="email">Email:</label>
      <input type="email" id="email" name="account_email" required placeholder="Enter a valid email address" value="${locals.account_email || ''}">

      <div>
        <label for="accountPassword">Password:</label> 
        <span>Passwords must be at least 12 characters and contain at least 1 number, 1 capital letter and 1 special character</span>
        <input type="password" id="password" name="account_password" required pattern="^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\\s).{12,}$">
      </div>
      
      <button type="submit">Register</button>
    </form>
    <hr>
    <p>Already have an account? <a href="/account/login">Login</a></p>
  </div>
  `;
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)



module.exports = Util