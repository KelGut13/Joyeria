-- Crear tabla para carritos de usuarios (si no existe)
CREATE TABLE IF NOT EXISTS `carritos` (
  `ID_carrito` int(11) NOT NULL AUTO_INCREMENT,
  `ID_usuario` int(11) NOT NULL,
  `ID_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `fecha_agregado` datetime DEFAULT current_timestamp(),
  `fecha_actualizado` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ID_carrito`),
  UNIQUE KEY `usuario_producto` (`ID_usuario`, `ID_producto`),
  KEY `ID_usuario` (`ID_usuario`),
  KEY `ID_producto` (`ID_producto`),
  CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuarios` (`ID_usuario`) ON DELETE CASCADE,
  CONSTRAINT `carritos_ibfk_2` FOREIGN KEY (`ID_producto`) REFERENCES `productos` (`ID_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Limpiar géneros duplicados
DELETE FROM genero WHERE ID_genero IN (4, 5, 6, 7);

-- Corregir productos existentes para que estén en las categorías correctas
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 4; -- Anillo -> Anillos
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 5; -- Anillo coleccionable -> Anillos

-- Agregar métodos de pago que faltan
INSERT IGNORE INTO metodo_pago (nombre_metodo) VALUES 
('Tarjeta de Crédito'),
('PayPal'),
('Transferencia Bancaria'),
('Pago en Efectivo');

-- Agregar más productos para completar el catálogo
INSERT IGNORE INTO productos (nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria, activo) VALUES

-- Más Aretes (categoría 1)
('Aretes Perla Elegante', 'Aretes de perla cultivada con base de plata sterling', 680.00, 15, '/placeholder.jpg', 5, 3, 1, 1, 1),
('Aretes Oro Rosa Circular', 'Aretes circulares en oro rosa 18K con acabado mate', 850.00, 12, '/placeholder.jpg', 1, 2, 3, 1, 1),
('Aretes Acero Deportivos', 'Aretes modernos de acero inoxidable para uso diario', 180.00, 35, '/placeholder.jpg', 7, 1, 2, 1, 1),

-- Más Anillos (categoría 2)
('Anillo Compromiso Premium', 'Anillo de compromiso con diamante solitario de 1.5 quilates', 2500.00, 5, '/placeholder.jpg', 3, 4, 1, 2, 1),
('Anillo Boda Clásico Oro', 'Anillo de boda clásico en oro 18K con grabado interior', 890.00, 25, '/placeholder.jpg', 1, 2, 3, 2, 1),
('Anillo Vintage Plata', 'Anillo vintage con diseño art déco en plata sterling', 450.00, 18, '/placeholder.jpg', 6, 3, 3, 2, 1),

-- Collares (categoría 3)
('Collar Perlas Tahití', 'Collar de perlas negras de Tahití con cierre de oro', 1200.00, 8, '/placeholder.jpg', 5, 9, 1, 3, 1),
('Collar Cadena Oro 24K', 'Collar de cadena gruesa en oro de 24 quilates', 1500.00, 10, '/placeholder.jpg', 1, 2, 3, 3, 1),
('Collar Plata con Zirconia', 'Collar de plata sterling con piedras de zirconia cúbica', 320.00, 22, '/placeholder.jpg', 6, 3, 1, 3, 1),
('Collar Cobre Artesanal Largo', 'Collar largo artesanal de cobre con diseño étnico', 250.00, 20, '/placeholder.jpg', 7, 8, 3, 3, 1),

-- Pulseras (categoría 4)
('Pulsera Tenis Premium', 'Pulsera tenis con diamantes graduados, 8 pulgadas', 2200.00, 6, '/placeholder.jpg', 3, 4, 1, 4, 1),
('Pulsera Acero Magnética', 'Pulsera de acero inoxidable con cierre magnético', 220.00, 40, '/placeholder.jpg', 7, 1, 2, 4, 1),
('Pulsera Charm Personalizable', 'Pulsera de plata con charms intercambiables', 580.00, 15, '/placeholder.jpg', 6, 3, 1, 4, 1),
('Pulsera Oro Rosa Flexible', 'Pulsera flexible en oro rosa con eslabones móviles', 750.00, 12, '/placeholder.jpg', 1, 2, 1, 4, 1);

-- Verificar productos por categoría
SELECT 'Productos por categoría' as info;
SELECT c.nombre_categoria, COUNT(p.ID_producto) as cantidad
FROM categorias c 
LEFT JOIN productos p ON c.ID_categoria = p.id_categoria 
WHERE p.activo = 1
GROUP BY c.ID_categoria, c.nombre_categoria;

-- Limpiar géneros duplicados
DELETE FROM genero WHERE ID_genero IN (4, 5, 6, 7);

-- Verificar datos
SELECT 'Productos por categoría' as info;
SELECT c.nombre_categoria, COUNT(p.ID_producto) as cantidad
FROM categorias c 
LEFT JOIN productos p ON c.ID_categoria = p.id_categoria 
WHERE p.activo = 1
GROUP BY c.ID_categoria, c.nombre_categoria;

SELECT 'Métodos de pago' as info;
SELECT * FROM metodo_pago;

-- Verificar si hay datos en la tabla carritos
SELECT 'Carritos por usuario' as info;
SELECT c.ID_usuario, u.nombre, u.email, COUNT(c.ID_carrito) as productos_en_carrito
FROM usuarios u 
LEFT JOIN carritos c ON u.ID_usuario = c.ID_usuario
GROUP BY u.ID_usuario, u.nombre, u.email;

-- Verificar productos en carritos con detalles
SELECT 'Detalles de carritos' as info;
SELECT c.ID_usuario, u.nombre as usuario, p.nombre as producto, c.cantidad, c.fecha_agregado
FROM carritos c
INNER JOIN usuarios u ON c.ID_usuario = u.ID_usuario
INNER JOIN productos p ON c.ID_producto = p.ID_producto
ORDER BY c.ID_usuario, c.fecha_agregado DESC;
