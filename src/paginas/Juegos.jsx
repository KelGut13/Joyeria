import React from "react";
import {Link} from "react-router-dom";
import "./estilos/Juegos.css";

const Juegos = () => {
  return (
    <div className="juegos-container">
      <h1>Juegos</h1>
      <p>Disfruta de nuestra selección de juegos interactivos.</p>
      <div className="juegos-list">
        <Link to="/juego1" className="juego-item">Juego 1</Link>
        <Link to="/juego2" className="juego-item">Juego 2</Link>
        <Link to="/juego3" className="juego-item">Juego 3</Link>
      </div>
    </div>
  );
}

export default Juegos;
