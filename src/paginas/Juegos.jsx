import React, { useState, useEffect } from "react";
import "./estilos/Juegos.css";
import { Link } from "react-router-dom";
import { useCarrito } from '../context/CarritoContext';
import { getFirstProductImage, API_ENDPOINTS } from '../config/api';

const Juegos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  const handleAgregarAlCarrito = (e, producto) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Verificar que el producto tenga todos los campos necesarios
      if (!producto.ID_producto || !producto.nombre || !producto.precio || !producto.stock) {
        throw new Error('Datos de producto incompletos');
      }

      agregarProducto(producto, 1);
      
      // Mostrar confirmación más amigable
      alert(`${producto.nombre} agregado al carrito exitosamente`);
      
      console.log('Producto agregado al carrito:', producto);
      console.log('Estado actual del carrito después de agregar:', {
        estaEnCarrito: estaEnCarrito(producto.ID_producto),
        itemCarrito: obtenerItemCarrito(producto.ID_producto)
      });
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert(`Error: ${error.message}`);
    }
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

  return (
    <div className="juegos-page">
      {/* Banner principal */}
      <div className="banner-juegos">
        <img src="../7.png" alt="Banner Juegos" />
      </div>

      <div className="contenido-juegos">
        {/* Filtros */}
        <aside className="filtros">
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
              <button className="actualizar-precio" onClick={aplicarFiltros}>
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
              <p style={{ color: "red" }}>⚠️ {error}</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-container">
              <p>🔍 No hay juegos disponibles con los filtros seleccionados.</p>
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
                    <span>${producto.precio}</span>
                  </div>
                </Link>
                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAgregarAlCarrito(e, producto)}
                  >
                    {estaEnCarrito(producto.ID_producto) ? 'En el carrito' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
        
        {!loading && !error && productosFiltrados.length > 0 && (
          <div className="productos-counter">
            <span>{productosFiltrados.length} producto(s) encontrado(s)</span>
          </div>
        )}
      </div>

      {/* Botón mostrar más */}
      <div className="mostrar-mas-contenedor">
        <button className="mostrar-mas-btn">Mostrar más</button>
      </div>
    </div>
  );
};

export default Juegos;