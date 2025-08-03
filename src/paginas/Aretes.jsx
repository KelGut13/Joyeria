import React, { useState, useEffect } from "react";
import "./estilos/Aretes.css";
import Separar from "../componentes/Separador NavBar/Separador";

const Aretes = () => {
  const [productos, setProductos] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener productos de la base de datos
    const obtenerProductos = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/productos");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Todos los productos:", data);
        
        // Filtrar solo aretes (categoria ID = 1)
        const aretes = data.filter((producto) => producto.id_categoria === 1);
        console.log("🔍 Aretes filtrados:", aretes);
        
        setProductos(aretes);
        setError(null);
      } catch (err) {
        console.error("❌ Error al cargar productos:", err);
        setError(`Error al cargar productos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    obtenerProductos();
  }, []);

  // Cierra los filtros al cambiar el tamaño de pantalla a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMostrarFiltros(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="aretes-page">
      <Separar />
      {/* Banner principal */}
      <div className="banner-aretes">
        <img src="/fondoAretes.jpg" alt="Banner Aretes" />
        <h2>¡Demuestra tu autenticidad con nuestros aretes!</h2>
      </div>

      {/* Botón Filtro solo en móvil */}
      <button
        className="btn-filtro-movil"
        onClick={() => setMostrarFiltros((prev) => !prev)}
      >
        {mostrarFiltros ? "Cerrar filtros" : "Filtro"}
      </button>

      <div className="contenido-aretes">
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
              <li>
                <input type="checkbox" /> Pasta francesa
              </li>
              <li>
                <input type="checkbox" /> Resina
              </li>
              <li>
                <input type="checkbox" /> Chapa de oro
              </li>
              <li>
                <input type="checkbox" /> Acero inoxidable
              </li>
              <li>
                <button className="mostrar-mas">Mostrar más</button>
              </li>
            </ul>
          </div>

          <div className="filtro-precio">
            <label>Precio</label>
            <div className="rango-precio">
              <input type="number" placeholder="Min" />
              <input type="number" placeholder="Max" />
              <button className="actualizar-precio">Actualizar</button>
            </div>
          </div>
        </aside>

        {/* Productos */}
        <section className="productos">
          {loading ? (
            <p>Cargando productos...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : productos.length === 0 ? (
            <p>No hay aretes disponibles.</p>
          ) : (
            productos.map((producto) => (
              <div className="producto" key={producto.ID_producto}>
                <img
                  src={
                    producto.imagen
                      ? Array.isArray(producto.imagen)
                        ? producto.imagen[0]
                        : producto.imagen.split(",")[0]
                      : "/placeholder.jpg"
                  }
                  alt={producto.nombre}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                <p>{producto.nombre}</p>
                <span>${producto.precio}</span>
              </div>
            ))
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
