import React from "react";
import { useNavigate } from "react-router-dom";
import Separar from "../componentes/Separador NavBar/Separador";
import Carrusel from "../componentes/Carrusel/Carrusel";
import "./estilos/Inicio.css";
import producto1 from "../imagenes/Inicio/producto1.png";
import producto2 from "../imagenes/Inicio/producto2.png";
import producto3 from "../imagenes/Inicio/producto3.png";
import producto4 from "../imagenes/Inicio/producto4.png";
import producto5 from "../imagenes/Inicio/producto5.png";
import producto6 from "../imagenes/Inicio/producto6.png";
import aretes from "../imagenes/Inicio/aretes.png";
import pulsera from "../imagenes/Inicio/pulseras.png";
import llavero from "../imagenes/Inicio/llavero.png";
import juego from "../imagenes/Inicio/collares.png";
import coleccion1 from "../imagenes/Inicio/coleccion1.png";
import coleccion2 from "../imagenes/Inicio/coleccion2.png";
import servicio from "../imagenes/Inicio/servicio.png";


const Inicio = () => {
  const navigate = useNavigate();
  return (
    <div className="Container-Inicio">
      <Separar />
      <Carrusel />

      {/* Maestros de la creatividad */}
      <section className="seccion-creatividad">
        <h2>Maestros de la creatividad</h2>
        <p>
          La pasión de la fundadora es nuestra fuerza y por la innovación, diseño y
          dominio del corte de las piezas de la mayor calidad.
        </p>
      </section>

      {/* Galería de favoritos */}
      <section className="seccion-favoritos">
        <div className="galeria-imagenes">
          <img src={producto1} alt="Producto 1" />
          <img src={producto2} alt="Producto 2" />
          <img src={producto3} alt="Producto 3" />
          <img src={producto4} alt="Producto 4" />
          <img src={producto5} alt="Producto 5" />
          <img src={producto6} alt="Producto 6" />
        </div>
        <h3 className="titulo-oferta">¡Tus favoritos con precios súper!</h3>
      </section>

      {/* Íconos de categoría */}
      <section className="seccion-categorias">
        <div className="iconos-categorias">
          <button type="button" className="icono-btn" onClick={() => navigate("/Aretes")}> 
            <img src={aretes} alt="Aretes" />
            <p>Aretes</p>
          </button>
          <button type="button" className="icono-btn" onClick={() => navigate("/Pulsera")}> 
            <img src={pulsera} alt="Pulsera" />
            <p>Pulsera</p>
          </button>
          <button type="button" className="icono-btn" onClick={() => navigate("/Llavero")}> 
            <img src={llavero} alt="Llavero" />
            <p>Llavero</p>
          </button>
          <button type="button" className="icono-btn" onClick={() => navigate("/Juegos")}> 
            <img src={juego} alt="Juego" />
            <p>Juego</p>
          </button>
        </div>
      </section>

      {/* Nueva colección */}
      <section className="seccion-nueva-coleccion">
        <h2>Presentamos nuestra nueva colección</h2>
        <div className="imagenes-coleccion">
          <img src={coleccion1} alt="Colección 1" />
          <img src={coleccion2} alt="Colección 2" />
        </div>
      </section>

      {/* A su servicio */}
      <section className="seccion-servicio">
        <div className="servicio-contenido">
          <img src={servicio} alt="Cadenas decorativas" />
          <div className="texto-servicio">
            <h3>A su servicio</h3>
            <p>
              No hay pregunta demasiado pequeña ni petición demasiado grande: estamos para
              ayudarte con asesoría de regalos, personalización de productos o reglas básicas de
              diseño en tus ideas.
            </p>
            <button>Contáctanos</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inicio;
