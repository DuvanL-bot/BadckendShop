const { Router } = require("express");
const { verificarToken } = require("../middleware/middlewares/auth.middleware");
const {cancelOrder,saveInfoOrder,order,payOrder} = require("../controllers/pay.controller")
const routerPay = Router();

routerPay.get("/", verificarToken, async (req, res) => {
  const id_user = req.user.id_user;
  try {
    const pay = await order(id_user);
    res.json(pay);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routerPay.get("/cart", verificarToken, async (req, res) => {
  const id_user = req.user.id_user
  const {total_amount,currency,status} = req.body;
  try {
    await saveInfoOrder(total_amount, id_user, currency, status, new Date());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routerPay.delete("/chekaut",verificarToken, async(req,res)=>{
    const id_user = req.user.id_user
      try {
    await cancelOrder(id_user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routerPay.post("/chekaut",verificarToken, async(req,res)=>{
  const id_user =req.user.id_user
  const{payment_method, stripe_id} = req.body;
    try {
    await payOrder(id_user,payment_method,stripe_id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = routerPay;