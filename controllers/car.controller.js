const pool = require("../conex");

async function saveInfoCart(id_product, id_user, quantity, created_at
) {
  const query =
   "INSERT INTO cart (id_product, id_user,quantity, created_at) VALUES($1, $2, $3, $4) ON CONFLICT (id_product, id_user) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity, updated_at = NOW() RETURNING *"
  const valores = [id_product, id_user, quantity, created_at];
  try {
    const res = await pool.query(query, valores);
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}



async function getInfoCart(user_id) {
  const query =
    "SELECT p.id_product, p.title_product, p.description_product, p.price_product, p.thumbnail_product, d.category_details, c.quantity FROM cart c INNER JOIN products p ON c.id_product = p.id_product INNER JOIN details d ON p.id_product= d.id_product WHERE c.id_user= $1"
  const valores = [user_id];
  try {
    const res = await pool.query(query, valores);
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function dropInfoCart(user_id , id_product) {
  const query =
    "DELETE FROM cart WHERE id_user = $1 AND id_product = $2";
  const valores = [user_id, id_product];
  try {
    const res = await pool.query(query, valores);
    return res.rowCount;
  } catch (err) {
    console.error(err);
    throw err;
  }
}


module.exports = {
  saveInfoCart, getInfoCart, dropInfoCart
};
