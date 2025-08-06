import React, { useState, useEffect } from "react";
import "./estilos/Juegos.css";
import { Link } from "react-router-dom";
import { useCarrito } from '../context/CarritoContext';
import { getFirstProductImage, API_ENDPOINTS } from '../config/api';
import { Filter, X, Search, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

const Juegos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtrosMovilAbierto, setFiltrosMovilAbierto] = useState(false);
  
  // Estado para controlar qué secciones de filtro están expandidas
  const [filtrosExpandidos, setFiltrosExpandidos] = useState({
    materiales: false,
    generos: false,
    marcas: false
  });
  
  const { agregarProducto, estaEnCarrito, obtenerItemCarrito } = useCarrito();
  
  const [filtros, setFiltros] = useState({
    materiales: [],
    generos: [],
    marcas: [],
    precioMin: '',
    precioMax: ''
  });

  useEffect(() => {
    // Obtener productos, materiales, géneros y marcas de la base de datos
    const obtenerDatos = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        setLoading(true);
        console.log(`🔄 Intento ${retryCount + 1} de obtener datos...`);
        
        const [productosResponse, materialesResponse, generosResponse, marcasResponse] = await Promise.all([
          fetch(API_ENDPOINTS.PRODUCTOS, {
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(API_ENDPOINTS.MATERIALES, {
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(API_ENDPOINTS.GENEROS, {
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(API_ENDPOINTS.MARCAS, {
            headers: { 'Content-Type': 'application/json' }
          })
        ]);
        
        if (!productosResponse.ok || !materialesResponse.ok || !generosResponse.ok || !marcasResponse.ok) {
          throw new Error(`HTTP error! status: ${productosResponse.status}`);
        }

        const [productosData, materialesData, generosData, marcasData] = await Promise.all([
          productosResponse.json(),
          materialesResponse.json(),
          generosResponse.json(),
          marcasResponse.json()
        ]);
        
        console.log("✅ Productos obtenidos:", productosData);
        console.log("✅ Materiales obtenidos:", materialesData);
        console.log("✅ Géneros obtenidos:", generosData);
        console.log("✅ Marcas obtenidas:", marcasData);

        // Para juegos, filtrar productos que contengan "juego", "set" o "colección" en el nombre
        // Si no hay productos específicos, mostrar productos de collares (categoria 3) como sets
        const juegosPorNombre = productosData.filter((producto) => 
          producto.nombre.toLowerCase().includes('juego') || 
          producto.nombre.toLowerCase().includes('set') ||
          producto.nombre.toLowerCase().includes('colección') ||
          producto.nombre.toLowerCase().includes('conjunto')
        );
        
        // Si no hay productos específicos de "juegos", usar productos de collares como alternativa
        const productosParaJuegos = juegosPorNombre.length > 0 
          ? juegosPorNombre 
          : productosData.filter((producto) => producto.id_categoria === 3);
        
        console.log("🔍 Juegos filtrados:", productosParaJuegos);
        
        setProductos(productosParaJuegos);
        setProductosFiltrados(productosParaJuegos);
        setMateriales(materialesData);
        setGeneros(generosData);
        setMarcas(marcasData);
        setError(null);
      } catch (err) {
        console.error(`❌ Error al cargar datos (intento ${retryCount + 1}):`, err);
        
        if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
          if (retryCount < maxRetries) {
            console.log(`🔄 Reintentando en 3 segundos... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              obtenerDatos(retryCount + 1);
            }, 3000);
            return;
          }
          setError("No se pudo conectar con el servidor. Verifique su conexión a internet.");
        } else {
          setError(`Error al cargar datos: ${err.message}`);
        }
      } finally {
        if (retryCount === 0 || retryCount >= maxRetries) {
          setLoading(false);
        }
      }
    };

    obtenerDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, productos]);

  // Limpiar overflow del body al desmontar componente
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const aplicarFiltros = () => {
    let productosFiltrados = [...productos];

    if (filtros.materiales.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        filtros.materiales.includes(producto.id_material)
      );
    }

    if (filtros.generos.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        filtros.generos.includes(producto.id_genero)
      );
    }

    if (filtros.marcas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        filtros.marcas.includes(producto.id_marca)
      );
    }

    if (filtros.precioMin !== '') {
      productosFiltrados = productosFiltrados.filter(producto =>
        parseFloat(producto.precio) >= parseFloat(filtros.precioMin)
      );
    }

    if (filtros.precioMax !== '') {
      productosFiltrados = productosFiltrados.filter(producto =>
        parseFloat(producto.precio) <= parseFloat(filtros.precioMax)
      );
    }

    setProductosFiltrados(productosFiltrados);
  };

  const handleMaterialChange = (materialId) => {
    setFiltros(prev => ({
      ...prev,
      materiales: prev.materiales.includes(materialId)
        ? prev.materiales.filter(id => id !== materialId)
        : [...prev.materiales, materialId]
    }));
  };

  const handleGeneroChange = (generoId) => {
    setFiltros(prev => ({
      ...prev,
      generos: prev.generos.includes(generoId)
        ? prev.generos.filter(id => id !== generoId)
        : [...prev.generos, generoId]
    }));
  };

  const handleMarcaChange = (marcaId) => {
    setFiltros(prev => ({
      ...prev,
      marcas: prev.marcas.includes(marcaId)
        ? prev.marcas.filter(id => id !== marcaId)
        : [...prev.marcas, marcaId]
    }));
  };

  const handlePrecioChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      materiales: [],
      generos: [],
      marcas: [],
      precioMin: '',
      precioMax: ''
    });
  };

  const toggleFiltroExpandido = (categoria) => {
    setFiltrosExpandidos(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  const renderFiltroCategoria = (items, categoria, filtroActivo, handleChange, labelKey, idKey) => {
    const itemsLimitados = filtrosExpandidos[categoria] ? items : items.slice(0, 3);
    const mostrarVerMas = items.length > 3;

    // Función para obtener el nombre correcto de la categoría
    const getNombreCategoria = (categoria) => {
      switch(categoria) {
        case 'materiales':
          return 'Material';
        case 'generos':
          return 'Género';
        case 'marcas':
          return 'Marca';
        default:
          return categoria.charAt(0).toUpperCase() + categoria.slice(1);
      }
    };

    return (
      <div className="filtro-categoria">
        <div className="filtro-header" onClick={() => toggleFiltroExpandido(categoria)}>
          <label>{getNombreCategoria(categoria)}</label>
          {mostrarVerMas && (
            filtrosExpandidos[categoria] ? 
            <ChevronUp size={20} className="filtro-icono" /> : 
            <ChevronDown size={20} className="filtro-icono" />
          )}
        </div>
        <ul>
          {itemsLimitados.map((item) => (
            <li key={item[idKey]}>
              <input 
                type="checkbox" 
                id={`${categoria}-${item[idKey]}`}
                checked={filtroActivo.includes(item[idKey])}
                onChange={() => handleChange(item[idKey])}
              />
              <label htmlFor={`${categoria}-${item[idKey]}`}>
                {item[labelKey]}
              </label>
            </li>
          ))}
        </ul>
        {mostrarVerMas && !filtrosExpandidos[categoria] && (
          <button 
            className="ver-mas-btn"
            onClick={() => toggleFiltroExpandido(categoria)}
          >
            Ver más ({items.length - 3} más)
          </button>
        )}
      </div>
    );
  };

  const handleAgregarAlCarrito = async (e, producto) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (estaEnCarrito(producto.ID_producto)) {
      return;
    }

    try {
      await agregarProducto(producto);
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
    }
  };

  const toggleFiltrosMovil = () => {
    const nuevoEstado = !filtrosMovilAbierto;
    setFiltrosMovilAbierto(nuevoEstado);
    
    // Controlar overflow del body para evitar scroll en el fondo
    if (nuevoEstado) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('filtros-abiertos');
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('filtros-abiertos');
    }
  };

  return (
    <div className="juegos-page">
      {/* Hero Banner */}
      <div className="banner-juegos">
        <img src="../7.png" alt="Colección de Juegos de Joyería" />
        <h2>Juegos de Joyería</h2>
      </div>

      <div className="contenido-juegos">
        {/* Overlay para filtros móvil */}
        {filtrosMovilAbierto && (
          <div 
            className="filtros-overlay"
            onClick={toggleFiltrosMovil}
          />
        )}
        
        {/* Filtros Sidebar */}
        <aside className={`filtros ${filtrosMovilAbierto ? 'filtros-movil-activo' : ''}`}>
          {filtrosMovilAbierto && (
            <button 
              className="cerrar-filtros-movil"
              onClick={toggleFiltrosMovil}
              aria-label="Cerrar filtros"
              title="Cerrar filtros"
            >
              <X size={24} />
            </button>
          )}
          
          <div className="filtros-contenido">
            <div className="filtros-header-movil">
              <h3>
                Filtrar por
              </h3>
              {filtrosMovilAbierto && (
                <span className="filtros-instruccion">
                  Toca fuera para cerrar
                </span>
              )}
            </div>

          {renderFiltroCategoria(
            materiales, 
            'materiales', 
            filtros.materiales, 
            handleMaterialChange, 
            'nombre_material', 
            'ID_material'
          )}

          {renderFiltroCategoria(
            generos, 
            'generos', 
            filtros.generos, 
            handleGeneroChange, 
            'nombre_genero', 
            'ID_genero'
          )}

          {renderFiltroCategoria(
            marcas, 
            'marcas', 
            filtros.marcas, 
            handleMarcaChange, 
            'nombre_marca', 
            'ID_marca'
          )}

          <div className="filtro-precio">
            <label>Precio</label>
            <div className="rango-precio">
              <input 
                type="number" 
                placeholder="Precio mínimo" 
                value={filtros.precioMin}
                onChange={(e) => handlePrecioChange('precioMin', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Precio máximo" 
                value={filtros.precioMax}
                onChange={(e) => handlePrecioChange('precioMax', e.target.value)}
              />
            </div>
            <button className="actualizar-precio" onClick={aplicarFiltros}>
              Actualizar precio
            </button>
          </div>

          <div className="filtro-acciones">
            <button className="limpiar-filtros" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        </div> {/* Cierre de filtros-contenido */}
        </aside>

        {/* Products Grid */}
        <section className="productos">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>⚠️ {error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Reintentar
              </button>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-container">
              <Search size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
              <p>No se encontraron productos con los filtros seleccionados</p>
              <button onClick={limpiarFiltros} className="retry-btn">
                Limpiar filtros
              </button>
            </div>
          ) : (
            productosFiltrados.map((producto) => (
              <div className="producto" key={producto.ID_producto}>
                <div className="producto-badge">Nuevo</div>
                
                <Link to={`/producto/${producto.ID_producto}`}>
                  <img
                    src={getFirstProductImage(producto)}
                    alt={producto.nombre}
                    onError={(e) => {
                      e.target.src = "/logo192.png";
                    }}
                  />
                  
                  <div className="producto-info">
                    <p>{producto.nombre}</p>
                    <span>${parseFloat(producto.precio).toFixed(2)}</span>
                  </div>
                </Link>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => handleAgregarAlCarrito(e, producto)}
                  disabled={estaEnCarrito(producto.ID_producto)}
                >
                  {estaEnCarrito(producto.ID_producto) ? (
                    <>
                      <ShoppingBag size={16} style={{ marginRight: '0.5rem' }} />
                      En el carrito
                    </>
                  ) : (
                    'Agregar al carrito'
                  )}
                </button>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Products Counter */}
      {!loading && !error && productosFiltrados.length > 0 && (
        <div className="productos-counter">
          <span>Mostrando {productosFiltrados.length} producto(s)</span>
        </div>
      )}

      {/* Mobile Filter Toggle */}
      <button 
        className="filtros-toggle"
        onClick={toggleFiltrosMovil}
        title="Filtros"
      >
        <Filter size={20} />
      </button>
    </div>
  );
};

export default Juegos;