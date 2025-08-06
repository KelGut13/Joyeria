import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import "./estilos/ProductoDetalle.css";
import Separar from "../componentes/Separador NavBar/Separador";
import { getFirstProductImage, getProductImages, API_ENDPOINTS } from '../config/api';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        setLoading(true);
        console.log(`🔍 Obteniendo producto con ID: ${id}`);

        const response = await fetch(API_ENDPOINTS.PRODUCTO_BY_ID(id));
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Producto no encontrado");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        console.log("✅ Producto obtenido:", data);
        setProducto(data);

        // Obtener productos relacionados de la misma categoría
        await obtenerProductosRelacionados(data.id_categoria, data.ID_producto);
        
        setError(null);
      } catch (err) {
        console.error("❌ Error al obtener producto:", err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      obtenerProducto();
    }
  }, [id]);

  const obtenerProductosRelacionados = async (categoriaId, productoId) => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTOS);
      if (response.ok) {
        const productos = await response.json();
        const relacionados = productos
          .filter(p => p.id_categoria === categoriaId && p.ID_producto !== productoId)
          .slice(0, 4);
        setProductosRelacionados(relacionados);
      }
    } catch (err) {
      console.error("❌ Error al obtener productos relacionados:", err);
    }
  };

  const handleImagenClick = (index) => {
    setImagenSeleccionada(index);
  };

  const handleCantidadChange = (increment) => {
    setCantidad(prev => {
      const nueva = prev + increment;
      return nueva >= 1 && nueva <= (producto?.stock || 1) ? nueva : prev;
    });
  };

  const handleAgregarCarrito = () => {
    // TODO: Implementar lógica del carrito
    console.log(`Agregando ${cantidad} unidades del producto ${id} al carrito`);
    alert(`${cantidad} ${producto.nombre} agregado(s) al carrito`);
  };

  const handleToggleFavorito = () => {
    setFavorito(!favorito);
    // TODO: Implementar lógica de favoritos
  };

  const handleCompartir = async () => {
    if (navigator.share && producto) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: producto.descripcion,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error al compartir:", err);
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("URL copiada al portapapeles");
    }
  };

  const obtenerImagenes = () => {
    return getProductImages(producto);
  };

  const obtenerNombreCategoria = (categoriaId) => {
    const categorias = {
      1: "Aretes",
      2: "Anillos", 
      3: "Collares",
      4: "Pulseras"
    };
    return categorias[categoriaId] || "Producto";
  };

  if (loading) {
    return (
      <div className="producto-detalle-page">
        <Separar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="producto-detalle-page">
        <Separar />
        <div className="error-container">
          <h2>❌ {error || "Producto no encontrado"}</h2>
          <p>El producto que buscas no está disponible.</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ChevronLeft size={20} />
              Volver
            </button>
            <Link to="/" className="btn-primary">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imagenes = obtenerImagenes();

  return (
    <div className="producto-detalle-page">
      <Separar />
      
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <div className="container">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to={`/${obtenerNombreCategoria(producto.id_categoria).toLowerCase()}`}>
            {obtenerNombreCategoria(producto.id_categoria)}
          </Link>
          <span>/</span>
          <span>{producto.nombre}</span>
        </div>
      </nav>

      {/* Botón volver */}
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-volver">
          <ChevronLeft size={20} />
          Volver
        </button>
      </div>

      {/* Contenido principal */}
      <div className="producto-detalle-content">
        <div className="container">
          <div className="producto-grid">
            
            {/* Galería de imágenes */}
            <div className="producto-galeria">
              <div className="imagen-principal">
                <img
                  src={imagenes[imagenSeleccionada]}
                  alt={producto.nombre}
                  onError={(e) => {
                    e.target.src = "/logo192.png";
                  }}
                />
                <button 
                  className={`btn-favorito ${favorito ? 'activo' : ''}`}
                  onClick={handleToggleFavorito}
                >
                  <Heart size={24} fill={favorito ? '#ef4444' : 'none'} />
                </button>
              </div>
              
              {imagenes.length > 1 && (
                <div className="imagenes-thumbnail">
                  {imagenes.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === imagenSeleccionada ? 'activo' : ''}`}
                      onClick={() => handleImagenClick(index)}
                    >
                      <img
                        src={img}
                        alt={`${producto.nombre} ${index + 1}`}
                        onError={(e) => {
                          e.target.src = "/logo192.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="producto-info">
              <div className="producto-header">
                <span className="categoria-badge">
                  {obtenerNombreCategoria(producto.id_categoria)}
                </span>
                <h1>{producto.nombre}</h1>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
                  ))}
                  <span>(4.8) • 127 reseñas</span>
                </div>
              </div>

              <div className="precio-section">
                <span className="precio">${producto.precio}</span>
                <span className="precio-antes">$1,299.00</span>
                <span className="descuento">-15%</span>
              </div>

              <div className="descripcion">
                <p>{producto.descripcion}</p>
              </div>

              <div className="detalles-producto">
                <div className="detalle-item">
                  <span className="label">Stock disponible:</span>
                  <span className="valor">{producto.stock} unidades</span>
                </div>
                <div className="detalle-item">
                  <span className="label">SKU:</span>
                  <span className="valor">PRD-{producto.ID_producto.toString().padStart(6, '0')}</span>
                </div>
              </div>

              {/* Controles de compra */}
              <div className="compra-section">
                <div className="cantidad-selector">
                  <label>Cantidad:</label>
                  <div className="cantidad-controls">
                    <button 
                      onClick={() => handleCantidadChange(-1)}
                      disabled={cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{cantidad}</span>
                    <button 
                      onClick={() => handleCantidadChange(1)}
                      disabled={cantidad >= producto.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="botones-accion">
                  <button 
                    className="btn-agregar-carrito"
                    onClick={handleAgregarCarrito}
                    disabled={producto.stock === 0}
                  >
                    <ShoppingCart size={20} />
                    {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                  
                  <button className="btn-comprar-ahora">
                    Comprar ahora
                  </button>
                </div>

                <button className="btn-compartir" onClick={handleCompartir}>
                  <Share2 size={18} />
                  Compartir producto
                </button>
              </div>

              {/* Garantías y envío */}
              <div className="garantias">
                <div className="garantia-item">
                  <Truck size={24} />
                  <div>
                    <h4>Envío gratis</h4>
                    <p>En pedidos mayores a $500</p>
                  </div>
                </div>
                <div className="garantia-item">
                  <Shield size={24} />
                  <div>
                    <h4>Garantía de calidad</h4>
                    <p>12 meses de garantía</p>
                  </div>
                </div>
                <div className="garantia-item">
                  <RotateCcw size={24} />
                  <div>
                    <h4>Devoluciones</h4>
                    <p>30 días para cambios</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {productosRelacionados.length > 0 && (
        <section className="productos-relacionados">
          <div className="container">
            <h2>Productos relacionados</h2>
            <div className="productos-grid">
              {productosRelacionados.map((prod) => (
                <Link 
                  key={prod.ID_producto} 
                  to={`/producto/${prod.ID_producto}`}
                  className="producto-card"
                >
                  <img
                    src={getFirstProductImage(prod)}
                    alt={prod.nombre}
                    onError={(e) => {
                      e.target.src = "/logo192.png";
                    }}
                  />
                  <div className="producto-card-info">
                    <h3>{prod.nombre}</h3>
                    <p className="precio">${prod.precio}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductoDetalle;
