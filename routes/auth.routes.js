const { Router } = require('express');
const { guardarUsuario, loginUsuario, ForgetPassword, resetTokenExpires } = require('../controllers/auth.controller');
const { TokenExpiredError } = require('jsonwebtoken');

const router = Router();

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const usuario = await guardarUsuario(name, email, password);
    res.json({ message: 'Usuario creado', usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const resultado = await loginUsuario(email, password);
    res.json(resultado); // { token, role }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

//Forget
router.post('/ForgetPassword', async(req, res)=>{
  const {email} = req.body;
  if (!email) {
    return res.status(400).json({success: false, message: 'Email is requiered'})
  }

  try{
    const response = await ForgetPassword (email);
    await res.status(200).json(response)
  } catch (err){
    res.status(401).json({error: err.message})
  }
});

//Rest-Password
router.post(`/reset-password`, async(req,res)=>{
  const {token, newPassword} = req.body;
  if (!token ||!newPassword) {
    return res.status(400).json({success: false, message: 'Not found'})
  }
  try {
const response = await resetTokenExpires(token, newPassword);

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({error: err.message})
  }
});

module.exports = router;