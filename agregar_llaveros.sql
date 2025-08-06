-- Corregir categorías y agregar llaveros

-- Verificar que existe la categoría 5 para llaveros, si no, crearla
INSERT IGNORE INTO categorias (ID_categoria, nombre_categoria, descripcion) VALUES 
(5, 'Llaveros', 'Accesorios funcionales y decorativos para llaves');

-- Agregar productos de llaveros (categoría 5)
INSERT INTO productos (nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria, activo) VALUES
('Llavero Plata Sterling', 'Elegante llavero en plata sterling con grabado personalizado', 45.00, 50, '/placeholder.jpg', 6, 3, 3, 5, 1),
('Llavero Oro Rosa Corazón', 'Llavero romántico en oro rosa con forma de corazón', 85.00, 30, '/placeholder.jpg', 1, 2, 1, 5, 1),
('Llavero Acero Inoxidable', 'Llavero resistente de acero inoxidable para uso diario', 25.00, 75, '/placeholder.jpg', 7, 1, 2, 5, 1),
('Llavero Cobre Artesanal', 'Llavero artesanal de cobre con diseño único', 35.00, 40, '/placeholder.jpg', 7, 8, 3, 5, 1),
('Llavero Plata con Zirconia', 'Llavero decorativo con piedras de zirconia cúbica', 65.00, 25, '/placeholder.jpg', 6, 3, 1, 5, 1),
('Llavero Diamante Sintético', 'Llavero premium con diamante sintético engarzado', 120.00, 15, '/placeholder.jpg', 3, 4, 1, 5, 1);

-- Verificar los cambios
SELECT 'Verificación de productos por categoría:' as info;
SELECT c.nombre_categoria, COUNT(p.ID_producto) as cantidad_productos
FROM categorias c 
LEFT JOIN productos p ON c.ID_categoria = p.id_categoria AND p.activo = 1
GROUP BY c.ID_categoria, c.nombre_categoria
ORDER BY c.ID_categoria;

-- Mostrar algunos productos de cada categoría para verificar
SELECT 'Productos de muestra por categoría:' as info;
SELECT c.nombre_categoria, p.nombre as producto_nombre, p.precio
FROM categorias c 
INNER JOIN productos p ON c.ID_categoria = p.id_categoria 
WHERE p.activo = 1
ORDER BY c.ID_categoria, p.ID_producto
LIMIT 20;
