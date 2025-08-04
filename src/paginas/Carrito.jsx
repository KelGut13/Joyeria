import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import './estilos/Carrito.css';
import Separar from '../componentes/Separador NavBar/Separador';

const Carrito = () => {
  const navigate = useNavigate();
  const { 
    items, 
    cantidadItems, 
    subtotal, 
    total, 
    costoEnvio,
    descuento,
    actualizarCantidad, 
    eliminarProducto, 
    limpiarCarrito
  } = useCarrito();

  const [loading, setLoading] = useState(false);

  const handleCantidadChange = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    setLoading(true);
    try {
      await actualizarCantidad(productoId, nuevaCantidad);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar la cantidad');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (productoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      setLoading(true);
      try {
        await eliminarProducto(productoId);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLimpiarCarrito = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      setLoading(true);
      try {
        await limpiarCarrito();
      } catch (error) {
        console.error('Error al limpiar carrito:', error);
        alert('Error al limpiar el carrito');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      if (window.confirm('Debes iniciar sesión para continuar con la compra. ¿Quieres ir al login?')) {
        navigate('/login');
      }
      return;
    }
    
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="carrito-page">
        <Separar />
        <div className="container">
          <div className="carrito-vacio">
            <div className="carrito-vacio-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algunos productos increíbles a tu carrito</p>
            <Link to="/" className="btn-continuar-comprando">
              Explorar Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <Separar />
      <div className="container">
        <div className="carrito-header">
          <h1>Carrito de Compras</h1>
          <span className="carrito-contador">{cantidadItems} artículo(s)</span>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Actualizando carrito...</div>
          </div>
        )}

        <div className="carrito-content">
          <div className="carrito-items">
            {items.map(item => (
              <div key={item.ID_producto} className="carrito-item">
                <img 
                  src={
                    item.imagen
                      ? Array.isArray(item.imagen)
                        ? item.imagen[0]
                        : item.imagen.split(",")[0]
                      : "/placeholder.jpg"
                  }
                  alt={item.nombre}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                
                <div className="item-info">
                  <h3>{item.nombre}</h3>
                  <p className="item-descripcion">{item.descripcion}</p>
                  <span className="item-precio">${item.precio}</span>
                  <div className="item-stock-info">
                    {item.stock <= 5 && item.stock > 0 && (
                      <span className="stock-bajo">Solo {item.stock} disponibles</span>
                    )}
                    {item.stock === 0 && (
                      <span className="sin-stock">Sin stock</span>
                    )}
                  </div>
                </div>
                
                <div className="item-controls">
                  <div className="cantidad-control">
                    <button 
                      onClick={() => handleCantidadChange(item.ID_producto, item.cantidad - 1)}
                      disabled={item.cantidad <= 1 || loading}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button 
                      onClick={() => handleCantidadChange(item.ID_producto, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock || loading}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                  
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleEliminar(item.ID_producto)}
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            <div className="carrito-acciones">
              <Link to="/" className="btn-continuar">
                ← Continuar Comprando
              </Link>
              <button 
                className="btn-limpiar"
                onClick={handleLimpiarCarrito}
                disabled={loading}
              >
                Vaciar Carrito
              </button>
            </div>
          </div>

          <div className="carrito-resumen">
            <h3>Resumen del Pedido</h3>
            
            <div className="resumen-lineas">
              <div className="linea">
                <span>Subtotal ({cantidadItems} artículos):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {descuento > 0 && (
                <div className="linea descuento">
                  <span>Descuento:</span>
                  <span>-${descuento.toFixed(2)}</span>
                </div>
              )}
              
              <div className="linea">
                <span>Envío:</span>
                <span>{costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio.toFixed(2)}`}</span>
              </div>
              
              <div className="linea total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={loading}
            >
              Proceder al Pago
            </button>
            
            <div className="garantias">
              <div className="garantia">
                <span>🔒</span>
                <span>Compra 100% segura</span>
              </div>
              <div className="garantia">
                <span>🚚</span>
                <span>Envío gratis en compras +$500</span>
              </div>
              <div className="garantia">
                <span>↩️</span>
                <span>30 días para devoluciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
