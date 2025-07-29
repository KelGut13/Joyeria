import React from "react";
import {Link } from "react-router-dom";
import "./estilos/Pulsera.css";

const Pulsera = () => {
  return (
    <div className="pulsera-container">
      <h1>Pulsera</h1>
      <p>Explora nuestra colección de pulseras únicas y elegantes.</p>
      <div className="pulsera-list">
        <Link to="/pulsera1" className="pulsera-item">Pulsera 1</Link>
        <Link to="/pulsera2" className="pulsera-item">Pulsera 2</Link>
        <Link to="/pulsera3" className="pulsera-item">Pulsera 3</Link>
      </div>
    </div>
  );
}

export default Pulsera;
