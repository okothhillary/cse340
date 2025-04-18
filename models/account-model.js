const pool = require("../database")

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    return await pool.query(sql, [account_email])
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ******************************/
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    );
    console.log("Account info data:", result.rows[0]); // Log account data for debugging
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving account:", error);
    throw new Error("No matching email found");
  }
}

async function updateAccount(account_firstname,
  account_lastname,
  account_email,
  account_id) {
  try {
    const data = await pool.query(
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *",
      [account_firstname, account_lastname, account_email, account_id]
    )
    return data.rows[0]

  } catch (error) {
    console.error("model error: " + error)
  }
}

async function updatePassword(account_id, account_password) {
  try {
    const data = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *",
      [account_password, account_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function getAccountById(account_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM account WHERE account_id = $1",
      [account_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("account model error " + error)
  }
}

async function deleteAccount(account_id) {
  try {
    const sql = "DELETE FROM account WHERE account_id = $1 RETURNING *"
    const data = await pool.query(sql, [account_id])
    return data.rows[0]
  } catch (error) {
    console.error(error.message)
    return error.message
  }
}

async function getAllAccounts() {
  try {
    const sql = "SELECT * FROM account ORDER BY account_firstname ASC;"
    const data = await pool.query(sql)
    return data.rows
  } catch (err) {

  }
}


module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getAllAccounts, deleteAccount };