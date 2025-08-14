-- Script para crear los menús faltantes en la base de datos
-- Ejecutar este script en MySQL Workbench o cualquier cliente MySQL

-- Primero, verificar qué menús ya existen
SELECT * FROM menu;

-- Insertar los menús necesarios (solo si no existen)
-- Usamos INSERT IGNORE para evitar duplicados si ya existen

INSERT IGNORE INTO menu (id_menu, nombre_menu, id_restaurante) VALUES 
(1, 'Menú del Día', 1),
(2, 'Menú Especial', 1),
(3, 'Postres', 1),
(4, 'Bebidas', 1);

-- Verificar que se insertaron correctamente
SELECT * FROM menu ORDER BY id_menu;

-- Si quieres resetear completamente la tabla menu (¡CUIDADO! Esto borra todo)
-- DELETE FROM menu;
-- ALTER TABLE menu AUTO_INCREMENT = 1;
-- Luego ejecutar los INSERT de arriba

-- Verificación final - deberías ver los 4 menús
SELECT 
    id_menu as ID,
    nombre_menu as 'Nombre del Menú',
    id_restaurante as 'ID Restaurante'
FROM menu 
ORDER BY id_menu;