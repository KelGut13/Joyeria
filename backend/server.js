import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middlewares/verifyToken.js";
dotenv.config();

console.log("🚀 Ejecutando server.js correcto...");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware CORS
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Para preflight

app.use(express.json());

// MySQL Pool
const db = mysql.createPool({
  host: 'srv1009.hstgr.io',
  user: "u465901502_admin",
  password: "@UTequipo2",
  database: "u465901502_joyeria",
  port: 3306,
  connectionLimit: 10
});

db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Error conectando con MySQL:", err);
  } else {
    console.log("✅ Conectado correctamente a MySQL");
  }
});

// Rutas
app.get("/api/productos", (req, res) => {
  const query = "SELECT ID_producto, nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria FROM productos WHERE activo = 1";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener productos:", err);
      res.status(500).json({ error: "Error al obtener productos" });
    } else {
      res.json(results);
    }
  });
});

app.get("/api/productos/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT ID_producto, nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria FROM productos WHERE activo = 1 AND ID_producto = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener producto:", err);
      res.status(500).json({ error: "Error al obtener producto" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
    } else {
      res.json(results[0]);
    }
  });
});

app.post("/api/contacto", (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.CORREO_ORIGEN,
      pass: process.env.CORREO_PASSWORD,
    },
  });

  transporter.sendMail({
    from: `"${nombre}" <${correo}>`,
    to: process.env.CORREO_DESTINO,
    subject: `Formulario Web: ${asunto}`,
    html: `
      <h2>Nuevo mensaje desde el formulario de contacto</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${correo}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>
    `,
  }, (error, info) => {
    if (error) {
      console.error("❌ Error al enviar el correo:", error);
      res.status(500).json({ error: "Error al enviar el correo." });
    } else {
      res.status(200).json({ message: "Correo enviado correctamente." });
    }
  });
});

app.post("/api/crear-cuenta", async (req, res) => {
  const { nombre, primer_apellido, segundo_apellido, email, password, telefono } = req.body;

  if (!nombre || !primer_apellido || !email || !password || !telefono) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (nombre, primer_apellido, segundo_apellido, email, password, telefono)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [nombre, primer_apellido, segundo_apellido, email, hashedPassword, telefono],
      (err, result) => {
        if (err) {
          console.error("❌ Error al crear usuario:", err);
          return res.status(500).json({ error: "Error al crear usuario." });
        }
        res.status(201).json({ message: "Usuario creado correctamente." });
      }
    );
  } catch (error) {
    console.error("❌ Error general:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API funciona correctamente" });
});

app.get("/", (req, res) => {
  res.send("API Joyeria backend corriendo");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  const query = `SELECT * FROM usuarios WHERE email = ? LIMIT 1`;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("❌ Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    // 🔐 GENERAR JWT
    const token = jwt.sign(
      { id: user.ID_usuario, rol: user.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ✅ Enviar token al frontend
    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id: user.ID_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.id_rol
      }
    });
  });
});

app.post("/api/pedidos", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { productos, total, direccionEnvio } = req.body;

  if (!productos || productos.length === 0 || !total || !direccionEnvio) {
    return res.status(400).json({ error: "Datos incompletos para crear el pedido." });
  }

  const queryPedido = `
    INSERT INTO pedidos (ID_usuario, fecha, total, estado, ID_direccion)
    VALUES (?, NOW(), ?, 'pendiente', ?)
  `;

  db.query(queryPedido, [userId, total, direccionEnvio], (err, result) => {
    if (err) {
      console.error("❌ Error al crear pedido:", err);
      return res.status(500).json({ error: "Error al crear el pedido." });
    }

    const pedidoId = result.insertId;

    const queryDetalle = `
      INSERT INTO detalle_pedido (ID_pedido, ID_producto, cantidad, precio_unitario)
      VALUES ?
    `;

    const valoresDetalle = productos.map(prod => [
      pedidoId,
      prod.id_producto,
      prod.cantidad,
      prod.precio
    ]);

    db.query(queryDetalle, [valoresDetalle], (err2) => {
      if (err2) {
        console.error("❌ Error al guardar detalles del pedido:", err2);
        return res.status(500).json({ error: "Error al guardar productos del pedido." });
      }

      res.status(201).json({ message: "Pedido creado exitosamente", pedidoId });
    });
  });
});