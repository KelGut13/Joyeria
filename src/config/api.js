// Configuración de APIs para el ecommerce
const API_CONFIG = {
  // API del ecommerce (backend actual)
  ECOMMERCE_API: 'https://api.curiosidadesnancy.shop/api',
  
  // API del admin (donde están las imágenes)  
  ADMIN_API: 'https://api.curiosidadesnancy.shop',
  
  // URL base para las imágenes subidas desde el admin
  IMAGES_BASE_URL: 'https://api.curiosidadesnancy.shop/uploads/productos',
  
  // Modo de desarrollo/fallback
  USE_MOCK_DATA: false, // Cambiar a true si el backend no está disponible
};

// URLs específicas para las APIs
export const API_ENDPOINTS = {
  // Productos
  PRODUCTOS: `${API_CONFIG.ECOMMERCE_API}/productos`,
  PRODUCTO_BY_ID: (id) => `${API_CONFIG.ECOMMERCE_API}/productos/${id}`,
  
  // Categorías y filtros
  MATERIALES: `${API_CONFIG.ECOMMERCE_API}/materiales`,
  GENEROS: `${API_CONFIG.ECOMMERCE_API}/generos`,
  MARCAS: `${API_CONFIG.ECOMMERCE_API}/marcas`,
  
  // Usuarios y autenticación
  LOGIN: `${API_CONFIG.ECOMMERCE_API}/login`,
  CREAR_CUENTA: `${API_CONFIG.ECOMMERCE_API}/crear-cuenta`,
  
  // Carrito
  CARRITO: `${API_CONFIG.ECOMMERCE_API}/carrito`,
  CARRITO_BY_ID: (id) => `${API_CONFIG.ECOMMERCE_API}/carrito/${id}`,
  
  // Pedidos
  PEDIDOS: `${API_CONFIG.ECOMMERCE_API}/pedidos`,
  PEDIDO_BY_ID: (id) => `${API_CONFIG.ECOMMERCE_API}/pedidos/${id}`,
  MIS_PEDIDOS: `${API_CONFIG.ECOMMERCE_API}/mis-pedidos`,
  
  // Usuario
  ACTUALIZAR_DATOS: `${API_CONFIG.ECOMMERCE_API}/actualizar-datos-personales`,
  ACTUALIZAR_CUENTA: `${API_CONFIG.ECOMMERCE_API}/actualizar-cuenta`,
  CAMBIAR_PASSWORD: `${API_CONFIG.ECOMMERCE_API}/cambiar-password`,
  
  // Direcciones
  DIRECCIONES: `${API_CONFIG.ECOMMERCE_API}/direcciones`,
  DIRECCION_BY_ID: (id) => `${API_CONFIG.ECOMMERCE_API}/direcciones/${id}`,
  
  // Contacto
  CONTACTO: `${API_CONFIG.ECOMMERCE_API}/contacto`,
};

// Función para construir URL completa de imagen
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/logo192.png'; // Usar logo como fallback
  
  // Si ya es una URL completa con localhost, reemplazar con el dominio correcto
  if (imagePath.startsWith('http://localhost:3001/')) {
    return imagePath.replace('http://localhost:3001/', 'https://api.curiosidadesnancy.shop/');
  }
  
  // Si ya es una URL completa correcta, devolverla tal como está
  if (imagePath.startsWith('https://api.curiosidadesnancy.shop/')) {
    return imagePath;
  }
  
  // Si es un path relativo, construir la URL completa
  const cleanPath = imagePath.replace('uploads/productos/', '');
  return `${API_CONFIG.IMAGES_BASE_URL}/${cleanPath}`;
};

// Función para obtener múltiples imágenes (si el producto tiene varias)
export const getProductImages = (producto) => {
  // Si no hay producto, devolver fallback
  if (!producto) {
    console.log('❌ No hay producto');
    return ['/logo192.png'];
  }
  
  // Si no hay imagen o es null/None, devolver fallback
  if (!producto.imagen || producto.imagen === null || producto.imagen === 'None' || producto.imagen === '[]') {
    console.log(`📦 Producto "${producto.nombre}" sin imagen - usando fallback`);
    return ['/logo192.png'];
  }
  
  let imageData = producto.imagen;
  console.log(`🖼️ Procesando imagen para "${producto.nombre}":`, imageData);
  
  // Si es un string que parece un array JSON, parsearlo
  if (typeof imageData === 'string' && imageData.startsWith('[')) {
    try {
      imageData = JSON.parse(imageData);
      console.log('✅ JSON parseado:', imageData);
    } catch (e) {
      console.warn('❌ Error parseando JSON de imagen:', e);
      return ['/logo192.png'];
    }
  }
  
  // Si es un array, procesar cada imagen
  if (Array.isArray(imageData)) {
    const processedImages = imageData.map(img => getImageUrl(img));
    console.log('✅ Array procesado:', processedImages);
    return processedImages;
  }
  
  // Si es un string con comas (múltiples imágenes), dividir y procesar
  if (typeof imageData === 'string' && imageData.includes(',')) {
    const imageArray = imageData.split(',').map(img => getImageUrl(img.trim()));
    console.log('✅ String con comas procesado:', imageArray);
    return imageArray;
  }
  
  // Si es una sola imagen
  const singleImage = [getImageUrl(imageData)];
  console.log('✅ Imagen única procesada:', singleImage);
  return singleImage;
};

// Función para obtener la primera imagen de un producto
export const getFirstProductImage = (producto) => {
  const images = getProductImages(producto);
  const firstImage = images[0];
  console.log('🎯 Primera imagen seleccionada:', firstImage);
  return firstImage;
};

// Función de prueba para debug
export const testImageUrl = (producto) => {
  console.log('🔍 TESTING PRODUCTO:', producto);
  if (producto && producto.imagen) {
    console.log('🔍 IMAGEN RAW:', producto.imagen);
    const processed = getFirstProductImage(producto);
    console.log('🔍 IMAGEN PROCESADA:', processed);
    return processed;
  }
  return '/logo192.png';
};

export default API_CONFIG;