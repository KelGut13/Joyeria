import React, { useState, useEffect } from "react";
import "./estilos/Llavero.css";

const Llavero = () => {
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

        // Como no hay categoría específica para "Llaveros", filtrar por nombre que contenga palabras relacionadas
        const llaveros = data.filter((producto) =>
          producto.nombre.toLowerCase().includes("llavero") ||
          producto.nombre.toLowerCase().includes("chaveiro") ||
          producto.nombre.toLowerCase().includes("keychain")
        );

        // Si no hay productos específicos de "llaveros", mostrar una selección de productos pequeños/accesorios
        const productosParaLlaveros = llaveros.length > 0 ? llaveros : data.slice(0, 6);

        console.log("🔍 Productos para llaveros filtrados:", productosParaLlaveros);

        setProductos(productosParaLlaveros);
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
    <div className="llavero-page">
      {/* Banner principal */}
      <div className="banner-llavero">
        <img src="/fondoLlaveros.jpg" alt="Banner Llaveros" />
        <h2>"Llaveros que hablan por ti"</h2>
      </div>

      <div className="contenido-llavero">
        {/* Filtros */}
        <aside className="filtros">
          <h3>Filtrar por:</h3>

          <div className="filtro-categoria">
            <label>Material</label>
            <ul>
              <li><input type="checkbox" /> Pasta francesa</li>
              <li><input type="checkbox" /> Resina</li>
              <li><input type="checkbox" /> Chapa de oro</li>
              <li><input type="checkbox" /> Acero inoxidable</li>
              <li><button className="mostrar-mas">Mostrar más</button></li>
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
            <p>No hay llaveros disponibles.</p>
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

export default Llavero;

