const { Router } = require('express');
const {saveInfoFav,getInfoFav,dropInfoFav} = require('../controllers/fav.controller');
const { verificarToken } = require("../middleware/middlewares/auth.middleware");

const routerFav = Router();


//Favorite get 
routerFav.get("/", verificarToken, async (req, res) => {
  const id_user = req.user.id_user;
  try {
    const fav = await getInfoFav(id_user);
    res.json(fav );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//Favorite Post
routerFav.post("/", verificarToken, async (req, res) => {
  const id_user = req.user.id_user;
  const {id_product} = req.body;
  try {
    await saveInfoFav(id_product, id_user );
    res.json({ message: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//Favorite Delet
routerFav.delete("/:id_product",verificarToken, async (req, res) => {
  const id_user = req.user.id_user;
  const { id_product } = req.params;
  try {
    await dropInfoFav(id_user, id_product);
    res.json({ message: "Product removed from favorite" }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = routerFav;