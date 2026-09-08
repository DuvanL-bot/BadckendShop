<div align="center">

# 🛍️ E-Commerce API

### Backend REST para plataforma de comercio electrónico

Autenticación segura, catálogo de productos, carrito de compras y lista de favoritos — todo en una API ligera y escalable.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📖 Tabla de contenidos

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Modelo de datos](#-modelo-de-datos)
- [Roadmap](#-roadmap)
- [Autor](#-autor)

---

## 🚀 Sobre el proyecto

**E-Commerce API** es el motor backend de una tienda en línea. Expone una API RESTful encargada de todo lo que ocurre "detrás de cámaras": registro y autenticación de usuarios, gestión del catálogo de productos, carrito de compras, lista de deseos y recuperación de contraseña vía correo electrónico.

Fue diseñado pensando en la separación de responsabilidades: cada dominio (auth, productos, carrito, favoritos) vive en su propia capa de **rutas → controladores → base de datos**, lo que facilita mantenerlo y escalarlo.

---

## ✨ Características

- 🔐 **Autenticación JWT** — registro, login y sesiones protegidas por token.
- 📧 **Recuperación de contraseña** — flujo completo de "olvidé mi contraseña" vía Gmail (OAuth2 + Nodemailer).
- 📦 **CRUD de productos** — con soft delete (activar/desactivar) en lugar de borrado permanente.
- 🛒 **Carrito de compras** — añadir, consultar y eliminar productos del carrito.
- ❤️ **Lista de favoritos** — guarda y gestiona los productos preferidos de cada usuario.
- 🧩 **Detalles extendidos de producto** — categoría, marca, peso, garantía, envío y disponibilidad en una tabla relacionada.
- 🛡️ **Rutas protegidas** — middleware de verificación de token para operaciones sensibles.
- 🔄 **Transacciones SQL** — actualizaciones de producto usando `BEGIN`/`COMMIT`/`ROLLBACK` para garantizar consistencia.

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Base de datos | PostgreSQL (`pg`) |
| Autenticación | JSON Web Tokens (`jsonwebtoken`) |
| Hash de contraseñas | `bcryptjs` |
| Envío de correos | Nodemailer + Google OAuth2 |
| Logging HTTP | Morgan |
| CORS | `cors` |

---

## 🏗️ Arquitectura del proyecto

```
📦 ecommerce-backend
├── 📄 app.js                     # Punto de entrada — configura middlewares y monta rutas
├── 📄 conex.js                   # Conexión (pool) a PostgreSQL
│
├── 📂 routes/
│   ├── auth.routes.js            # /auth  → registro, login, recuperación de contraseña
│   ├── car.routes.js             # /cart  → carrito de compras
│   ├── fav.routes.js             # /favorites → lista de deseos
│   ├── routeGet.js               # GET   /products
│   ├── routPost.js               # POST  /products
│   ├── routPut.js                # PUT   /products/:id
│   ├── routDelte.js              # DELETE /products/:id (desactivación lógica)
│   └── routPath.js               # PATCH /products/:id/activate
│
├── 📂 controllers/
│   ├── auth.controller.js        # Lógica de registro, login y reseteo de contraseña
│   ├── car.controller.js         # Lógica del carrito
│   └── fav.controller.js         # Lógica de favoritos
│
└── 📂 middleware/
    └── auth.middleware.js        # verificarToken / soloAdmin
```

---

## ⚙️ Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# 2. Instala las dependencias
npm install

# 3. Configura tus variables de entorno (ver sección siguiente)
cp .env.example .env

# 4. Levanta el servidor
node app.js
```

El servidor arrancará en 👉 `http://localhost:3006`

---

## 🔑 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con lo siguiente:

```env
# Base de datos
PGHOST=localhost
PGPORT=5432
PGUSER=tu_usuario
PGPASSWORD=tu_password
PGDATABASE=ecommerce

# JWT
JWT_SECRET=tu_clave_secreta_jwt
RESET_SECRET=tu_clave_secreta_reset

# Correo (Gmail OAuth2)
EMAIL_USER=tu_correo@gmail.com
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
REFRESH_TOKEN=tu_refresh_token
```

> 💡 **Tip:** las credenciales de OAuth2 de Gmail se generan en [Google Cloud Console](https://console.cloud.google.com/) y se prueban con [OAuth Playground](https://developers.google.com/oauthplayground).

---

## 📡 Endpoints de la API

### 🔐 Auth — `/auth`

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| `POST` | `/auth/register` | Registra un nuevo usuario | ✅  |
| `POST` | `/auth/login` | Inicia sesión y devuelve un JWT | ✅  |
| `POST` | `/auth/ForgetPassword` | Envía correo de recuperación | ✅  |
| `POST` | `/auth/reset-password` | Restablece la contraseña con token | ✅  |

### 📦 Productos — `/products`

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| `GET` | `/products` | Lista todos los productos activos | ❌ |
| `GET` | `/products/:id` | Obtiene el detalle de un producto | ❌ |
| `POST` | `/products` | Crea un producto nuevo | ❌ |
| `PUT` | `/products/:id` | Actualiza un producto existente | ❌ |
| `DELETE` | `/products/:id` | Desactiva un producto (soft delete) | ❌ |
| `PATCH` | `/products/:id/activate` | Reactiva un producto | ❌ |

### 🛒 Carrito — `/cart`

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| `GET` | `/cart` | Obtiene el carrito del usuario autenticado | ✅ |
| `POST` | `/cart` | Agrega un producto al carrito | ✅ |
| `DELETE` | `/cart/:id_product` | Elimina un producto del carrito | ✅ |

### ❤️ Favoritos — `/favorites`

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| `GET` | `/favorites` | Obtiene los favoritos del usuario | ✅ |
| `POST` | `/favorites` | Agrega un producto a favoritos | ✅ |
| `DELETE` | `/favorites/:id_product` | Elimina un producto de favoritos | ✅ |

> 🔒 Las rutas **protegidas** requieren un header `Authorization: Bearer <token>`.

---

## 🗃️ Modelo de datos

```
users
 ├─ id_user
 ├─ username
 ├─ email
 ├─ password (hash)
 ├─ role
 ├─ token
 └─ reset_token_expires

products                    details
 ├─ id_product   ───────┐    ├─ id_product (FK)
 ├─ title_product        └──▶├─ category_details
 ├─ price_product             ├─ brand_details
 ├─ stock_product              ├─ weight_details
 ├─ description_product         ├─ warrantyinformation_details
 ├─ rating_product               ├─ shippinginformation_details
 ├─ thumbnail_product             └─ availabilitystatus_details
 ├─ active
 ├─ activated_at
 └─ deactivated_at

cart                        favorites
 ├─ cart_id                  ├─ id_user (FK)
 ├─ id_user (FK)              └─ id_product (FK)
 ├─ id_product (FK)
 ├─ quantity
 └─ created_at
```

---

## 🧭 Roadmap

- [ ] Paginación y filtros en `GET /products`
- [ ] Validación de payloads con `Zod` o `Joi`
- [ ] Documentación interactiva con Swagger/OpenAPI
- [ ] Tests automatizados (Jest + Supertest)
- [ ] Manejo de cantidades y actualización en el carrito (`PATCH /cart/:id_product`)
- [ ] Sistema de órdenes / checkout
- [ ] Dockerización del proyecto

---

## 👤 Autor

Hecho con dedicación como parte de un proyecto de e-commerce full-stack.

Si este proyecto te resulta útil, ¡considera dejar una ⭐ en el repositorio!

</div>
