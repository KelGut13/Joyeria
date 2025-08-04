import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import './estilos/DetalleProducto.css';
import Separar from '../componentes/Separador NavBar/Separador';
import { getProductImages } from '../config/api';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarProducto, estaEnCarrito, obtenerItemCarrito } = useCarrito();
  
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.curiosidadesnancy.shop/api/productos/${id}`);
        
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        
        const productoData = await response.json();
        setProducto(productoData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      obtenerProducto();
    }
  }, [id]);

  const handleAgregarAlCarrito = async () => {
    try {
      await agregarProducto(producto, cantidad);
      alert(`✅ ${producto.nombre} agregado al carrito`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleCantidadChange = (nuevaCantidad) => {
    if (nuevaCantidad >= 1 && nuevaCantidad <= producto.stock) {
      setCantidad(nuevaCantidad);
    }
  };

  if (loading) {
    return (
      <div className="detalle-producto-page">
        <Separar />
        <div className="container">
          <div className="loading">Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-producto-page">
        <Separar />
        <div className="container">
          <div className="error">
            <h2>Error: {error}</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="detalle-producto-page">
        <Separar />
        <div className="container">
          <div className="error">
            <h2>Producto no encontrado</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  const imagenes = getProductImages(producto);

  return (
    <div className="detalle-producto-page">
      <Separar />
      <div className="container">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="producto-detalle">
          <div className="producto-imagenes">
            <div className="imagen-principal">
              <img 
                src={imagenes[imagenActual]} 
                alt={producto.nombre}
                onError={(e) => { e.target.src = '/logo192.png'; }}
              />
            </div>
            
            {imagenes.length > 1 && (
              <div className="imagenes-miniatura">
                {imagenes.map((imagen, index) => (
                  <img
                    key={index}
                    src={imagen}
                    alt={`${producto.nombre} ${index + 1}`}
                    className={index === imagenActual ? 'activa' : ''}
                    onClick={() => setImagenActual(index)}
                    onError={(e) => { e.target.src = '/logo192.png'; }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="producto-info">
            <h1>{producto.nombre}</h1>
            <p className="producto-descripcion">{producto.descripcion}</p>
            
            <div className="producto-precio">
              <span className="precio">${producto.precio}</span>
            </div>

            <div className="producto-stock">
              <span className={producto.stock > 0 ? 'disponible' : 'agotado'}>
                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
              </span>
            </div>

            {producto.stock > 0 && (
              <div className="producto-compra">
                <div className="cantidad-selector">
                  <label>Cantidad:</label>
                  <div className="cantidad-control">
                    <button 
                      onClick={() => handleCantidadChange(cantidad - 1)}
                      disabled={cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{cantidad}</span>
                    <button 
                      onClick={() => handleCantidadChange(cantidad + 1)}
                      disabled={cantidad >= producto.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  className="btn-agregar-carrito"
                  onClick={handleAgregarAlCarrito}
                >
                  {estaEnCarrito(producto.ID_producto) 
                    ? 'Actualizar carrito' 
                    : 'Agregar al carrito'
                  }
                </button>

                <button 
                  className="btn-comprar-ahora"
                  onClick={() => {
                    handleAgregarAlCarrito();
                    navigate('/carrito');
                  }}
                >
                  Comprar ahora
                </button>
              </div>
            )}

            <div className="producto-garantias">
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

export default DetalleProducto;
