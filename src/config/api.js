// Configuración forzada para desarrollo local
// CAMBIAR A PRODUCCIÓN CUANDO SEA NECESARIO
const API_BASE_URL = 'http://127.0.0.1:5000'; // Backend debe correr en puerto 5000

// Configuración dinámica (comentada temporalmente)
// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//   ? 'https://api.curiosidadesnancy.shop'  // Producción
//   : 'http://127.0.0.1:5000';              // Desarrollo

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/api/login`,
  CREAR_CUENTA: `${API_BASE_URL}/api/crear-cuenta`,
  
  // Productos y catálogo
  PRODUCTOS: `${API_BASE_URL}/api/productos`,
  PRODUCTO_BY_ID: (id) => `${API_BASE_URL}/api/productos/${id}`,
  MATERIALES: `${API_BASE_URL}/api/materiales`,
  CATEGORIAS: `${API_BASE_URL}/api/categorias`,
  GENEROS: `${API_BASE_URL}/api/generos`,
  MARCAS: `${API_BASE_URL}/api/marcas`,
  
  // Usuario
  ACTUALIZAR_DATOS_PERSONALES: `${API_BASE_URL}/api/actualizar-datos-personales`,
  ACTUALIZAR_CUENTA: `${API_BASE_URL}/api/actualizar-cuenta`,
  CAMBIAR_PASSWORD: `${API_BASE_URL}/api/cambiar-password`,
  
  // Direcciones
  DIRECCIONES: `${API_BASE_URL}/api/direcciones`,
  DIRECCION_BY_ID: (id) => `${API_BASE_URL}/api/direcciones/${id}`,
  
  // Carrito
  CARRITO: `${API_BASE_URL}/api/carrito`,
  CARRITO_AGREGAR: `${API_BASE_URL}/api/carrito`,
  CARRITO_PRODUCTO: (id) => `${API_BASE_URL}/api/carrito/${id}`,
  CARRITO_SINCRONIZAR: `${API_BASE_URL}/api/carrito/sincronizar`,
  
  // Pedidos
  PEDIDOS: `${API_BASE_URL}/api/pedidos`,
  PEDIDO_BY_ID: (id) => `${API_BASE_URL}/api/pedidos/${id}`,
  MIS_PEDIDOS: `${API_BASE_URL}/api/mis-pedidos`,
  
  // Stripe
  CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/create-payment-intent`,
  STRIPE_WEBHOOK: `${API_BASE_URL}/api/webhook/stripe`,
  
  // Otros
  CONTACTO: `${API_BASE_URL}/api/contacto`,
  TEST: `${API_BASE_URL}/api/test`,
  DEBUG_DATABASE: `${API_BASE_URL}/api/debug/database`
};

// Stripe configuration con clave pública real
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51RsQ8xABK29IrJxcNKbbGlWYVVWALmR1ZcStCM89eJNWIVGfHEmgBwCi3CGxb0K961OLHibuoDgXrx5ImJSnogRB00xgdZ9umo'
};

// Función para obtener la primera imagen de un producto
export const getFirstProductImage = (producto) => {
  // Reutilizar la lógica de getProductImages y tomar la primera
  const imagenes = getProductImages(producto);
  return imagenes[0];
};

// Función para obtener todas las imágenes de un producto
export const getProductImages = (producto) => {
  // Verificar que el producto existe
  if (!producto) {
    console.warn('🚫 getProductImages: Producto es null o undefined');
    return ['/placeholder-jewelry.svg'];
  }

  // Verificar que tiene imagen y no es null
  if (!producto.imagen || producto.imagen === null || producto.imagen === 'null') {
    // Solo mostrar warning una vez por producto para evitar spam en consola
    if (!getProductImages._warnedProducts) {
      getProductImages._warnedProducts = new Set();
    }
    
    if (!getProductImages._warnedProducts.has(producto.ID_producto)) {
      console.warn(`📷 Producto "${producto.nombre}" (ID: ${producto.ID_producto}) no tiene imagen asignada`);
      getProductImages._warnedProducts.add(producto.ID_producto);
    }
    
    return ['/placeholder-jewelry.svg'];
  }

  let imagenesArray = [];
  
  // Si es un array JSON string, parsearlo
  if (typeof producto.imagen === 'string' && producto.imagen.startsWith('[')) {
    try {
      imagenesArray = JSON.parse(producto.imagen);
      console.log('✅ Parsed JSON array:', imagenesArray);
    } catch (error) {
      console.error('❌ Error parsing product images JSON:', error, 'for product:', producto.ID_producto);
      return ['/placeholder-jewelry.svg'];
    }
  }
  // Si es string separado por comas
  else if (typeof producto.imagen === 'string' && producto.imagen.includes(',')) {
    imagenesArray = producto.imagen.split(',').map(img => img.trim());
    console.log('✅ Split comma-separated:', imagenesArray);
  }
  // Si es una sola imagen
  else if (typeof producto.imagen === 'string' && producto.imagen.length > 0) {
    imagenesArray = [producto.imagen];
    console.log('✅ Single image:', imagenesArray);
  }
  // Si no es string o está vacío
  else {
    console.warn(`🚫 Imagen no válida para producto ${producto.ID_producto}:`, typeof producto.imagen, producto.imagen);
    return ['/placeholder-jewelry.svg'];
  }

  // Filtrar imágenes vacías y corregir URLs problemáticos
  const imagenesLimpias = imagenesArray
    .filter(img => img && img.trim() !== '' && img !== 'null' && img !== null)
    .map(img => {
      let imagenCorregida = img.trim();
      
      // Corregir URLs de localhost:3001 a localhost:5000 (backend)
      if (imagenCorregida.includes('localhost:3001')) {
        imagenCorregida = imagenCorregida.replace('localhost:3001', 'localhost:5000');
        console.log('🔧 Corrigiendo URL localhost:3001 -> localhost:5000:', img, '->', imagenCorregida);
      }
      
      // También corregir URLs de localhost:3000 a localhost:5000 para imágenes
      if (imagenCorregida.includes('localhost:3000/uploads')) {
        imagenCorregida = imagenCorregida.replace('localhost:3000', 'localhost:5000');
        console.log('🔧 Corrigiendo URL localhost:3000 -> localhost:5000:', img, '->', imagenCorregida);
      }
      
      return imagenCorregida;
    });

  // Si después de filtrar no quedan imágenes válidas, usar placeholder
  if (imagenesLimpias.length === 0) {
    console.warn(`📷 No hay imágenes válidas para producto ${producto.ID_producto}, usando placeholder`);
    return ['/placeholder-jewelry.svg'];
  }

  console.log('🎯 Imágenes finales procesadas:', imagenesLimpias);
  
  return imagenesLimpias;
};

// Función para hacer requests con manejo de errores
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor backend. Verifique que esté corriendo en http://localhost:5001');
    }
    throw error;
  }
};

// Función para verificar la salud del servidor
export const checkServerHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.TEST);
    if (response.ok) {
      const data = await response.json();
      return { status: 'ok', message: data.message };
    } else {
      return { status: 'error', message: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message.includes('Failed to fetch') 
        ? 'Servidor backend no disponible'
        : error.message 
    };
  }
};

// Función para verificar la estructura de la base de datos
export const checkDatabaseStructure = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.DEBUG_DATABASE);
    if (response.ok) {
      const data = await response.json();
      return { status: 'ok', data: data.database_info };
    } else {
      return { status: 'error', data: null };
    }
  } catch (error) {
    return { status: 'error', data: null };
  }
};

export default API_ENDPOINTS;