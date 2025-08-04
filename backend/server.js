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