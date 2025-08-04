-- Corregir el producto existente y agregar productos de ejemplo

-- Actualizar el producto "Anillo" para que tenga la categoría correcta
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 4;
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 5;

-- Agregar algunos productos de ejemplo para las nuevas categorías
-- Anillos (categoría 2)
INSERT INTO productos (nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria, activo) VALUES
('Anillo de Compromiso Solitario', 'Elegante anillo de compromiso con diamante central', 1899.00, 12, '/placeholder.jpg', 1, 2, 1, 2, 1),
('Anillo de Boda Oro Rosa', 'Anillo de boda en oro rosa 18K con acabado brillante', 750.00, 20, '/placeholder.jpg', 1, 2, 3, 2, 1),
('Anillo Vintage Plata 925', 'Anillo vintage con detalles grabados en plata sterling', 320.00, 35, '/placeholder.jpg', 6, 3, 1, 2, 1);

-- Collares (categoría 3)
INSERT INTO productos (nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria, activo) VALUES
('Collar Perlas Cultivadas', 'Elegante collar de perlas cultivadas naturales', 680.00, 18, '/placeholder.jpg', 5, 9, 1, 3, 1),
('Collar Cadena Oro 18K Fino', 'Collar de cadena fina en oro de 18 quilates', 950.00, 15, '/placeholder.jpg', 1, 2, 3, 3, 1),
('Collar Plata con Dije Corazón', 'Collar de plata sterling con dije de corazón', 280.00, 30, '/placeholder.jpg', 6, 3, 1, 3, 1),
('Collar Cobre Artesanal', 'Collar artesanal de cobre con acabado oxidado', 150.00, 25, '/placeholder.jpg', 7, 8, 3, 3, 1);

-- Pulseras (categoría 4)
INSERT INTO productos (nombre, descripcion, precio, stock, imagen, id_marca, id_material, id_genero, id_categoria, activo) VALUES
('Pulsera Tenis Diamantes', 'Pulsera tenis con diamantes engarzados', 1850.00, 8, '/placeholder.jpg', 3, 4, 1, 4, 1),
('Pulsera Acero Inoxidable Sport', 'Pulsera moderna de acero inoxidable para deportistas', 150.00, 50, '/placeholder.jpg', 7, 1, 2, 4, 1),
('Pulsera Charm Plata Sterling', 'Pulsera de plata sterling con múltiples charms', 420.00, 25, '/placeholder.jpg', 6, 3, 1, 4, 1),
('Pulsera Oro Rosa Delicada', 'Pulsera delicada en oro rosa con eslabones finos', 580.00, 15, '/placeholder.jpg', 1, 2, 1, 4, 1);
