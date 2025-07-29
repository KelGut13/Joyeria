import React from "react";
import {Link } from "react-router-dom";
import "./estilos/Llavero.css";

const Llavero = () => {
  return (
    <div className="llavero-container">
      <h1>Llavero</h1>
      <p>Explora nuestra colección de llaveros únicos y personalizados.</p>
      <div className="llavero-list">
        <Link to="/llavero1" className="llavero-item">Llavero 1</Link>
        <Link to="/llavero2" className="llavero-item">Llavero 2</Link>
        <Link to="/llavero3" className="llavero-item">Llavero 3</Link>
      </div>
    </div>
  );
}

export default Llavero;
