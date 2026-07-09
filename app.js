//modules
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const routerPay = require("./routes/pay.routes");
const app = express();

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

//import
const pool = require("./conex");
const {
  UserRoutes,
  Updatproducts,
  Postproducts,
  Deletproduct,
  Pathactive,
} = require("./controllers/user.controller");
const router = require("./routes/auth.routes");
const routerCar = require("./routes/car.routes");
const routerFav = require("./routes/fav.routes");

//callback
app.use("/pay", routerPay);
app.use("/auth", router);
app.use("/cart", routerCar);
app.use("/favorites", routerFav);
UserRoutes(app, pool);
Updatproducts(app, pool);
Postproducts(app, pool);
Deletproduct(app, pool);
Pathactive(app, pool);

app.listen(3006, () => {
  console.log("Server on port 3006");
});
