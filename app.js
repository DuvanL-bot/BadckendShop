//modules
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

//milldeware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

//import
const pool = require('./conex');
const routeshome = require('./routes/routeGet');
const putproducts = require('./routes/routPut');
const postproducts = require('./routes/routPost');
const deletproduct = require('./routes/routDelte');
const pathactive = require ('./routes/routPath');
const router = require ('./routes/auth.routes');
const routerCar = require("./routes/car.routes");
const routerFav = require("./routes/fav.routes");

//callback
app.use('/auth', router)
app.use('/cart',routerCar);
app.use('/favorites',routerFav);
routeshome(app,pool);
putproducts(app,pool);
postproducts(app,pool);
deletproduct(app,pool);
pathactive(app,pool);

//local Store
app.listen(3006, () => {
    console.log('Server on port 3006');
});