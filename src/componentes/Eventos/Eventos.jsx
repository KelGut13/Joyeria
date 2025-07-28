import React, { useState } from 'react';
import './Eventos.css';
import Evento1 from "../../imagenes/Eventos/Evento1.png";
import EventoEj from "../../imagenes/Eventos/EventoEj.png";
import Evento1pdf from "../../descargas/DescEventos/Evento1.pdf";

const eventos = [
  { id: 1, titulo: 'Evento especial de la comunidad', imagen: Evento1, archivo: Evento1pdf },
  { id: 2, titulo: 'Conferencia anual', imagen: EventoEj, archivo: '/descargas/dos.pdf' },
  { id: 3, titulo: 'Reunión de clubes', imagen: EventoEj, archivo: '/descargas/tres.pdf' },
  { id: 4, titulo: 'Fiesta tradicional', imagen: EventoEj, archivo: '/descargas/cuatro.pdf' },
  { id: 5, titulo: 'Evento deportivo', imagen: EventoEj, archivo: '/descargas/cinco.pdf' },
];

export default function Eventos() {
  const [eventoActivo, setEventoActivo] = useState(null);

  return (
    <div className="eventos-section">
      <h2 className="titulo-eventos">Eventos</h2>
      <div className="tarjetas-container">
        {eventos.map(evento => (
          <div className="tarjeta-evento" key={evento.id}>
            <img src={evento.imagen} alt={evento.titulo} />
            <h3>{evento.titulo}</h3>
            <div className="tooltip-wrapper">
              <button onClick={() => setEventoActivo(evento)}>
                Ver
              </button>
              <span className="tooltip-text">Ver detalles del evento</span>
            </div>
          </div>
        ))}
      </div>

      {eventoActivo && (
        <div className="modal-overlay" onClick={() => setEventoActivo(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img src={eventoActivo.imagen} alt={eventoActivo.titulo} />
            <div className="tooltip-wrapper">
              <a href={eventoActivo.archivo} download className="boton-descargar">
                Descargar
              </a>
              <span className="tooltip-text">Descargar archivo</span>
            </div>
            <button className="cerrar" onClick={() => setEventoActivo(null)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}
