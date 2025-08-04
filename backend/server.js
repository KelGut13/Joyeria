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
      { expiresIn: "24h" } // Extender la duración del token
    );

    // ✅ Enviar token al frontend con todos los datos del usuario
    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id: user.ID_usuario,
        nombre: user.nombre,
        primer_apellido: user.primer_apellido,
        segundo_apellido: user.segundo_apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.id_rol
      }
    });
  });
});

app.post("/api/pedidos", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { productos, total, subtotal, costoEnvio, descuento, direccionEnvio, metodoPago } = req.body;

  if (!productos || productos.length === 0 || !total || !direccionEnvio || !metodoPago) {
    return res.status(400).json({ error: "Datos incompletos para crear el pedido." });
  }

  // Iniciar transacción
  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Error al iniciar transacción:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    // Crear el pedido
    const queryPedido = `
      INSERT INTO pedidos (ID_usuario, fecha, total, estado, ID_direccion)
      VALUES (?, NOW(), ?, 'pendiente', ?)
    `;

    db.query(queryPedido, [userId, total, direccionEnvio], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("❌ Error al crear pedido:", err);
          res.status(500).json({ error: "Error al crear el pedido." });
        });
      }

      const pedidoId = result.insertId;

      // Insertar detalles del pedido
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
          return db.rollback(() => {
            console.error("❌ Error al guardar detalles del pedido:", err2);
            res.status(500).json({ error: "Error al guardar productos del pedido." });
          });
        }

        // Actualizar stock de productos
        const updateStockPromises = productos.map(prod => {
          return new Promise((resolve, reject) => {
            const updateQuery = `
              UPDATE productos 
              SET stock = stock - ? 
              WHERE ID_producto = ? AND stock >= ?
            `;
            db.query(updateQuery, [prod.cantidad, prod.id_producto, prod.cantidad], (err, result) => {
              if (err) reject(err);
              else if (result.affectedRows === 0) reject(new Error(`Stock insuficiente para producto ${prod.id_producto}`));
              else resolve(result);
            });
          });
        });

        Promise.all(updateStockPromises)
          .then(() => {
            // Confirmar transacción
            db.commit(async (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Error al confirmar transacción:", err);
                  res.status(500).json({ error: "Error al procesar el pedido." });
                });
              }

              console.log(`✅ Pedido ${pedidoId} creado exitosamente`);
              
              // Enviar email de confirmación
              const usuario = {
                nombre: req.user.nombre || 'Cliente',
                email: req.user.email
              };
              
              enviarEmailConfirmacionPedido(pedidoId, usuario, total, productos);

              res.status(201).json({ 
                message: "Pedido creado exitosamente", 
                pedidoId,
                total,
                metodoPago
              });
            });
          })
          .catch((error) => {
            db.rollback(() => {
              console.error("❌ Error al actualizar stock:", error);
              res.status(400).json({ error: error.message });
            });
          });
      });
    });
  });
});

// Función para enviar email de confirmación de pedido
const enviarEmailConfirmacionPedido = async (pedidoId, usuario, total, productos) => {
  try {
    const transporter = nodemailer.createTransporter({
      service: "Gmail",
      auth: {
        user: process.env.CORREO_ORIGEN,
        pass: process.env.CORREO_PASSWORD,
      },
    });

    const productosHTML = productos.map(prod => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${prod.nombre}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${prod.cantidad}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${prod.precio}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(prod.precio * prod.cantidad).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Pedido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; background: #2d2d2d; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">✨ Joyería Elegante</h1>
            <p style="margin: 10px 0 0 0;">Confirmación de Pedido</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d2d2d; margin-top: 0;">¡Gracias por tu pedido!</h2>
            
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            
            <p>Tu pedido <strong>#${pedidoId}</strong> ha sido confirmado y está siendo procesado.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalles del Pedido:</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosHTML}
                </tbody>
                <tfoot>
                  <tr style="background: #e9ecef; font-weight: bold;">
                    <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 1.2em;">$${total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976d2;">📦 ¿Qué sigue?</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Prepararemos tu pedido (1-2 días hábiles)</li>
                <li>Te notificaremos cuando esté listo para envío</li>
                <li>Recibirás tu pedido en 3-5 días hábiles</li>
                <li>Podrás rastrear tu envío desde tu cuenta</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/panel-usuario" 
                 style="background: #2d2d2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                Ver Mi Cuenta
              </a>
            </div>
            
            <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
              Si tienes alguna pregunta, no dudes en contactarnos.<br>
              Email: ${process.env.CORREO_ORIGEN}<br>
              Teléfono: +52 311 444 1683
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Joyería Elegante" <${process.env.CORREO_ORIGEN}>`,
      to: usuario.email,
      subject: `Confirmación de Pedido #${pedidoId} - Joyería Elegante`,
      html: htmlContent
    });

    console.log(`✅ Email de confirmación enviado para pedido ${pedidoId}`);
  } catch (error) {
    console.error(`❌ Error enviando email de confirmación:`, error);
  }
};

// Endpoint para obtener pedido por ID
app.get("/api/pedidos/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = `
    SELECT p.*, d.alias, d.calle, d.numero_exterior, d.colonia, d.ciudad, d.estado
    FROM pedidos p
    LEFT JOIN direcciones d ON p.ID_direccion = d.ID_direccion
    WHERE p.ID_pedido = ? AND p.ID_usuario = ?
  `;

  db.query(query, [id, userId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener pedido:", err);
      return res.status(500).json({ error: "Error al obtener pedido." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    res.json(results[0]);
  });
});

// Endpoint para obtener historial de pedidos del usuario
app.get("/api/mis-pedidos", verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT p.ID_pedido, p.fecha, p.total, p.estado,
           COUNT(dp.ID_detalle) as total_productos
    FROM pedidos p
    LEFT JOIN detalle_pedido dp ON p.ID_pedido = dp.ID_pedido
    WHERE p.ID_usuario = ?
    GROUP BY p.ID_pedido
    ORDER BY p.fecha DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener historial de pedidos:", err);
      return res.status(500).json({ error: "Error al obtener historial de pedidos." });
    }

    res.json(results);
  });
});

// Add materials endpoint
app.get("/api/materiales", (req, res) => {
  const query = "SELECT ID_material, nombre_material FROM material ORDER BY nombre_material ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener materiales:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener materiales",
        code: "DATABASE_ERROR"
      });
    }
    
    console.log(`✅ ${results.length} materiales obtenidos correctamente`);
    res.json(results);
  });
});

// Add categories endpoint
app.get("/api/categorias", (req, res) => {
  const query = "SELECT ID_categoria, nombre_categoria FROM categorias ORDER BY nombre_categoria ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener categorías:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener categorías",
        code: "DATABASE_ERROR"
      });
    }
    
    console.log(`✅ ${results.length} categorías obtenidas correctamente`);
    res.json(results);
  });
});

// Add genders endpoint
app.get("/api/generos", (req, res) => {
  const query = "SELECT ID_genero, nombre_genero FROM genero ORDER BY nombre_genero ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener géneros:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener géneros",
        code: "DATABASE_ERROR"
      });
    }
    
    console.log(`✅ ${results.length} géneros obtenidos correctamente`);
    res.json(results);
  });
});

// Add brands endpoint
app.get("/api/marcas", (req, res) => {
  const query = "SELECT ID_marca, nombre_marca FROM marcas ORDER BY nombre_marca ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener marcas:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener marcas",
        code: "DATABASE_ERROR"
      });
    }
    
    console.log(`✅ ${results.length} marcas obtenidas correctamente`);
    res.json(results);
  });
});

// Add endpoint to create missing categories if needed
app.post("/api/setup-categories", (req, res) => {
  const categoriasBase = [
    { id: 1, nombre: 'Aretes' },
    { id: 2, nombre: 'Anillos' },
    { id: 3, nombre: 'Collares' },
    { id: 4, nombre: 'Pulseras' },
    { id: 5, nombre: 'Llaveros' },
    { id: 6, nombre: 'Juegos' }
  ];

  const queries = categoriasBase.map(categoria => {
    return new Promise((resolve, reject) => {
      const query = "INSERT IGNORE INTO categorias (ID_categoria, nombre_categoria) VALUES (?, ?)";
      db.query(query, [categoria.id, categoria.nombre], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  });

  Promise.all(queries)
    .then(() => {
      res.json({ message: "Categorías base configuradas correctamente" });
    })
    .catch(err => {
      console.error("Error al configurar categorías:", err);
      res.status(500).json({ error: "Error al configurar categorías" });
    });
});

// Endpoint para actualizar datos personales
app.put("/api/actualizar-datos-personales", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { nombre, primer_apellido, segundo_apellido } = req.body;

  if (!nombre || !primer_apellido) {
    return res.status(400).json({ error: "Nombre y primer apellido son requeridos." });
  }

  const query = `
    UPDATE usuarios 
    SET nombre = ?, primer_apellido = ?, segundo_apellido = ?
    WHERE ID_usuario = ?
  `;

  db.query(query, [nombre, primer_apellido, segundo_apellido, userId], (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar datos personales:", err);
      return res.status(500).json({ error: "Error al actualizar datos personales." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({ message: "Datos personales actualizados correctamente." });
  });
});

// Endpoint para actualizar email
app.put("/api/actualizar-email", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email es requerido." });
  }

  // Verificar que el email no esté siendo usado por otro usuario
  const checkQuery = "SELECT ID_usuario FROM usuarios WHERE email = ? AND ID_usuario != ?";
  
  db.query(checkQuery, [email, userId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar email:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Este email ya está siendo usado por otro usuario." });
    }

    const updateQuery = "UPDATE usuarios SET email = ? WHERE ID_usuario = ?";
    
    db.query(updateQuery, [email, userId], (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar email:", err);
        return res.status(500).json({ error: "Error al actualizar email." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      res.json({ message: "Email actualizado correctamente." });
    });
  });
});

// Endpoint para cambiar contraseña
app.put("/api/cambiar-password", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Contraseña actual y nueva son requeridas." });
  }

  // Verificar contraseña actual
  const query = "SELECT password FROM usuarios WHERE ID_usuario = ?";
  
  db.query(query, [userId], async (err, results) => {
    if (err) {
      console.error("❌ Error al verificar contraseña:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña actual incorrecta." });
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = "UPDATE usuarios SET password = ? WHERE ID_usuario = ?";
    
    db.query(updateQuery, [hashedNewPassword, userId], (err, result) => {
      if (err) {
        console.error("❌ Error al cambiar contraseña:", err);
        return res.status(500).json({ error: "Error al cambiar contraseña." });
      }

      res.json({ message: "Contraseña cambiada correctamente." });
    });
  });
});

// Endpoint para actualizar datos de cuenta (email y teléfono)
app.put("/api/actualizar-cuenta", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { email, telefono } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email es requerido." });
  }

  // Verificar que el email no esté siendo usado por otro usuario
  const checkQuery = "SELECT ID_usuario FROM usuarios WHERE email = ? AND ID_usuario != ?";
  
  db.query(checkQuery, [email, userId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar email:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Este email ya está siendo usado por otro usuario." });
    }

    const updateQuery = "UPDATE usuarios SET email = ?, telefono = ? WHERE ID_usuario = ?";
    
    db.query(updateQuery, [email, telefono, userId], (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar datos de cuenta:", err);
        return res.status(500).json({ error: "Error al actualizar datos de cuenta." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      res.json({ message: "Datos de cuenta actualizados correctamente." });
    });
  });
});

// Endpoint para obtener direcciones del usuario
app.get("/api/direcciones", verifyToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT ID_direccion, alias, calle, numero_exterior, numero_interior, 
           colonia, ciudad, estado, codigo_postal, pais, predeterminada
    FROM direcciones 
    WHERE ID_usuario = ? 
    ORDER BY predeterminada DESC, alias ASC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener direcciones:", err);
      return res.status(500).json({ error: "Error al obtener direcciones." });
    }
    
    res.json(results);
  });
});

// Endpoint para crear nueva dirección
app.post("/api/direcciones", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { 
    alias, calle, numero_exterior, numero_interior, 
    colonia, ciudad, estado, codigo_postal, pais, predeterminada 
  } = req.body;

  if (!alias || !calle || !numero_exterior || !colonia || !ciudad || !estado || !codigo_postal) {
    return res.status(400).json({ error: "Los campos requeridos no pueden estar vacíos." });
  }

  // Si es predeterminada, quitar el estado predeterminado de otras direcciones
  const resetPredeterminadaQuery = predeterminada ? 
    "UPDATE direcciones SET predeterminada = 0 WHERE ID_usuario = ?" : "";

  const insertQuery = `
    INSERT INTO direcciones (
      ID_usuario, alias, calle, numero_exterior, numero_interior,
      colonia, ciudad, estado, codigo_postal, pais, predeterminada
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const executeInsert = () => {
    db.query(insertQuery, [
      userId, alias, calle, numero_exterior, numero_interior,
      colonia, ciudad, estado, codigo_postal, pais || 'México', predeterminada ? 1 : 0
    ], (err, result) => {
      if (err) {
        console.error("❌ Error al crear dirección:", err);
        return res.status(500).json({ error: "Error al crear dirección." });
      }
      
      res.status(201).json({ 
        message: "Dirección creada correctamente.",
        ID_direccion: result.insertId 
      });
    });
  };

  if (resetPredeterminadaQuery) {
    db.query(resetPredeterminadaQuery, [userId], (err) => {
      if (err) {
        console.error("❌ Error al resetear direcciones predeterminadas:", err);
        return res.status(500).json({ error: "Error al procesar dirección predeterminada." });
      }
      executeInsert();
    });
  } else {
    executeInsert();
  }
});

// Endpoint para actualizar dirección
app.put("/api/direcciones/:id", verifyToken, (req, res) => {
  const userId = req.user.id;
  const direccionId = req.params.id;
  const { 
    alias, calle, numero_exterior, numero_interior, 
    colonia, ciudad, estado, codigo_postal, pais, predeterminada 
  } = req.body;

  if (!alias || !calle || !numero_exterior || !colonia || !ciudad || !estado || !codigo_postal) {
    return res.status(400).json({ error: "Los campos requeridos no pueden estar vacíos." });
  }

  // Verificar que la dirección pertenece al usuario
  const checkOwnerQuery = "SELECT ID_direccion FROM direcciones WHERE ID_direccion = ? AND ID_usuario = ?";
  
  db.query(checkOwnerQuery, [direccionId, userId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar propietario:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada." });
    }

    const resetPredeterminadaQuery = predeterminada ? 
      "UPDATE direcciones SET predeterminada = 0 WHERE ID_usuario = ? AND ID_direccion != ?" : "";

    const updateQuery = `
      UPDATE direcciones SET 
        alias = ?, calle = ?, numero_exterior = ?, numero_interior = ?,
        colonia = ?, ciudad = ?, estado = ?, codigo_postal = ?, 
        pais = ?, predeterminada = ?
      WHERE ID_direccion = ? AND ID_usuario = ?
    `;

    const executeUpdate = () => {
      db.query(updateQuery, [
        alias, calle, numero_exterior, numero_interior,
        colonia, ciudad, estado, codigo_postal, pais || 'México', 
        predeterminada ? 1 : 0, direccionId, userId
      ], (err, result) => {
        if (err) {
          console.error("❌ Error al actualizar dirección:", err);
          return res.status(500).json({ error: "Error al actualizar dirección." });
        }
        
        res.json({ message: "Dirección actualizada correctamente." });
      });
    };

    if (resetPredeterminadaQuery) {
      db.query(resetPredeterminadaQuery, [userId, direccionId], (err) => {
        if (err) {
          console.error("❌ Error al resetear direcciones predeterminadas:", err);
          return res.status(500).json({ error: "Error al procesar dirección predeterminada." });
        }
        executeUpdate();
      });
    } else {
      executeUpdate();
    }
  });
});

// Endpoint para eliminar dirección
app.delete("/api/direcciones/:id", verifyToken, (req, res) => {
  const userId = req.user.id;
  const direccionId = req.params.id;

  // Verificar que la dirección pertenece al usuario
  const checkOwnerQuery = "SELECT ID_direccion FROM direcciones WHERE ID_direccion = ? AND ID_usuario = ?";
  
  db.query(checkOwnerQuery, [direccionId, userId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar propietario:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada." });
    }

    const deleteQuery = "DELETE FROM direcciones WHERE ID_direccion = ? AND ID_usuario = ?";
    
    db.query(deleteQuery, [direccionId, userId], (err, result) => {
      if (err) {
        console.error("❌ Error al eliminar dirección:", err);
        return res.status(500).json({ error: "Error al eliminar dirección." });
      }
      
      res.json({ message: "Dirección eliminada correctamente." });
    });
  });
});

// Endpoint para obtener carrito del usuario
app.get("/api/carrito", verifyToken, (req, res) => {
  const userId = req.user.id;
  
  console.log(`🔄 Solicitando carrito para usuario ${userId}`);
  
  const query = `
    SELECT c.ID_carrito, c.cantidad, c.fecha_agregado,
           p.ID_producto, p.nombre, p.descripcion, p.precio, p.stock, p.imagen,
           p.id_marca, p.id_material, p.id_genero, p.id_categoria
    FROM carritos c
    INNER JOIN productos p ON c.ID_producto = p.ID_producto
    WHERE c.ID_usuario = ? AND p.activo = 1
    ORDER BY c.fecha_agregado DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener carrito:", err);
      return res.status(500).json({ error: "Error al obtener carrito." });
    }
    
    console.log(`✅ Carrito obtenido para usuario ${userId}:`, results.length, "items");
    console.log("📦 Items del carrito:", results.map(item => ({
      id: item.ID_producto,
      nombre: item.nombre,
      cantidad: item.cantidad
    })));
    
    res.json(results);
  });
});

// Endpoint para agregar producto al carrito
app.post("/api/carrito", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { ID_producto, cantidad = 1 } = req.body;

  console.log(`🛒 Agregando producto ${ID_producto} (cantidad: ${cantidad}) al carrito del usuario ${userId}`);

  if (!ID_producto || cantidad <= 0) {
    return res.status(400).json({ error: "Datos de producto inválidos." });
  }

  // Verificar que el producto existe y tiene stock
  const checkProductQuery = "SELECT stock, nombre FROM productos WHERE ID_producto = ? AND activo = 1";
  
  db.query(checkProductQuery, [ID_producto], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar producto:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length === 0) {
      console.log(`❌ Producto ${ID_producto} no encontrado`);
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const producto = results[0];
    if (producto.stock < cantidad) {
      console.log(`❌ Stock insuficiente para producto ${ID_producto}. Stock disponible: ${producto.stock}, solicitado: ${cantidad}`);
      return res.status(400).json({ error: "Stock insuficiente." });
    }

    // Insertar o actualizar en carrito
    const insertOrUpdateQuery = `
      INSERT INTO carritos (ID_usuario, ID_producto, cantidad)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      cantidad = LEAST(cantidad + VALUES(cantidad), (SELECT stock FROM productos WHERE ID_producto = ?)),
      fecha_actualizado = current_timestamp()
    `;

    db.query(insertOrUpdateQuery, [userId, ID_producto, cantidad, ID_producto], (err, result) => {
      if (err) {
        console.error("❌ Error al agregar al carrito:", err);
        return res.status(500).json({ error: "Error al agregar producto al carrito." });
      }

      console.log(`✅ Producto ${producto.nombre} (ID: ${ID_producto}) agregado al carrito del usuario ${userId}`);
      res.status(201).json({ message: "Producto agregado al carrito correctamente." });
    });
  });
});

// Endpoint para actualizar cantidad en carrito
app.put("/api/carrito/:productoId", verifyToken, (req, res) => {
  const userId = req.user.id;
  const productoId = req.params.productoId;
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida." });
  }

  // Verificar stock disponible
  const checkStockQuery = "SELECT stock FROM productos WHERE ID_producto = ? AND activo = 1";
  
  db.query(checkStockQuery, [productoId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar stock:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const producto = results[0];
    const cantidadFinal = Math.min(cantidad, producto.stock);

    const updateQuery = `
      UPDATE carritos 
      SET cantidad = ?, fecha_actualizado = current_timestamp()
      WHERE ID_usuario = ? AND ID_producto = ?
    `;

    db.query(updateQuery, [cantidadFinal, userId, productoId], (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar carrito:", err);
        return res.status(500).json({ error: "Error al actualizar carrito." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Producto no encontrado en el carrito." });
      }

      console.log(`✅ Cantidad actualizada para producto ${productoId} del usuario ${userId}`);
      res.json({ message: "Cantidad actualizada correctamente." });
    });
  });
});

// Endpoint para eliminar producto del carrito
app.delete("/api/carrito/:productoId", verifyToken, (req, res) => {
  const userId = req.user.id;
  const productoId = req.params.productoId;

  const deleteQuery = "DELETE FROM carritos WHERE ID_usuario = ? AND ID_producto = ?";
  
  db.query(deleteQuery, [userId, productoId], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar del carrito:", err);
      return res.status(500).json({ error: "Error al eliminar producto del carrito." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito." });
    }

    console.log(`✅ Producto ${productoId} eliminado del carrito del usuario ${userId}`);
    res.json({ message: "Producto eliminado del carrito correctamente." });
  });
});

// Endpoint para limpiar carrito
app.delete("/api/carrito", verifyToken, (req, res) => {
  const userId = req.user.id;

  const deleteQuery = "DELETE FROM carritos WHERE ID_usuario = ?";
  
  db.query(deleteQuery, [userId], (err, result) => {
    if (err) {
      console.error("❌ Error al limpiar carrito:", err);
      return res.status(500).json({ error: "Error al limpiar carrito." });
    }

    console.log(`✅ Carrito limpiado para usuario ${userId}`);
    res.json({ message: "Carrito limpiado correctamente." });
  });
});

// Endpoint para sincronizar carrito desde localStorage
app.post("/api/carrito/sincronizar", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Items de carrito inválidos." });
  }

  // Limpiar carrito actual del usuario
  const deleteQuery = "DELETE FROM carritos WHERE ID_usuario = ?";
  
  db.query(deleteQuery, [userId], (err) => {
    if (err) {
      console.error("❌ Error al limpiar carrito para sincronización:", err);
      return res.status(500).json({ error: "Error al sincronizar carrito." });
    }

    if (items.length === 0) {
      return res.json({ message: "Carrito sincronizado (vacío)." });
    }

    // Insertar todos los items del localStorage
    const insertQuery = "INSERT INTO carritos (ID_usuario, ID_producto, cantidad) VALUES ?";
    const values = items.map(item => [userId, item.ID_producto, item.cantidad]);

    db.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error("❌ Error al insertar items en carrito:", err);
        return res.status(500).json({ error: "Error al sincronizar carrito." });
      }

      console.log(`✅ Carrito sincronizado para usuario ${userId} con ${items.length} items`);
      res.json({ message: "Carrito sincronizado correctamente." });
    });
  });
});