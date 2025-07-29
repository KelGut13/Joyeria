import React, { useState, useEffect } from "react";
import "./estilos/Pulsera.css";

const Pulsera = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    setProductos([
      { id: 1, nombre: "Pulsera de corazones", precio: 120, imagen: "catalogos1.jpg" },
      { id: 2, nombre: "Pulsera de dulces", precio: 140, imagen: "catalogos2.jpg" },
      { id: 3, nombre: "Pulsera gamer", precio: 200, imagen: "catalogos3.jpg" },
      // ...
    ]);
  }, []);

  return (
    <div className="pulsera-page">
      {/* Banner principal */}
      <div className="banner-pulsera">
        <img src="/fondoPulseras.jpg" alt="Banner Pulseras" />
        <h2>“Pulseras hechas para brillar contigo.”</h2>
      </div>

      <div className="contenido-pulsera">
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

export default Pulsera;
