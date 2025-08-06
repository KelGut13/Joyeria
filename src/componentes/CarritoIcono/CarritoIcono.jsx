import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';
import './CarritoIcono.css';
import { getFirstProductImage } from '../../config/api';

const CarritoIcono = () => {
  const navigate = useNavigate();
  const { items, cantidadItems, subtotal, eliminarProducto } = useCarrito();
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const handleVerCarritoCompleto = () => {
    setMostrarDropdown(false);
    navigate('/carrito');
  };

  const handleCheckoutRapido = () => {
    setMostrarDropdown(false);
    const token = localStorage.getItem('token');
    
    if (!token) {
      if (window.confirm('Debes iniciar sesión para continuar con la compra. ¿Quieres ir al login?')) {
        navigate('/login');
      }
      return;
    }
    
    navigate('/checkout');
  };

  const handleEliminarDelDropdown = async (e, productoId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await eliminarProducto(productoId);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setMostrarDropdown(!mostrarDropdown);
  };

  const handleCarritoClick = (e) => {
    // Si se mantiene presionado por más tiempo, navegar al carrito
    if (e.detail === 2) { // Doble clic
      navigate('/carrito');
    } else {
      toggleDropdown(e);
    }
  };

  return (
    <div 
      className="carrito-contenedor"
      onMouseEnter={() => setMostrarDropdown(true)}
      onMouseLeave={() => setMostrarDropdown(false)}
    >
      <button 
        onClick={handleCarritoClick}
        className="carrito-icono"
        title="Clic para abrir/cerrar - Doble clic para ir al carrito"
      >
        <ShoppingBag size={20} strokeWidth={1.8} />
        {cantidadItems > 0 && (
          <span className="carrito-badge">{cantidadItems}</span>
        )}
      </button>

      {mostrarDropdown && items.length > 0 && (
        <div className="carrito-dropdown">
          <div className="carrito-dropdown-header">
            <h4>Carrito ({cantidadItems} {cantidadItems === 1 ? 'artículo' : 'artículos'})</h4>
          </div>
          
          <div className="carrito-dropdown-items">
            {items.slice(0, 3).map(item => (
              <div key={item.ID_producto} className="carrito-dropdown-item">
                <img 
                  src={getFirstProductImage(item)}
                  alt={item.nombre}
                  onError={(e) => { e.target.src = "/logo192.png"; }}
                />
                <div className="item-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-precio">
                    {item.cantidad} x ${item.precio}
                  </span>
                </div>
                <button 
                  className="btn-eliminar-dropdown"
                  onClick={(e) => handleEliminarDelDropdown(e, item.ID_producto)}
                  title="Eliminar del carrito"
                >
                  ×
                </button>
              </div>
            ))}
            
            {items.length > 3 && (
              <div className="carrito-dropdown-mas">
                +{items.length - 3} artículo(s) más
              </div>
            )}
          </div>
          
          <div className="carrito-dropdown-footer">
            <div className="carrito-total">
              <strong>Subtotal: ${subtotal.toFixed(2)}</strong>
            </div>
            <button 
              className="btn-ver-carrito"
              onClick={handleVerCarritoCompleto}
            >
              Ver carrito completo
            </button>
            <button 
              className="btn-checkout-rapido"
              onClick={handleCheckoutRapido}
            >
              Finalizar compra
            </button>
          </div>
        </div>
      )}

      {mostrarDropdown && items.length === 0 && (
        <div className="carrito-dropdown carrito-vacio">
          <div className="carrito-vacio-mensaje">
            <ShoppingBag size={32} strokeWidth={1.5} />
            <p>Tu carrito está vacío</p>
            <Link to="/" className="btn-explorar-carrito" onClick={() => setMostrarDropdown(false)}>
              Explorar productos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoIcono;
