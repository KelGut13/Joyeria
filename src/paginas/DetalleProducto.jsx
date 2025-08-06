import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { API_ENDPOINTS, getProductImages } from '../config/api';
import './estilos/DetalleProducto.css';
import Separar from '../componentes/Separador NavBar/Separador';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarProducto, estaEnCarrito } = useCarrito();
  
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PRODUCTO_BY_ID(id));
        
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

  // Effect para navegación con teclado
  useEffect(() => {
    if (!producto) return;
    
    const imagenes = getProductImages(producto);
    
    const handleKeyPress = (event) => {
      if (imagenes.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        setImagenActual(prev => prev === 0 ? imagenes.length - 1 : prev - 1);
      } else if (event.key === 'ArrowRight') {
        setImagenActual(prev => prev === imagenes.length - 1 ? 0 : prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [producto, imagenActual]);

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

  // Funciones para manejar swipe en móviles
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (producto && getProductImages(producto).length > 1) {
      if (isLeftSwipe) {
        // Swipe izquierda - siguiente imagen
        setImagenActual(prev => prev === getProductImages(producto).length - 1 ? 0 : prev + 1);
      }
      if (isRightSwipe) {
        // Swipe derecha - imagen anterior
        setImagenActual(prev => prev === 0 ? getProductImages(producto).length - 1 : prev - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="DetallePedido-page">
        <Separar />
        <div className="DetallePedido-container">
          <div className="DetallePedido-loading">
            <div className="DetallePedido-loadingSpinner"></div>
            <p>Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="DetallePedido-page">
        <Separar />
        <div className="DetallePedido-container">
          <div className="DetallePedido-error">
            <div className="DetallePedido-errorIcon">⚠️</div>
            <h2>Error: {error}</h2>
            <button className="DetallePedido-errorBtn" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="DetallePedido-page">
        <Separar />
        <div className="DetallePedido-container">
          <div className="DetallePedido-error">
            <div className="DetallePedido-errorIcon">❌</div>
            <h2>Producto no encontrado</h2>
            <button className="DetallePedido-errorBtn" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imagenes = getProductImages(producto);
  
  // Debug: Imprimir información de las imágenes
  console.log('🖼️ Producto:', producto.nombre);
  console.log('📷 Campo imagen original:', producto.imagen);
  console.log('🎯 Imágenes procesadas:', imagenes);
  console.log('📊 Total de imágenes:', imagenes.length);

  return (
    <div className="DetallePedido-page">
      <Separar />
      <div className="DetallePedido-container">
        <button className="DetallePedido-btnVolver" onClick={() => navigate(-1)}>
          <span className="DetallePedido-btnVolverIcon">←</span>
          <span>Volver</span>
        </button>

        <div className="DetallePedido-content">
          <div className="DetallePedido-imageSection">
            <div 
              className="DetallePedido-mainImage"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={imagenes[imagenActual]} 
                alt={producto.nombre}
                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                className="DetallePedido-mainImageImg"
              />
              <div className="DetallePedido-imageOverlay">
                <div className="DetallePedido-imageCounter">
                  {imagenActual + 1} / {imagenes.length}
                </div>
              </div>
              
              {/* Controles de navegación de imágenes */}
              {imagenes.length > 1 && (
                <>
                  <button 
                    className="DetallePedido-imageNavBtn DetallePedido-imageNavPrev"
                    onClick={() => setImagenActual(imagenActual === 0 ? imagenes.length - 1 : imagenActual - 1)}
                    aria-label="Imagen anterior"
                  >
                    ←
                  </button>
                  <button 
                    className="DetallePedido-imageNavBtn DetallePedido-imageNavNext"
                    onClick={() => setImagenActual(imagenActual === imagenes.length - 1 ? 0 : imagenActual + 1)}
                    aria-label="Siguiente imagen"
                  >
                    →
                  </button>
                </>
              )}
            </div>
            
            {imagenes.length > 1 && (
              <div className="DetallePedido-thumbnails">
                {imagenes.map((imagen, index) => (
                  <div 
                    key={index}
                    className={`DetallePedido-thumbnail ${index === imagenActual ? 'DetallePedido-thumbnailActive' : ''}`}
                    onClick={() => setImagenActual(index)}
                  >
                    <img
                      src={imagen}
                      alt={`${producto.nombre} ${index + 1}`}
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Indicadores de puntos */}
            {imagenes.length > 1 && (
              <div className="DetallePedido-imageDots">
                {imagenes.map((_, index) => (
                  <button
                    key={index}
                    className={`DetallePedido-imageDot ${index === imagenActual ? 'DetallePedido-imageDotActive' : ''}`}
                    onClick={() => setImagenActual(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="DetallePedido-infoSection">
            <div className="DetallePedido-header">
              <h1 className="DetallePedido-title">{producto.nombre}</h1>
              <div className="DetallePedido-priceContainer">
                <span className="DetallePedido-price">${new Intl.NumberFormat('es-MX').format(producto.precio)}</span>
                <span className="DetallePedido-currency">MXN</span>
              </div>
            </div>

            <p className="DetallePedido-description">{producto.descripcion}</p>
            
            <div className="DetallePedido-stockInfo">
              <div className={`DetallePedido-stockBadge ${producto.stock > 0 ? 'DetallePedido-stockAvailable' : 'DetallePedido-stockUnavailable'}`}>
                <span className="DetallePedido-stockIcon">
                  {producto.stock > 0 ? '✓' : '✗'}
                </span>
                <span>
                  {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
                </span>
              </div>
            </div>

            {producto.stock > 0 && (
              <div className="DetallePedido-purchaseSection">
                <div className="DetallePedido-quantitySection">
                  <label className="DetallePedido-quantityLabel">Cantidad:</label>
                  <div className="DetallePedido-quantityControls">
                    <button 
                      className="DetallePedido-quantityBtn"
                      onClick={() => handleCantidadChange(cantidad - 1)}
                      disabled={cantidad <= 1}
                    >
                      −
                    </button>
                    <span className="DetallePedido-quantityValue">{cantidad}</span>
                    <button 
                      className="DetallePedido-quantityBtn"
                      onClick={() => handleCantidadChange(cantidad + 1)}
                      disabled={cantidad >= producto.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="DetallePedido-actionButtons">
                  <button 
                    className="DetallePedido-addToCartBtn"
                    onClick={handleAgregarAlCarrito}
                  >
                    <span className="DetallePedido-btnIcon">🛒</span>
                    <span>
                      {estaEnCarrito(producto.ID_producto) 
                        ? 'Actualizar carrito' 
                        : 'Agregar al carrito'
                      }
                    </span>
                  </button>

                  <button 
                    className="DetallePedido-buyNowBtn"
                    onClick={() => {
                      handleAgregarAlCarrito();
                      navigate('/carrito');
                    }}
                  >
                    <span className="DetallePedido-btnIcon">⚡</span>
                    <span>Comprar ahora</span>
                  </button>
                </div>
              </div>
            )}

            <div className="DetallePedido-guarantees">
              <h3 className="DetallePedido-guaranteesTitle">Garantías y beneficios</h3>
              <div className="DetallePedido-guaranteesList">
                <div className="DetallePedido-guaranteeItem">
                  <div className="DetallePedido-guaranteeIcon">🔒</div>
                  <div className="DetallePedido-guaranteeText">
                    <strong>Compra 100% segura</strong>
                    <small>Transacciones protegidas</small>
                  </div>
                </div>
                <div className="DetallePedido-guaranteeItem">
                  <div className="DetallePedido-guaranteeIcon">🚚</div>
                  <div className="DetallePedido-guaranteeText">
                    <strong>Envío gratis</strong>
                    <small>En compras superiores a $500</small>
                  </div>
                </div>
                <div className="DetallePedido-guaranteeItem">
                  <div className="DetallePedido-guaranteeIcon">↩️</div>
                  <div className="DetallePedido-guaranteeText">
                    <strong>30 días para devoluciones</strong>
                    <small>Sin complicaciones</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;
