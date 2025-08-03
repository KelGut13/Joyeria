import React, { useState, useEffect } from "react";
import "./estilos/Pulsera.css";

const Pulsera = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/productos");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Todos los productos:", data);

        // Filtrar solo pulseras (categoria ID = 4)
        const pulseras = data.filter((producto) => producto.id_categoria === 4);
        console.log("🔍 Pulseras filtradas:", pulseras);

        setProductos(pulseras);
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

  return (
    <div className="pulsera-page">
      {/* Banner principal */}
      <div className="banner-pulsera">
        <img src="/fondoPulseras.jpg" alt="Banner Pulseras" />
        <h2>"Pulseras hechas para brillar contigo."</h2>
      </div>

      <div className="contenido-pulsera">
        {/* Filtros */}
        <aside className="filtros">
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
            <p>No hay pulseras disponibles.</p>
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

export default Pulsera;
