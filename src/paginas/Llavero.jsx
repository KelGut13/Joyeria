import React, { useState, useEffect } from "react";
import "./estilos/Llavero.css";

const Llavero = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    setProductos([
      { id: 1, nombre: "Corazones partidos", precio: 85, imagen: "catalogos1.jpg" },
      { id: 2, nombre: "Minion", precio: 90, imagen: "catalogos2.jpg" },
      { id: 3, nombre: "Mickey", precio: 95, imagen: "catalogos3.jpg" },
      // ...
    ]);
  }, []);

  return (
    <div className="llavero-page">
      {/* Banner principal */}
      <div className="banner-llavero">
        <img src="/fondoLlaveros.jpg" alt="Banner Llaveros" />
        <h2>“Llaveros que hablan por ti”</h2>
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
          {productos.map((producto) => (
            <div className="producto" key={producto.id}>
              <img src={`/${producto.imagen}`} alt={producto.nombre} />
              <p>{producto.nombre}</p>
              <span>${producto.precio}</span>
            </div>
          ))}
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

