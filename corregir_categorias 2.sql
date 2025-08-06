-- Corregir las categorías de los productos existentes

-- El producto ID 4 "Anillo" debería estar en categoría 2 (Anillos)
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 4;

-- El producto ID 5 "Anillo coleccionable" debería estar en categoría 2 (Anillos)
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 5;

-- Verificar los cambios
SELECT ID_producto, nombre, id_categoria FROM productos;
