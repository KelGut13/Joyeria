import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';
import './CarritoIcono.css';

const CarritoIcono = () => {
  const { items, cantidadItems, subtotal } = useCarrito();
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  return (
    <div 
      className="carrito-contenedor"
      onMouseEnter={() => setMostrarDropdown(true)}
      onMouseLeave={() => setMostrarDropdown(false)}
    >
      <Link to="/carrito" className="carrito-icono">
        <i className="fas fa-shopping-cart"></i>
        {cantidadItems > 0 && (
          <span className="carrito-badge">{cantidadItems}</span>
        )}
      </Link>

      {mostrarDropdown && items.length > 0 && (
        <div className="carrito-dropdown">
          <div className="carrito-dropdown-header">
            <h4>Carrito ({cantidadItems} {cantidadItems === 1 ? 'artículo' : 'artículos'})</h4>
          </div>
          
          <div className="carrito-dropdown-items">
            {items.slice(0, 3).map(item => (
              <div key={item.ID_producto} className="carrito-dropdown-item">
                <img 
                  src={
                    item.imagen
                      ? Array.isArray(item.imagen)
                        ? item.imagen[0]
                        : item.imagen.split(",")[0]
                      : "/placeholder.jpg"
                  }
                  alt={item.nombre}
                  onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />
                <div className="item-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-precio">
                    {item.cantidad} x ${item.precio}
                  </span>
                </div>
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
            <Link 
              to="/carrito" 
              className="btn-ver-carrito"
              onClick={() => setMostrarDropdown(false)}
            >
              Ver carrito completo
            </Link>
            <Link 
              to="/checkout" 
              className="btn-checkout-rapido"
              onClick={() => setMostrarDropdown(false)}
            >
              Finalizar compra
            </Link>
          </div>
        </div>
      )}

      {mostrarDropdown && items.length === 0 && (
        <div className="carrito-dropdown carrito-vacio">
          <div className="carrito-vacio-mensaje">
            <i className="fas fa-shopping-cart"></i>
            <p>Tu carrito está vacío</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoIcono;
