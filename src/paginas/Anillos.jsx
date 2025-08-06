import React, { useState, useEffect } from "react";
import "./estilos/Productos.css";
import Separar from "../componentes/Separador NavBar/Separador";
import { Link } from "react-router-dom";
import { useCarrito } from '../context/CarritoContext';
import { getFirstProductImage, API_ENDPOINTS } from '../config/api';

const Anillos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { agregarProducto, estaEnCarrito } = useCarrito();

  useEffect(() => {
    const obtenerAnillos = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCTOS);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        // Filtrar solo anillos (categoria ID = 2)
        const anillos = productos.filter(producto => producto.id_categoria === 2);
        
        setProductos(anillos);
        setProductosFiltrados(anillos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerAnillos();
  }, []);

  const handleAgregarAlCarrito = async (e, producto) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await agregarProducto(producto, 1);
      alert(`✅ ${producto.nombre} agregado al carrito`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (loading) return <div className="loading-container"><p>Cargando anillos...</p></div>;
  if (error) return <div className="error-container"><p>Error: {error}</p></div>;

  return (
    <div className="productos-page">
      <Separar />
      
      <div className="banner-productos anillos-banner">
        <div className="banner-overlay">
          <h2>💍 Anillos que simbolizan momentos únicos</h2>
        </div>
      </div>

      <div className="contenido-productos">
        <section className="productos">
          {productosFiltrados.length === 0 ? (
            <p>No hay anillos disponibles.</p>
          ) : (
            productosFiltrados.map((producto) => (
              <Link 
                to={`/producto/${producto.ID_producto}`}
                className="producto" 
                key={producto.ID_producto}
              >
                <div className="producto-badge">Nuevo</div>
                <img
                  src={getFirstProductImage(producto)}
                  alt={producto.nombre}
                  onError={(e) => { e.target.src = "/placeholder-jewelry.svg"; }}
                />
                <div className="producto-info">
                  <p>{producto.nombre}</p>
                  <span>${producto.precio}</span>
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAgregarAlCarrito(e, producto)}
                  >
                    {estaEnCarrito(producto.ID_producto) ? 'En el carrito' : 'Agregar al carrito'}
                  </button>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default Anillos;