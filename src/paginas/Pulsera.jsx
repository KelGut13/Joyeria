import React, { useState, useEffect } from "react";
import "./estilos/Pulsera.css";
import Separar from "../componentes/Separador NavBar/Separador";
import { getFirstProductImage, API_ENDPOINTS } from '../config/api';

const Pulsera = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    materiales: [],
    generos: [],
    marcas: [],
    precioMin: "",
    precioMax: "",
  });

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const [
          productosResponse,
          materialesResponse,
          generosResponse,
          marcasResponse,
        ] = await Promise.all([
          fetch(API_ENDPOINTS.PRODUCTOS),
          fetch(API_ENDPOINTS.MATERIALES),
          fetch(API_ENDPOINTS.GENEROS),
          fetch(API_ENDPOINTS.MARCAS),
        ]);

        const [productosData, materialesData, generosData, marcasData] =
          await Promise.all([
            productosResponse.json(),
            materialesResponse.json(),
            generosResponse.json(),
            marcasResponse.json(),
          ]);

        // Filtrar solo pulseras (categoria ID = 4)
        const pulseras = productosData.filter(
          (producto) => producto.id_categoria === 4
        );

        setProductos(pulseras);
        setProductosFiltrados(pulseras);
        setMateriales(materialesData);
        setGeneros(generosData);
        setMarcas(marcasData);
        setError(null);
      } catch (err) {
        setError(`Error al cargar productos: ${err.message}`);
      } finally {
        setLoading(false);
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
      productosFiltrados = productosFiltrados.filter((producto) =>
        filtros.materiales.includes(producto.id_material)
      );
    }

    if (filtros.generos.length > 0) {
      productosFiltrados = productosFiltrados.filter((producto) =>
        filtros.generos.includes(producto.id_genero)
      );
    }

    if (filtros.marcas.length > 0) {
      productosFiltrados = productosFiltrados.filter((producto) =>
        filtros.marcas.includes(producto.id_marca)
      );
    }

    if (filtros.precioMin !== "") {
      productosFiltrados = productosFiltrados.filter(
        (producto) => parseFloat(producto.precio) >= parseFloat(filtros.precioMin)
      );
    }

    if (filtros.precioMax !== "") {
      productosFiltrados = productosFiltrados.filter(
        (producto) => parseFloat(producto.precio) <= parseFloat(filtros.precioMax)
      );
    }

    setProductosFiltrados(productosFiltrados);
  };

  const handleMaterialChange = (materialId) => {
    setFiltros((prev) => ({
      ...prev,
      materiales: prev.materiales.includes(materialId)
        ? prev.materiales.filter((id) => id !== materialId)
        : [...prev.materiales, materialId],
    }));
  };

  const handleGeneroChange = (generoId) => {
    setFiltros((prev) => ({
      ...prev,
      generos: prev.generos.includes(generoId)
        ? prev.generos.filter((id) => id !== generoId)
        : [...prev.generos, generoId],
    }));
  };

  const handleMarcaChange = (marcaId) => {
    setFiltros((prev) => ({
      ...prev,
      marcas: prev.marcas.includes(marcaId)
        ? prev.marcas.filter((id) => id !== marcaId)
        : [...prev.marcas, marcaId],
    }));
  };

  const handlePrecioChange = (tipo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [tipo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      materiales: [],
      generos: [],
      marcas: [],
      precioMin: "",
      precioMax: "",
    });
  };

  return (
    <div className="pulsera-page">

      {/* Banner principal */}
      <div className="banner-pulsera">
        <img src="../8.png" alt="Banner Aretes" />
      </div>

      <div className="contenido-pulsera">
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
                onChange={(e) =>
                  handlePrecioChange("precioMin", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Max"
                value={filtros.precioMax}
                onChange={(e) =>
                  handlePrecioChange("precioMax", e.target.value)
                }
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
              <p>🔍 No hay pulseras disponibles con los filtros seleccionados.</p>
              <button onClick={limpiarFiltros} className="retry-btn">
                Limpiar filtros
              </button>
            </div>
          ) : (
            productosFiltrados.map((producto) => (
              <div className="producto" key={producto.ID_producto}>
                <div className="producto-badge">Nuevo</div>
                <img
                  src={getFirstProductImage(producto)}
                  alt={producto.nombre}
                  onError={(e) => {
                    e.target.src = "/logo192.png";
                  }}
                />
                <p>{producto.nombre}</p>
                <span>${producto.precio}</span>
                <button className="add-to-cart-btn">Agregar al carrito</button>
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

export default Pulsera;
