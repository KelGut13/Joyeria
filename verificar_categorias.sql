-- Verificar y corregir estructura de categorías

-- Mostrar las categorías actuales
SELECT 'Categorías existentes:' as info;
SELECT ID_categoria, nombre_categoria, descripcion FROM categorias ORDER BY ID_categoria;

-- Asegurar que todas las categorías necesarias existan
INSERT IGNORE INTO categorias (ID_categoria, nombre_categoria, descripcion) VALUES 
(1, 'Aretes', 'Joyas para las orejas'),
(2, 'Anillos', 'Anillos para dedos'),
(3, 'Collares', 'Joyas para el cuello'),
(4, 'Pulseras', 'Joyas para las muñecas'),
(5, 'Llaveros', 'Accesorios funcionales para llaves');

-- Verificar productos por categoría después de la corrección
SELECT 'Distribución actual de productos:' as info;
SELECT c.ID_categoria, c.nombre_categoria, COUNT(p.ID_producto) as total_productos
FROM categorias c 
LEFT JOIN productos p ON c.ID_categoria = p.id_categoria AND p.activo = 1
GROUP BY c.ID_categoria, c.nombre_categoria
ORDER BY c.ID_categoria;

-- Mostrar algunos productos por categoría para verificar
SELECT 'Muestra de productos por categoría:' as info;
SELECT c.nombre_categoria, p.nombre, p.precio, p.id_categoria
FROM productos p 
INNER JOIN categorias c ON p.id_categoria = c.ID_categoria
WHERE p.activo = 1
ORDER BY p.id_categoria, p.ID_producto;
