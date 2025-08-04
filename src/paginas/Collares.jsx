import React, { useState, useEffect } from "react";
import "./estilos/Productos.css";
import Separar from "../componentes/Separador NavBar/Separador";
import { Link } from "react-router-dom";
import { useCarrito } from '../context/CarritoContext';
import { getFirstProductImage, API_ENDPOINTS } from '../config/api';

const Collares = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filtros, setFiltros] = useState({
    materiales: [],
    generos: [],
    marcas: [],
    precioMin: '',
    precioMax: ''
  });

  const { agregarProducto, estaEnCarrito, obtenerItemCarrito } = useCarrito();

  useEffect(() => {
    const obtenerDatos = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        setLoading(true);
        console.log(`🔄 Cargando collares - Intento ${retryCount + 1}...`);
        
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
        
        // Filtrar solo collares (categoria ID = 3)
        const collares = productosData.filter((producto) => producto.id_categoria === 3);
        console.log("📿 Collares encontrados:", collares);
        
        setProductos(collares);
        setProductosFiltrados(collares);
        setMateriales(materialesData);
        setGeneros(generosData);
        setMarcas(marcasData);
        setError(null);
      } catch (err) {
        console.error(`❌ Error al cargar collares (intento ${retryCount + 1}):`, err);
        
        if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
          if (retryCount < maxRetries) {
            setTimeout(() => obtenerDatos(retryCount + 1), 3000);
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

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, productos]);

  const aplicarFiltros = () => {
    let productosFiltrados = [...productos];

    // Filtro por materiales
    if (filtros.materiales.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        filtros.materiales.includes(producto.id_material)
      );
    }

    // Filtro por géneros
    if (filtros.generos.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        filtros.generos.includes(producto.id_genero)
      );
    }

    // Filtro por marcas
    if (filtros.marcas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        filtros.marcas.includes(producto.id_marca)
      );
    }

    // Filtro por precio
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

  const actualizarPrecio = () => {
    aplicarFiltros();
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

  // Cierra los filtros al cambiar el tamaño de pantalla a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMostrarFiltros(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handleAgregarAlCarrito = (e, producto) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!producto.ID_producto || !producto.nombre || !producto.precio || !producto.stock) {
        throw new Error('Datos de producto incompletos');
      }

      agregarProducto(producto, 1);
      alert(`✅ ${producto.nombre} agregado al carrito exitosamente`);
      
      console.log('Producto agregado al carrito:', producto);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="productos-page">
      <Separar />
      
      <div className="banner-productos collares-banner">
        <img src="../9.png" alt="Banner Collares" />
        <div className="banner-overlay">
          <h2>📿 Collares que realzan tu elegancia natural</h2>
        </div>
      </div>

      {/* Botón Filtro solo en móvil */}
      <button
        className="btn-filtro-movil"
        onClick={() => setMostrarFiltros((prev) => !prev)}
      >
        {mostrarFiltros ? "Cerrar filtros" : "Filtro"}
      </button>

      <div className="contenido-productos">
        {/* Filtros */}
        <aside
          className={`filtros ${
            mostrarFiltros ? "filtros-movil-activo" : ""
          }`}
        >
          <h3>Filtrar por:</h3>

          <div className="filtro-categoria">
            <label>Material</label>
            <ul>
              {materiales.map((material) => (
                <li key={material.ID_material}>
                  <input 
                    type="checkbox" 
                    id={`material-${material.ID_material}`}
                    checked={filtros.materiales.includes(material.ID_material)}
                    onChange={() => handleMaterialChange(material.ID_material)}
                  />
                  <label htmlFor={`material-${material.ID_material}`}>
                    {material.nombre_material}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filtro-categoria">
            <label>Género</label>
            <ul>
              {generos.map((genero) => (
                <li key={genero.ID_genero}>
                  <input 
                    type="checkbox" 
                    id={`genero-${genero.ID_genero}`}
                    checked={filtros.generos.includes(genero.ID_genero)}
                    onChange={() => handleGeneroChange(genero.ID_genero)}
                  />
                  <label htmlFor={`genero-${genero.ID_genero}`}>
                    {genero.nombre_genero}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filtro-categoria">
            <label>Marca</label>
            <ul>
              {marcas.map((marca) => (
                <li key={marca.ID_marca}>
                  <input 
                    type="checkbox" 
                    id={`marca-${marca.ID_marca}`}
                    checked={filtros.marcas.includes(marca.ID_marca)}
                    onChange={() => handleMarcaChange(marca.ID_marca)}
                  />
                  <label htmlFor={`marca-${marca.ID_marca}`}>
                    {marca.nombre_marca}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filtro-precio">
            <label>Precio</label>
            <div className="rango-precio">
              <input 
                type="number" 
                placeholder="Min" 
                value={filtros.precioMin}
                onChange={(e) => handlePrecioChange('precioMin', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={filtros.precioMax}
                onChange={(e) => handlePrecioChange('precioMax', e.target.value)}
              />
              <button className="actualizar-precio" onClick={actualizarPrecio}>
                Actualizar
              </button>
            </div>
          </div>

          <div className="filtro-acciones">
            <button className="limpiar-filtros" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        </aside>

        {/* Productos */}
        <section className="productos">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p style={{ color: "red" }}>
                ⚠️ {error}
                <br />
                <button 
                  onClick={handleRetry} 
                  className="retry-btn"
                >
                  Intentar de nuevo
                </button>
              </p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-container">
              <p>🔍 No hay collares disponibles con los filtros seleccionados.</p>
              <button onClick={limpiarFiltros} className="retry-btn">
                Limpiar filtros
              </button>
            </div>
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
                  onError={(e) => {
                    e.target.src = "/logo192.png";
                  }}
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
          
          {/* Mostrar contador fuera de la grid */}
          {!loading && !error && productosFiltrados.length > 0 && (
            <div className="productos-counter">
              <span>{productosFiltrados.length} collar(es) encontrado(s)</span>
            </div>
          )}
        </section>
      </div>

      {/* Botón mostrar más */}
      <div className="mostrar-mas-contenedor">
        <button className="mostrar-mas-btn">Mostrar más</button>
      </div>
    </div>
  );
};

export default Collares;

/* Actualizar el producto "Anillo" para que tenga la categoría correcta
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 4;
*/