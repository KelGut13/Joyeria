import React, { useState } from 'react';
import './Convocatorias.css';
import Conv1 from "../../imagenes/Convocatorias/Conv1.png";
import Conv1pdf from "../../descargas/DescConv/Conv1.pdf";

const convocatorias = [
  { id: 1, titulo: 'Convocatoria de participación', imagen: Conv1, archivo: Conv1pdf },
  { id: 2, titulo: 'Convocatoria especial', imagen: Conv1, archivo: '/descargas/conv2.pdf' },
  { id: 3, titulo: 'Convocatoria abierta', imagen: Conv1, archivo: '/descargas/conv3.pdf' },
  { id: 4, titulo: 'Convocatoria de clubes', imagen: Conv1, archivo: '/descargas/conv4.pdf' },
  { id: 5, titulo: 'Convocatoria deportiva', imagen: Conv1, archivo: '/descargas/conv5.pdf' },
];

export default function Convocatorias() {
  const [convocatoriaActiva, setConvocatoriaActiva] = useState(null);

  return (
    <div className="convocatorias-section">
      <h2 className="titulo-convocatorias">Convocatorias</h2>
      <div className="tarjetas-container">
        {convocatorias.map(conv => (
          <div className="tarjeta-convocatoria" key={conv.id}>
            <img src={conv.imagen} alt={conv.titulo} />
            <h3>{conv.titulo}</h3>
            <button onClick={() => setConvocatoriaActiva(conv)}>Ver</button>
          </div>
        ))}
      </div>
      {convocatoriaActiva && (
        <div className="modal-overlay" onClick={() => setConvocatoriaActiva(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <img src={convocatoriaActiva.imagen} alt={convocatoriaActiva.titulo} />
            <a href={convocatoriaActiva.archivo} download className="boton-descargar">
              Descargar
            </a>
            <button className="cerrar" onClick={() => setConvocatoriaActiva(null)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}
