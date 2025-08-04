import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';

const CarritoIconoSimple = () => {
  const { cantidadItems } = useCarrito();
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('Navegando a /carrito...');
    navigate('/carrito');
  };

  return (
    <button 
      onClick={handleClick}
      className="carrito-icono-simple"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <ShoppingCart size={24} />
      {cantidadItems > 0 && (
        <span 
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          {cantidadItems > 99 ? '99+' : cantidadItems}
        </span>
      )}
    </button>
  );
};

export default CarritoIconoSimple;
