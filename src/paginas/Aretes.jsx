import React, { useState, useEffect } from "react";
import "./estilos/Productos.css";
import Separar from "../componentes/Separador NavBar/Separador";
import { Link } from "react-router-dom";
import { useCarrito } from '../context/CarritoContext';
import { getFirstProductImage, API_ENDPOINTS, apiRequest, checkServerHealth, checkDatabaseStructure } from '../config/api';

const Aretes = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    materiales: [],
    generos: [],
    marcas: [],
    precioMin: '',
    precioMax: ''
  });

  const { agregarProducto, estaEnCarrito, obtenerItemCarrito } = useCarrito();

  useEffect(() => {
    // Verificar conectividad del servidor al montar el componente
    const checkServer = async () => {
      console.log('🏥 Verificando estado del servidor...');
      const health = await checkServerHealth();
      setServerStatus(health.status);
      console.log('🏥 Estado del servidor:', health);
      
      if (health.status === 'ok') {
        // Si el servidor está ok, verificar también la base de datos
        console.log('🗄️ Verificando estructura de base de datos...');
        const dbCheck = await checkDatabaseStructure();
        setDebugInfo(dbCheck.data);
        console.log('🗄️ Estado de la base de datos:', dbCheck);
      } else {
        console.error('❌ Servidor no disponible:', health.message);
      }
    };
    
    checkServer();
  }, []);

  useEffect(() => {
    // Solo intentar obtener datos si no hay error de servidor
    if (serverStatus === 'checking') {
      console.log('⏳ Esperando verificación del servidor...');
      return;
    }
    
    // Obtener productos, materiales, géneros y marcas de la base de datos
    const obtenerDatos = async (retryCount = 0) => {
      const maxRetries = 2; // Reducir reintentos
      
      if (serverStatus === 'error' && retryCount === 0) {
        setError("El servidor backend no está disponible o hay un problema de conexión.\n\nEl endpoint /api/test funciona, pero hay un problema específico con los endpoints de datos.\n\nVerifique:\n1. Que el servidor backend esté corriendo completamente\n2. Que no haya errores en la consola del servidor\n3. Que la base de datos esté conectada");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`🔄 Intento ${retryCount + 1} de obtener datos...`);
        
        // Probar cada endpoint individualmente para identificar el problema
        console.log('🧪 Probando endpoint de productos...');
        const productosData = await apiRequest(API_ENDPOINTS.PRODUCTOS);
        console.log('✅ Productos OK');
        
        console.log('🧪 Probando endpoint de materiales...');
        const materialesData = await apiRequest(API_ENDPOINTS.MATERIALES);
        console.log('✅ Materiales OK');
        
        console.log('🧪 Probando endpoint de géneros...');
        const generosData = await apiRequest(API_ENDPOINTS.GENEROS);
        console.log('✅ Géneros OK');
        
        console.log('🧪 Probando endpoint de marcas...');
        const marcasData = await apiRequest(API_ENDPOINTS.MARCAS);
        console.log('✅ Marcas OK');
        
        console.log("✅ Todos los datos obtenidos correctamente");
        console.log("📊 Resumen:", {
          productos: productosData.length,
          materiales: materialesData.length,
          generos: generosData.length,
          marcas: marcasData.length
        });
        
        // Filtrar solo aretes (categoria ID = 1)
        const aretes = productosData.filter((producto) => producto.id_categoria === 1);
        console.log("🔍 Aretes filtrados:", aretes.length, "de", productosData.length, "productos totales");
        
        setProductos(aretes);
        setProductosFiltrados(aretes);
        setMateriales(materialesData);
        setGeneros(generosData);
        setMarcas(marcasData);
        setError(null);
        setServerStatus('ok');
      } catch (err) {
        console.error(`❌ Error al cargar datos (intento ${retryCount + 1}):`, err);
        
        if (retryCount < maxRetries) {
          console.log(`🔄 Reintentando en 2 segundos... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            obtenerDatos(retryCount + 1);
          }, 2000);
          return;
        }
        
        // Determinar el tipo de error más específicamente
        let errorMessage = `ERROR: ${err.message}`;
        
        if (err.message.includes('No se pudo conectar con el servidor backend')) {
          errorMessage = `PROBLEMA DE CONECTIVIDAD:\n\n${err.message}\n\nSi /api/test funciona pero esto no, puede ser:\n1. Un endpoint específico no está configurado\n2. Problema con la base de datos\n3. Error en el código del servidor\n\nRevise la consola del servidor backend para más detalles.`;
        } else if (err.message.includes('Error HTTP')) {
          errorMessage = `ERROR DEL SERVIDOR:\n\n${err.message}\n\nEl servidor está funcionando pero devolvió un error.\nRevise los logs del servidor backend.`;
        }
        
        setError(errorMessage);
        setServerStatus('error');
      } finally {
        if (retryCount === 0 || retryCount >= maxRetries) {
          setLoading(false);
        }
      }
    };

    obtenerDatos();
  }, [serverStatus]);

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

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    setServerStatus('checking');
    
    // Verificar servidor primero
    const health = await checkServerHealth();
    setServerStatus(health.status);
    
    if (health.status === 'ok') {
      // Verificar base de datos también
      const dbCheck = await checkDatabaseStructure();
      setDebugInfo(dbCheck.data);
      
      // Si el servidor está ok, recargar la página
      window.location.reload();
    }
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

  return (
    <div className="productos-page">
      <Separar />
      
      <div className="banner-productos aretes-banner">
        <img src="../9.png" alt="Banner Aretes" />
        <div className="banner-overlay">
          <h2>✨ Aretes únicos que reflejan tu personalidad</h2>
        </div>
      </div>

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
              {serverStatus === 'checking' && (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Verificando conexión con el servidor...
                </p>
              )}
            </div>
          ) : error ? (
            <div className="error-container">
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                padding: '1.5rem',
                maxWidth: '600px',
                textAlign: 'left'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 1rem 0' }}>
                  Error de Conexión
                </h3>
                <pre style={{ 
                  color: '#7f1d1d', 
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  margin: '0 0 1rem 0'
                }}>
                  {error}
                </pre>
                
                {debugInfo && (
                  <div style={{ 
                    background: '#e0f2fe', 
                    padding: '1rem', 
                    borderRadius: '6px',
                    margin: '1rem 0',
                    fontSize: '0.8rem'
                  }}>
                    <strong>Info de la Base de Datos:</strong>
                    <pre style={{ margin: '0.5rem 0 0 0', color: '#01579b' }}>
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleRetry} 
                    className="retry-btn"
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Reintentar
                  </button>
                  <a 
                    href="http://localhost:5001/api/test" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      background: '#059669',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}
                  >
                    Probar API
                  </a>
                  <a 
                    href="http://localhost:5001/api/debug/database" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      background: '#7c3aed',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}
                  >
                    Ver DB Debug
                  </a>
                </div>
              </div>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-container">
              <p>No hay aretes disponibles con los filtros seleccionados.</p>
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
          
          {!loading && !error && productosFiltrados.length > 0 && (
            <div className="productos-counter">
              <span>{productosFiltrados.length} producto(s) encontrado(s)</span>
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

export default Aretes;

/* Actualizar el producto "Anillo" para que tenga la categoría correcta
UPDATE productos SET id_categoria = 2 WHERE ID_producto = 4;
*/
