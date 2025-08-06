import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Shield, Truck, RotateCcw, Lock } from 'lucide-react';
import { CarritoContext } from '../context/CarritoContext';
import './estilos/Carrito.css';
import Separar from '../componentes/Separador NavBar/Separador';

const Carrito = () => {
  const navigate = useNavigate();
  const { 
    productos, 
    actualizarCantidad, 
    eliminarProducto, 
    limpiarCarrito,
    obtenerTotal,
    obtenerCantidadTotal
  } = useContext(CarritoContext);
  
  const [loading, setLoading] = useState(false);
  const [eliminating, setEliminating] = useState(null);

  const subtotal = obtenerTotal();
  const cantidadTotal = obtenerCantidadTotal();
  const costoEnvio = subtotal >= 500 ? 0 : 50;
  const total = subtotal + costoEnvio;

  const handleCantidadChange = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    setLoading(true);
    try {
      actualizarCantidad(productoId, nuevaCantidad);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleEliminar = async (productoId) => {
    setEliminating(productoId);
    try {
      eliminarProducto(productoId);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    } finally {
      setTimeout(() => setEliminating(null), 300);
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

  // Si el carrito está vacío
  if (!productos || productos.length === 0) {
    return (
      <div className="carrito-page">
        <Separar />
        
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <div className="container">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <span>Carrito</span>
          </div>
        </nav>

        <div className="container">
          <div className="carrito-vacio">
            <div className="carrito-vacio-icon">
              <ShoppingBag size={80} strokeWidth={1} />
            </div>
            <h2>Tu carrito está vacío</h2>
            <p>Descubre nuestros productos únicos y comienza a llenar tu carrito</p>
            <Link to="/juegos" className="btn-explorar">
              <ShoppingBag size={20} />
              Explorar Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Carrito con productos
  return (
    <div className="carrito-page">
      <Separar />
      
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <div className="container">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span>Carrito</span>
        </div>
      </nav>

      {/* Botón volver */}
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-volver">
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      <div className="carrito-content">
        <div className="container">
          {/* Header del carrito */}
          <div className="carrito-header">
            <div className="header-info">
              <h1>Carrito de Compras</h1>
              <span className="items-count">{cantidadTotal} artículo{cantidadTotal !== 1 ? 's' : ''}</span>
            </div>
            {productos.length > 0 && (
              <button 
                className="btn-limpiar"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
                    limpiarCarrito();
                  }
                }}
                disabled={loading}
              >
                <Trash2 size={18} />
                Vaciar carrito
              </button>
            )}
          </div>

          <div className="carrito-grid">
            {/* Lista de productos */}
            <div className="productos-lista">
              {productos.map(producto => (
                <div 
                  key={producto.id} 
                  className={`producto-item ${eliminating === producto.id ? 'eliminando' : ''}`}
                >
                  <div className="producto-imagen">
                    <img
                      src={producto.imagen || '/placeholder-jewelry.svg'}
                      alt={producto.nombre}
                      onError={(e) => {
                        e.target.src = '/placeholder-jewelry.svg';
                      }}
                    />
                  </div>
                  
                  <div className="producto-info">
                    <h3>{producto.nombre}</h3>
                    <p className="producto-precio">${producto.precio.toFixed(2)}</p>
                    <div className="producto-stock">
                      {producto.stock <= 5 && producto.stock > 0 && (
                        <span className="stock-bajo">Solo {producto.stock} disponibles</span>
                      )}
                      {producto.stock === 0 && (
                        <span className="sin-stock">Sin stock</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="producto-controles">
                    <div className="cantidad-controls">
                      <button 
                        onClick={() => handleCantidadChange(producto.id, producto.cantidad - 1)}
                        disabled={producto.cantidad <= 1 || loading}
                        className="btn-cantidad"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="cantidad-display">{producto.cantidad}</span>
                      <button 
                        onClick={() => handleCantidadChange(producto.id, producto.cantidad + 1)}
                        disabled={producto.cantidad >= producto.stock || loading}
                        className="btn-cantidad"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="producto-subtotal">
                      ${(producto.precio * producto.cantidad).toFixed(2)}
                    </div>
                    
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleEliminar(producto.id)}
                      disabled={loading}
                      title="Eliminar producto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="resumen-pedido">
              <div className="resumen-card">
                <h3>Resumen del Pedido</h3>
                
                <div className="resumen-detalles">
                  <div className="detalle-linea">
                    <span>Subtotal ({cantidadTotal} artículos)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="detalle-linea">
                    <span>Envío</span>
                    <span className={costoEnvio === 0 ? 'envio-gratis' : ''}>
                      {costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {subtotal < 500 && (
                    <div className="envio-gratis-info">
                      <p>Agrega ${(500 - subtotal).toFixed(2)} más para <strong>envío gratis</strong></p>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${Math.min((subtotal / 500) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="detalle-linea total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className="btn-checkout"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  <Lock size={20} />
                  Proceder al Pago
                </button>
                
                <div className="garantias">
                  <div className="garantia-item">
                    <Shield size={16} />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="garantia-item">
                    <Truck size={16} />
                    <span>Envío gratis en compras +$500</span>
                  </div>
                  <div className="garantia-item">
                    <RotateCcw size={16} />
                    <span>30 días para devoluciones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continuar comprando */}
          <div className="continuar-comprando">
            <Link to="/juegos" className="btn-continuar">
              <ArrowLeft size={20} />
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Actualizando carrito...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
