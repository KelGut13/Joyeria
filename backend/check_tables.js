import mysql from 'mysql2/promise';

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'u465901502_joyeria'
  });

  try {
    // Verificar si existen las tablas
    const [tables] = await connection.execute('SHOW TABLES LIKE "pedidos"');
    console.log('Tabla pedidos existe:', tables.length > 0);
    
    if (tables.length > 0) {
      const [pedidos] = await connection.execute('SELECT COUNT(*) as count FROM pedidos');
      console.log('Pedidos existentes:', pedidos[0].count);
      
      // Mostrar estructura de la tabla
      const [structure] = await connection.execute('DESCRIBE pedidos');
      console.log('Estructura tabla pedidos:');
      structure.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
    }
    
    const [tablesPedidos] = await connection.execute('SHOW TABLES LIKE "detalle_pedido"');
    console.log('Tabla detalle_pedido existe:', tablesPedidos.length > 0);
    
    if (tablesPedidos.length > 0) {
      const [detalles] = await connection.execute('SELECT COUNT(*) as count FROM detalle_pedido');
      console.log('Detalles existentes:', detalles[0].count);
      
      // Mostrar estructura de la tabla
      const [structure] = await connection.execute('DESCRIBE detalle_pedido');
      console.log('Estructura tabla detalle_pedido:');
      structure.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    await connection.end();
  }
}

checkTables();
