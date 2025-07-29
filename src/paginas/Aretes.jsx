import React from "react";
import { Link } from "react-router-dom";
import "./estilos/Aretes.css";

const Aretes = () => {
  return (
    <div className="aretes-container">
      <h1>Aretes</h1>
      <p>Descubre nuestra colección de aretes únicos y elegantes.</p>
      <div className="aretes-list">
        <Link to="/arete1" className="arete-item">Arete 1</Link>
        <Link to="/arete2" className="arete-item">Arete 2</Link>
        <Link to="/arete3" className="arete-item">Arete 3</Link>
      </div>
    </div>
  );
}

export default Aretes;
