import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

// Crear el contexto
const CarritoContext = createContext();

// Tipos de acciones para el reducer
const CARRITO_ACTIONS = {
  CARGAR_CARRITO: 'CARGAR_CARRITO',
  CARGAR_CARRITO_SERVIDOR: 'CARGAR_CARRITO_SERVIDOR',
  AGREGAR_PRODUCTO: 'AGREGAR_PRODUCTO',
  ACTUALIZAR_CANTIDAD: 'ACTUALIZAR_CANTIDAD',
  ELIMINAR_PRODUCTO: 'ELIMINAR_PRODUCTO',
  LIMPIAR_CARRITO: 'LIMPIAR_CARRITO',
  APLICAR_DESCUENTO: 'APLICAR_DESCUENTO',
  ESTABLECER_DIRECCION_ENVIO: 'ESTABLECER_DIRECCION_ENVIO'
};

// Estado inicial del carrito
const estadoInicial = {
  items: [],
  total: 0,
  subtotal: 0,
  descuento: 0,
  codigoDescuento: null,
  cantidadItems: 0,
  direccionEnvio: null,
  costoEnvio: 0,
  sincronizado: false,
  usuarioLogueado: false
};

// Función para obtener usuario actual
const obtenerUsuarioActual = () => {
  try {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

  // Función mejorada para verificar si el token es válido
  const esTokenValido = (token) => {
    if (!token) return false;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      console.log('🔍 Verificando token:', {
        exp: new Date(payload.exp * 1000).toISOString(),
        current: new Date(currentTime * 1000).toISOString(),
        timeUntilExpiry: `${Math.floor(timeUntilExpiry / 3600)}h ${Math.floor((timeUntilExpiry % 3600) / 60)}m`,
        isValid: payload.exp > currentTime
      });
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  };

  // Función mejorada para obtener token con logging
  const obtenerToken = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔍 No hay token en localStorage');
      return null;
    }
    
    if (!esTokenValido(token)) {
      console.log('⚠️ Token expirado o inválido, limpiando localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      return null;
    }
    
    console.log('✅ Token válido encontrado');
    return token;
  };

// Función para cargar carrito desde localStorage (usuarios no logueados)
const cargarCarritoDesdeStorage = () => {
  try {
    const carritoGuardado = localStorage.getItem('joyeria_carrito_invitado');
    if (carritoGuardado) {
      const carritoData = JSON.parse(carritoGuardado);
      console.log('📦 Carrito de invitado cargado desde localStorage:', carritoData);
      
      if (carritoData && Array.isArray(carritoData.items)) {
        return {
          ...estadoInicial,
          ...carritoData,
          ...calcularTotales(carritoData.items || [])
        };
      }
    }
  } catch (error) {
    console.error('❌ Error al cargar carrito desde localStorage:', error);
    localStorage.removeItem('joyeria_carrito_invitado');
  }
  return estadoInicial;
};

// Función para guardar carrito en localStorage (solo invitados)
const guardarCarritoEnStorage = (state) => {
  const usuario = obtenerUsuarioActual();
  
  // Solo guardar en localStorage si no hay usuario logueado
  if (!usuario) {
    try {
      const carritoParaGuardar = {
        items: state.items,
        descuento: state.descuento,
        codigoDescuento: state.codigoDescuento,
        direccionEnvio: state.direccionEnvio,
        costoEnvio: state.costoEnvio
      };
      localStorage.setItem('joyeria_carrito_invitado', JSON.stringify(carritoParaGuardar));
      console.log('💾 Carrito de invitado guardado en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar carrito en localStorage:', error);
    }
  }
};

// Función para calcular totales
const calcularTotales = (items) => {
  const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const cantidadItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  
  return {
    subtotal,
    cantidadItems,
    total: subtotal
  };
};

// Reducer para manejar las acciones del carrito
const carritoReducer = (state, action) => {
  console.log('🔄 Carrito reducer:', action.type, action.payload);
  
  switch (action.type) {
    case CARRITO_ACTIONS.CARGAR_CARRITO:
    case CARRITO_ACTIONS.CARGAR_CARRITO_SERVIDOR:
      console.log('🔄 Cargando carrito del servidor:', action.payload);
      return {
        items: action.payload,
        cantidadItems: action.payload.reduce((total, item) => total + item.cantidad, 0),
        subtotal: action.payload.reduce((total, item) => total + (item.precio * item.cantidad), 0),
        total: action.payload.reduce((total, item) => total + (item.precio * item.cantidad), 0),
        costoEnvio: 0,
        descuento: 0
      };

    case CARRITO_ACTIONS.AGREGAR_PRODUCTO:
      const { producto, cantidad } = action.payload;
      const itemExistente = state.items.find(item => item.ID_producto === producto.ID_producto);
      
      let nuevosItems;
      if (itemExistente) {
        // Actualizar cantidad del item existente
        nuevosItems = state.items.map(item =>
          item.ID_producto === producto.ID_producto
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.stock) }
            : item
        );
      } else {
        // Agregar nuevo item
        nuevosItems = [...state.items, { 
          ...producto, 
          cantidad: Math.min(cantidad, producto.stock) 
        }];
      }

      const nuevoSubtotal = nuevosItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      const nuevaCantidadItems = nuevosItems.reduce((total, item) => total + item.cantidad, 0);

      // Guardar en localStorage si es usuario invitado
      if (!obtenerUsuarioActual()) {
        guardarCarritoEnStorage(nuevosItems);
      }

      return {
        ...state,
        items: nuevosItems,
        cantidadItems: nuevaCantidadItems,
        subtotal: nuevoSubtotal,
        total: nuevoSubtotal
      };

    case CARRITO_ACTIONS.ACTUALIZAR_CANTIDAD:
      const { productoId: idActualizar, cantidad: nuevaCantidad } = action.payload;
      const itemsActualizados = state.items.map(item =>
        item.ID_producto === idActualizar
          ? { ...item, cantidad: Math.min(nuevaCantidad, item.stock) }
          : item
      );

      const subtotalActualizado = itemsActualizados.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      const cantidadActualizada = itemsActualizados.reduce((total, item) => total + item.cantidad, 0);

      // Guardar en localStorage si es usuario invitado
      if (!obtenerUsuarioActual()) {
        guardarCarritoEnStorage(itemsActualizados);
      }

      return {
        ...state,
        items: itemsActualizados,
        cantidadItems: cantidadActualizada,
        subtotal: subtotalActualizado,
        total: subtotalActualizado
      };

    case CARRITO_ACTIONS.ELIMINAR_PRODUCTO:
      const { productoId: idEliminar } = action.payload;
      const itemsFiltrados = state.items.filter(item => item.ID_producto !== idEliminar);

      const subtotalFiltrado = itemsFiltrados.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      const cantidadFiltrada = itemsFiltrados.reduce((total, item) => total + item.cantidad, 0);

      // Guardar en localStorage si es usuario invitado
      if (!obtenerUsuarioActual()) {
        guardarCarritoEnStorage(itemsFiltrados);
      }

      return {
        ...state,
        items: itemsFiltrados,
        cantidadItems: cantidadFiltrada,
        subtotal: subtotalFiltrado,
        total: subtotalFiltrado
      };

    case CARRITO_ACTIONS.LIMPIAR_CARRITO:
      // Limpiar localStorage si es usuario invitado
      if (!obtenerUsuarioActual()) {
        localStorage.removeItem('joyeria_carrito_invitado');
      }

      return {
        items: [],
        cantidadItems: 0,
        subtotal: 0,
        total: 0,
        costoEnvio: 0,
        descuento: 0
      };

    default:
      return state;
  }
};

// Provider del contexto
export const CarritoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, estadoInicial, cargarCarritoDesdeStorage);

  // Cargar carrito del servidor cuando el usuario esté logueado
  const cargarCarritoDelServidor = async () => {
    const token = obtenerToken();
    const usuario = obtenerUsuarioActual();

    if (!token || !usuario) {
      console.log('👤 Usuario no logueado o token inválido, usando carrito local');
      return;
    }

    try {
      console.log('🔄 Cargando carrito del servidor para usuario:', usuario.id);
      const response = await fetch(API_ENDPOINTS.CARRITO, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor carrito:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.status === 401) {
        console.log('❌ Token inválido o expirado en servidor, limpiando sesión');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        // Recargar la página para actualizar el estado
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      if (response.ok) {
        const carritoServidor = await response.json();
        console.log('✅ Carrito cargado del servidor:', carritoServidor);
        
        dispatch({
          type: CARRITO_ACTIONS.CARGAR_CARRITO_SERVIDOR,
          payload: carritoServidor
        });

        // Limpiar carrito de invitado después de cargar el del servidor
        localStorage.removeItem('joyeria_carrito_invitado');
      } else {
        console.error('❌ Error al cargar carrito del servidor:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al cargar carrito del servidor:', error);
    }
  };

  // Efecto mejorado para detectar cambios de autenticación
  useEffect(() => {
    let isMounted = true;
    
    const verificarYCargarCarrito = () => {
      if (!isMounted) return;
      
      const usuario = obtenerUsuarioActual();
      const token = obtenerToken();
      
      console.log('🔄 Verificando estado de autenticación:', { 
        usuario: !!usuario, 
        token: !!token,
        usuarioId: usuario?.id 
      });
      
      if (usuario && token) {
        console.log('✅ Usuario autenticado, cargando carrito del servidor...');
        cargarCarritoDelServidor();
      } else {
        console.log('👤 Usuario no autenticado, usando carrito local');
        const carritoLocal = cargarCarritoDesdeStorage();
        if (carritoLocal.items.length > 0) {
          dispatch({
            type: CARRITO_ACTIONS.CARGAR_CARRITO,
            payload: carritoLocal
          });
        }
      }
    };

    // Verificar inmediatamente solo una vez
    verificarYCargarCarrito();

    // Escuchar cambios en el storage
    const handleStorageChange = (event) => {
      if (!isMounted) return;
      
      if (event.key === 'token' || event.key === 'usuario') {
        console.log('🔄 Cambio en storage detectado:', event.key);
        setTimeout(verificarYCargarCarrito, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Solo ejecutar una vez

  // Guardar en localStorage solo para invitados
  useEffect(() => {
    const usuario = obtenerUsuarioActual();
    if (!usuario && !state.usuarioLogueado) {
      guardarCarritoEnStorage(state);
    }
  }, [state.items, state.usuarioLogueado]);

  // Funciones de acción
  const agregarProducto = async (producto, cantidad = 1) => {
    const usuario = obtenerUsuarioActual();
    const token = obtenerToken();

    console.log('🛒 Agregando producto:', { producto: producto.nombre, cantidad, usuario: !!usuario });

    if (usuario && token) {
      // Usuario logueado: agregar al servidor
      try {
        const response = await fetch(API_ENDPOINTS.CARRITO_AGREGAR, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ID_producto: producto.ID_producto,
            cantidad
          })
        });

        if (response.ok) {
          // Recargar carrito del servidor
          await cargarCarritoDelServidor();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Error al agregar producto');
        }
      } catch (error) {
        console.error('❌ Error al agregar al carrito del servidor:', error);
        throw error;
      }
    } else {
      // Usuario invitado: usar contexto local
      if (producto.stock <= 0) {
        throw new Error('Producto sin stock disponible');
      }

      dispatch({
        type: CARRITO_ACTIONS.AGREGAR_PRODUCTO,
        payload: { producto, cantidad }
      });
    }
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    const usuario = obtenerUsuarioActual();
    const token = obtenerToken();

    if (nuevaCantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    console.log(`🔄 Actualizando cantidad del producto ${productoId} a ${nuevaCantidad}`);

    if (usuario && token) {
      // Usuario logueado: actualizar en servidor
      try {
        const response = await fetch(`${API_ENDPOINTS.CARRITO}/${productoId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cantidad: nuevaCantidad })
        });

        if (response.ok) {
          // Recargar carrito del servidor
          await cargarCarritoDelServidor();
          console.log(`✅ Cantidad actualizada en servidor para producto ${productoId}`);
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Error al actualizar cantidad');
        }
      } catch (error) {
        console.error('❌ Error al actualizar cantidad en servidor:', error);
        throw error;
      }
    } else {
      // Usuario invitado: actualizar en contexto local
      dispatch({
        type: CARRITO_ACTIONS.ACTUALIZAR_CANTIDAD,
        payload: { productoId, cantidad: nuevaCantidad }
      });
      console.log(`✅ Cantidad actualizada localmente para producto ${productoId}`);
    }
  };

  const eliminarProducto = async (productoId) => {
    const usuario = obtenerUsuarioActual();
    const token = obtenerToken();

    console.log(`🗑️ Eliminando producto ${productoId} del carrito`);

    if (usuario && token) {
      // Usuario logueado: eliminar del servidor
      try {
        const response = await fetch(`${API_ENDPOINTS.CARRITO}/${productoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Recargar carrito del servidor
          await cargarCarritoDelServidor();
          console.log(`✅ Producto ${productoId} eliminado del servidor`);
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Error al eliminar producto');
        }
      } catch (error) {
        console.error('❌ Error al eliminar producto del servidor:', error);
        throw error;
      }
    } else {
      // Usuario invitado: eliminar del contexto local
      dispatch({
        type: CARRITO_ACTIONS.ELIMINAR_PRODUCTO,
        payload: { productoId }
      });
      console.log(`✅ Producto ${productoId} eliminado localmente`);
    }
  };

  const limpiarCarrito = async () => {
    const usuario = obtenerUsuarioActual();
    const token = obtenerToken();

    console.log('🧹 Limpiando carrito completo');

    if (usuario && token) {
      // Usuario logueado: limpiar en servidor
      try {
        const response = await fetch(API_ENDPOINTS.CARRITO, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Recargar carrito del servidor (debería estar vacío)
          await cargarCarritoDelServidor();
          console.log('✅ Carrito limpiado en servidor');
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Error al limpiar carrito');
        }
      } catch (error) {
        console.error('❌ Error al limpiar carrito en servidor:', error);
        throw error;
      }
    } else {
      // Usuario invitado: limpiar contexto local
      dispatch({
        type: CARRITO_ACTIONS.LIMPIAR_CARRITO
      });
      console.log('✅ Carrito limpiado localmente');
    }
  };

  const obtenerItemCarrito = (productoId) => {
    return state.items.find(item => item.ID_producto === productoId);
  };

  const estaEnCarrito = (productoId) => {
    return state.items.some(item => item.ID_producto === productoId);
  };

  const value = {
    // Estado
    ...state,
    
    // Acciones
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito,
    
    // Utilidades
    obtenerItemCarrito,
    estaEnCarrito,
    
    // Funciones de sincronización
    cargarCarritoDelServidor
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};

export default CarritoContext;