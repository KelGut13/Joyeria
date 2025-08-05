import mysql from 'mysql2/promise';

async function insertTestOrders() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'u465901502_joyeria'
    });

    console.log('✅ Conectado a la base de datos');

    // Verificar que las tablas existen
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Tablas disponibles:', tables.map(t => Object.values(t)[0]));

    // Insertar pedidos de prueba para diferentes usuarios
    const testOrders = [
      {
        userId: 4, // Usuario asasa12@gmail.com
        total: 1490.00,
        estado: 'completado',
        metodo_pago: 'Tarjeta de Crédito',
        direccion_envio: 'Calle Principal 123, Colonia Centro, Ciudad',
        productos: [
          { productId: 1, cantidad: 2, precio: 320.00 },
          { productId: 40, cantidad: 1, precio: 850.00 }
        ]
      },
      {
        userId: 4,
        total: 2380.00,
        estado: 'pendiente',
        metodo_pago: 'PayPal',
        direccion_envio: 'Avenida Reforma 456, Colonia Roma, Ciudad',
        productos: [
          { productId: 46, cantidad: 1, precio: 1280.00 },
          { productId: 43, cantidad: 2, precio: 550.00 }
        ]
      },
      {
        userId: 13, // Usuario prueba01@gmail.com 
        total: 1150.00,
        estado: 'enviado',
        metodo_pago: 'Tarjeta de Débito',
        direccion_envio: 'Boulevard Norte 789, Colonia Del Valle, Ciudad',
        productos: [
          { productId: 5, cantidad: 1, precio: 720.00 },
          { productId: 1, cantidad: 1, precio: 320.00 }
        ]
      }
    ];

    for (const order of testOrders) {
      // Insertar pedido
      const [result] = await connection.execute(
        'INSERT INTO pedidos (ID_usuario, total, estado, metodo_pago, direccion_envio) VALUES (?, ?, ?, ?, ?)',
        [order.userId, order.total, order.estado, order.metodo_pago, order.direccion_envio]
      );

      const pedidoId = result.insertId;
      console.log(`✅ Pedido ${pedidoId} creado para usuario ${order.userId}`);

      // Insertar detalles del pedido
      for (const producto of order.productos) {
        await connection.execute(
          'INSERT INTO detalle_pedido (ID_pedido, ID_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [pedidoId, producto.productId, producto.cantidad, producto.precio]
        );
      }

      console.log(`✅ Detalles del pedido ${pedidoId} insertados`);
    }

    // Verificar los datos insertados
    const [pedidos] = await connection.execute(`
      SELECT p.ID_pedido, p.ID_usuario, p.fecha, p.total, p.estado, p.metodo_pago,
             COUNT(dp.ID_detalle) as total_productos
      FROM pedidos p
      LEFT JOIN detalle_pedido dp ON p.ID_pedido = dp.ID_pedido
      GROUP BY p.ID_pedido
      ORDER BY p.fecha DESC
    `);

    console.log('📋 Pedidos insertados:');
    pedidos.forEach(pedido => {
      console.log(`  - Pedido ${pedido.ID_pedido}: Usuario ${pedido.ID_usuario}, Total: $${pedido.total}, Estado: ${pedido.estado}, Productos: ${pedido.total_productos}`);
    });

    await connection.end();
    console.log('✅ Datos de prueba insertados correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: Asegúrate de que MySQL/XAMPP esté ejecutándose');
    }
  }
}

insertTestOrders();
