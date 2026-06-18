const { Router } = require("express");
const { saveInfoCart,dropInfoCart,getInfoCart } = require("../controllers/car.controller");
const { verificarToken } = require("../middleware/middlewares/auth.middleware");

const routerCar = Router();

//Cart get
routerCar.get("/", verificarToken, async (req, res) => {
  const id_user = req.user.id_user
  try {
    const cart = await getInfoCart(id_user);
    res.json( cart );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Cart Post
routerCar.post("/", verificarToken, async (req, res) => {
  const id_user = req.user.id_user
  const {id_product, quantity} = req.body;
  try {
    await saveInfoCart(id_product, id_user, quantity, new Date());
    res.json({ message: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Cart Delet
routerCar.delete("/:id_product", verificarToken, async (req, res) => {
  const id_user = req.user.id_user
  const {id_product } = req.params;
  try {
    await dropInfoCart(id_user, id_product);
    res.json({ message: "Product removed from cart" }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = routerCar;
