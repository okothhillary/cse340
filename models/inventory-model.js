const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Insert a new  classification
 * ************************** */
async function insertClassification(classification_name) {
  const query = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
  return await pool.query(query, [classification_name])
}

/* ***************************
 *  Insert a new inventory
 * ************************** */
async function insertNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_colour, classification_id) {
  const query = "INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_colour, classification_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *"
  return await pool.query(query, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_colour, classification_id])
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryById(inventory_id) {
  try {
    const query = `
      SELECT 
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_description,
        i.inv_image,
        i.inv_thumbnail,
        i.inv_price,
        i.inv_miles,
        i.inv_colour,
        i.classification_id,
        c.classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1
    `;
    const data = await pool.query(query, [inventory_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryById error: " + error);
  }
}


async function updateInventoryItem(

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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4,
          inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8,
          inv_colour = $9, classification_id = $10
      WHERE inv_id = $11
      RETURNING *;
    `;

    const data = await pool.query(sql, [
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
      inv_id
    ]);

    return data.rows[0];
  } catch (error) {
    console.error("❌ Error updating inventory item:", error.message);
    throw error;
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById, insertClassification, insertNewInventory, updateInventoryItem };