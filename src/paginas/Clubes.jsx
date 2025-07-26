import React, { useState } from "react";
import Separar from "../componentes/Separador NavBar/Separador";
import "./estilos/Clubes.css";
import clubesData from "../data/clubesData.js";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad.jsx";

export default function Clubes() {
  const [clubActivo, setClubActivo] = useState(null);

  return (
    <div className="clubes-section">
      <Separar />
      <h2 className="clubes-titulo">Clubes</h2>
      <div className="clubes-tarjetas-container">
        {clubesData.map((club) => (
          <div className="clubes-tarjeta" key={club.id}>
            <img src={club.imagen} alt={club.nombre} />
            <h3>{club.nombre}</h3>
            <button onClick={() => setClubActivo(club)}>
              Más información
            </button>
          </div>
        ))}
      </div>
      <Accesibilidad/>
      {clubActivo && (
        <div className="clubes-modal-overlay" onClick={() => setClubActivo(null)}>
          <div className="clubes-modal" onClick={(e) => e.stopPropagation()}>
            <img src={clubActivo.imagen} alt={clubActivo.nombre} />
            <h3>{clubActivo.nombre}</h3>
            <p><strong>Presidente:</strong> {clubActivo.presidente}</p>
            <p><strong>Email:</strong> {clubActivo.correo}</p>
            <p><strong>Teléfono:</strong> {clubActivo.telefono}</p>
            <button className="clubes-cerrar" onClick={() => setClubActivo(null)}>×</button>
          </div>
          <Accesibilidad/>
        </div>
      )}
    </div>
  );
}
