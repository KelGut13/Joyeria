// Configuración forzada para desarrollo local
// CAMBIAR A PRODUCCIÓN CUANDO SEA NECESARIO
const API_BASE_URL = 'http://127.0.0.1:5000'; // Forzado para desarrollo local

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
  // Verificar que el producto existe y tiene imagen
  if (!producto || !producto.imagen) {
    console.warn('Producto sin imagen:', producto);
    return '/logo192.png';
  }
  
  // Si es un array JSON string, parsearlo
  if (producto.imagen.startsWith('[')) {
    try {
      const imagenesArray = JSON.parse(producto.imagen);
      return imagenesArray[0] || '/logo192.png';
    } catch (error) {
      console.error('Error parsing product images:', error);
      return '/logo192.png';
    }
  }
  
  // Si es string separado por comas
  if (producto.imagen.includes(',')) {
    return producto.imagen.split(',')[0];
  }
  
  // Si es una sola imagen
  return producto.imagen;
};

// Función para obtener todas las imágenes de un producto
export const getProductImages = (producto) => {
  // Verificar que el producto existe y tiene imagen
  if (!producto || !producto.imagen) {
    console.warn('Producto sin imagen:', producto);
    return ['/logo192.png'];
  }
  
  // Si es un array JSON string, parsearlo
  if (producto.imagen.startsWith('[')) {
    try {
      const imagenesArray = JSON.parse(producto.imagen);
      return imagenesArray.length > 0 ? imagenesArray : ['/logo192.png'];
    } catch (error) {
      console.error('Error parsing product images:', error);
      return ['/logo192.png'];
    }
  }
  
  // Si es string separado por comas
  if (producto.imagen.includes(',')) {
    return producto.imagen.split(',').map(img => img.trim());
  }
  
  // Si es una sola imagen
  return [producto.imagen];
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