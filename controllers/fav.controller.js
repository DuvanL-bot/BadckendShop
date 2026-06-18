const pool = require("../conex");

async function saveInfoFav(id_product, id_user) {
  const query =
    "INSERT INTO favorites (id_product, id_user ) VALUES($1, $2) RETURNING *";
  const valores = [id_product, id_user];
  try {
    const res = await pool.query(query, valores);
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getInfoFav(id_user) {
  const query =
    "SELECT p.id_product, p.title_product, p.description_product, p.price_product, p.thumbnail_product, d.category_details FROM favorites f INNER JOIN products p ON f.id_product = p.id_product INNER JOIN details d ON p.id_product= d.id_product WHERE f.id_user= $1";
  const valores = [id_user];
  try {
    const res = await pool.query(query, valores);
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function dropInfoFav(user_id, id_product) {
  const query = "DELETE FROM favorites WHERE id_user = $1 AND id_product = $2";
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
  saveInfoFav,
  getInfoFav,
  dropInfoFav,
};
