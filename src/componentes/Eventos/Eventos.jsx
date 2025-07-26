import React, { useState, useEffect } from 'react';
import './Eventos.css';
import Evento1 from "../../imagenes/Eventos/Evento1.png";
import EventoEj from "../../imagenes/Eventos/EventoEj.png";
import Evento1pdf from "../../descargas/DescEventos/Evento1.pdf";
import { useParams } from "react-router-dom";
import { translateText } from "../../utils/translate";

const eventosOriginales = [
  { id: 1, titulo: 'Evento especial de la comunidad', imagen: Evento1, archivo: Evento1pdf },
  { id: 2, titulo: 'Conferencia anual', imagen: EventoEj, archivo: '/descargas/dos.pdf' },
  { id: 3, titulo: 'Reunión de clubes', imagen: EventoEj, archivo: '/descargas/tres.pdf' },
  { id: 4, titulo: 'Fiesta tradicional', imagen: EventoEj, archivo: '/descargas/cuatro.pdf' },
  { id: 5, titulo: 'Evento deportivo', imagen: EventoEj, archivo: '/descargas/cinco.pdf' },
];

const textos = {
  es: {
    titulo: "Eventos",
    ver: "Ver",
    tooltipVer: "Ver detalles del evento",
    descargar: "Descargar",
    tooltipDescargar: "Descargar archivo",
  }
};

export default function Eventos() {
  const { lng } = useParams();
  const [eventoActivo, setEventoActivo] = useState(null);
  const [eventos, setEventos] = useState(eventosOriginales);
  const [trad, setTrad] = useState(textos.es);

  useEffect(() => {
    const traducir = async () => {
      if (lng !== "es") {
        setTrad({
          titulo: await translateText(textos.es.titulo, "es", lng),
          ver: await translateText(textos.es.ver, "es", lng),
          tooltipVer: await translateText(textos.es.tooltipVer, "es", lng),
          descargar: await translateText(textos.es.descargar, "es", lng),
          tooltipDescargar: await translateText(textos.es.tooltipDescargar, "es", lng),
        });
        const eventosTraducidos = await Promise.all(
          eventosOriginales.map(async (evento) => ({
            ...evento,
            titulo: await translateText(evento.titulo, "es", lng)
          }))
        );
        setEventos(eventosTraducidos);
      } else {
        setTrad(textos.es);
        setEventos(eventosOriginales);
      }
    };
    traducir();
  }, [lng]);

  return (
    <div className="eventos-section">
      <h2 className="titulo-eventos">{trad.titulo}</h2>
      <div className="tarjetas-container">
        {eventos.map(evento => (
          <div className="tarjeta-evento" key={evento.id}>
            <img src={evento.imagen} alt={evento.titulo} />
            <h3>{evento.titulo}</h3>
            <div className="tooltip-wrapper">
              <button onClick={() => setEventoActivo(evento)}>
                {trad.ver}
              </button>
              <span className="tooltip-text">{trad.tooltipVer}</span>
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
                {trad.descargar}
              </a>
              <span className="tooltip-text">{trad.tooltipDescargar}</span>
            </div>
            <button className="cerrar" onClick={() => setEventoActivo(null)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}
