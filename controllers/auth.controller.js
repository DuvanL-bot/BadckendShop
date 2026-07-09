const pool = require("../conex");
const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Configurar el transportador de correo (crear la conexión con el servidor de correos)
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
  tls: {
    rejectUnauthorized: false,
  },
});

// Registrar usuario
async function guardarUsuario(nombre, email, password) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const query =
    "INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *";
  const valores = [nombre, email, passwordHash];
  try {
    const res = await pool.query(query, valores);
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Login
async function loginUsuario(email, password) {
  const query = "SELECT * FROM users WHERE email = $1";
  try {
    const res = await pool.query(query, [email]);
    const user = res.rows[0];

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) throw new Error("invalide data");

    const token = jwt.sign(
      { id_user: user.id_user, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return { token, role: user.role };
  } catch (err) {
    throw err;
  }
}

//Recover password
async function ForgetPassword(email) {
  try {
    const querySelect = "SELECT * FROM users WHERE email = $1";
    const res = await pool.query(querySelect, [email]);
    const user = res.rows[0];
    if (!user) {
      throw new Error("El correo no está registrado");
    }
    const accessToken = await oauth2Client.getAccessToken();
    console.log("servidor", accessToken);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const token = jwt.sign(
      { id_user: user.id_user, email: user.email },
      process.env.RESET_SECRET,
      { expiresIn: "15m" },
    );

    const expireDate = new Date(Date.now() + 15 * 60 * 1000);
    const queryUpdate =
      "UPDATE users SET token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING *";
    await pool.query(queryUpdate, [token, expireDate, email]);
    const resetLink = `http://localhost:5173/changes-password?token=${token}`;
    const rutaPlantilla = path.join(__dirname, "emailTemplate.html");
    let htmlContenido = await fs.readFile(rutaPlantilla, "utf8");
    htmlContenido = htmlContenido.replace("{{resetLink}}", resetLink);
    const mailOptions = {
      from: '"Soporte de tu Aplicación" <tu-correo@gmail.com>',
      to: email,
      subject: "Recuperación de Contraseña",
      html: htmlContenido,
    };
    await transporter.sendMail(mailOptions);
    return { message: `Correo de recuperación enviado ` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

//reset-token
async function resetTokenExpires(token, newpassword) {
  try {
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    const hashpassword = await bcrypt.hash(newpassword, 10);
    const querytoken = `Update users SET password= $1, token = Null, reset_token_expires = NULL WHERE id_user = $2 RETURNING *`;
    const Values = [hashpassword, decoded.id_user];
    const res = await pool.query(querytoken, Values);
    const user = res.rows[0];
    if (!user) {
      throw new Error("finished time ");
    }
    return { message: "Contraseña actualizada exitosamente" };
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      throw new Error("El tiempo del enlace ha expirado. Solicita uno nuevo.");
    }
    throw error;
  }
}

module.exports = {
  guardarUsuario,
  loginUsuario,
  ForgetPassword,
  resetTokenExpires,
};
