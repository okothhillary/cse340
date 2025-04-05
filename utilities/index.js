require("dotenv").config()
const jwt = require("jsonwebtoken");
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => {
      grid += '<li>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + 'details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid += vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid += '<p class="notice">No vehicles available at the moment.</p>';
  }
  return grid;
}

// vehicle details
Util.buildVehicleDetail = function (vehicle) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price);

  const formattedMiles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles);

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
    `;
  return detail;
};

Util.buildItemDetailView = async function (data) {
  let card = ''
  if (data) {
    // The make, model, year and price should be prominent in the view. All descriptive data must also be displayed.
    card =
      `
      <div class="inv">
       <img id="inv-img" src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
       <div id="inv-display-detail">
        <h2>${data.inv_make} ${data.inv_model}</h2>
        <p id="inv-year"><strong>Year:</strong> ${data.inv_year}</p>
        <p id="inv-miles"><strong>Miles:</strong> ${formatToMileage(data.inv_miles)}</p>
        <p id="inv-color"><strong>Color:</strong> ${data.inv_colour}</p>
        <p id="inv-price"><strong>Price:</strong> ${formatToDolar(parseInt(data.inv_price))}</p>
        <p id="inv-description">${data.inv_description}</p>
       </div>
      </div>
      `
  } else {
    card = '<p class="notice">Sorry, no matching vehicle could be found.</p>'
  }
  return card
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

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}
/* ****************************************
 * Middleware For Handling Errors
 * **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check if the user is logged in (JWT token)
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData) {
      if (err) {
        req.flash("notice", "Please log in");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      console.log("accountData:", res.locals.accountData)
      res.locals.loggedin = 1;
      next();
    });
  } else {
    next();
  }
};

/* ****************************************
 * Middleware to check if the user is logged in (Check Login)
 **************************************** */
Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.accountData = decoded;
      res.locals.loggedin = true;
    } catch (err) {
      res.locals.accountData = null;
      res.locals.loggedin = false;
    }
  } else {
    res.locals.accountData = null;
    res.locals.loggedin = false;
  }
  next();
};

/* ****************************************
 * Middleware to check if the user has required role (checkRole)
 **************************************** */
Util.checkRole = (requiredRoles = []) => {
  return (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
      req.flash("notice", "You must be logged in to access this page.");
      return res.redirect("/account/login");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        req.flash("notice", "Invalid or expired token. Please log in again.");
        return res.redirect("/account/login");
      }

      // Check if the user has the required role
      if (!requiredRoles.includes(decodedToken.role)) {
        req.flash("notice", "You do not have permission to access that page.");
        return res.redirect("/");
      }

      // Attach user data to request object
      req.user = decodedToken;
      next();
    });
  };
};

module.exports = Util;
