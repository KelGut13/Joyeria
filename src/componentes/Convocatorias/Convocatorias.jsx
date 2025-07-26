import React, { useState, useEffect } from 'react';
import './Convocatorias.css';
import Conv1 from "../../imagenes/Convocatorias/Conv1.png";
import Conv1pdf from "../../descargas/DescConv/Conv1.pdf";
import { useParams } from "react-router-dom";
import { translateText } from "../../utils/translate";

const convocatoriasOriginales = [
  { id: 1, titulo: 'Convocatoria de participación', imagen: Conv1, archivo: Conv1pdf },
  { id: 2, titulo: 'Convocatoria especial', imagen: Conv1, archivo: '/descargas/conv2.pdf' },
  { id: 3, titulo: 'Convocatoria abierta', imagen: Conv1, archivo: '/descargas/conv3.pdf' },
  { id: 4, titulo: 'Convocatoria de clubes', imagen: Conv1, archivo: '/descargas/conv4.pdf' },
  { id: 5, titulo: 'Convocatoria deportiva', imagen: Conv1, archivo: '/descargas/conv5.pdf' },
];

const textos = {
  es: {
    titulo: "Convocatorias",
    ver: "Ver",
    descargar: "Descargar",
  }
};

export default function Convocatorias() {
  const { lng } = useParams();
  const [convocatoriaActiva, setConvocatoriaActiva] = useState(null);
  const [convocatorias, setConvocatorias] = useState(convocatoriasOriginales);
  const [trad, setTrad] = useState(textos.es);

  useEffect(() => {
    const traducir = async () => {
      if (lng !== "es") {
        setTrad({
          titulo: await translateText(textos.es.titulo, "es", lng),
          ver: await translateText(textos.es.ver, "es", lng),
          descargar: await translateText(textos.es.descargar, "es", lng),
        });
        const convocatoriasTraducidas = await Promise.all(
          convocatoriasOriginales.map(async (conv) => ({
            ...conv,
            titulo: await translateText(conv.titulo, "es", lng)
          }))
        );
        setConvocatorias(convocatoriasTraducidas);
      } else {
        setTrad(textos.es);
        setConvocatorias(convocatoriasOriginales);
      }
    };
    traducir();
  }, [lng]);

  return (
    <div className="convocatorias-section">
      <h2 className="titulo-convocatorias">{trad.titulo}</h2>
      <div className="tarjetas-container">
        {convocatorias.map(conv => (
          <div className="tarjeta-convocatoria" key={conv.id}>
            <img src={conv.imagen} alt={conv.titulo} />
            <h3>{conv.titulo}</h3>
            <button onClick={() => setConvocatoriaActiva(conv)}>{trad.ver}</button>
          </div>
        ))}
      </div>

      {convocatoriaActiva && (
        <div className="modal-overlay" onClick={() => setConvocatoriaActiva(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img src={convocatoriaActiva.imagen} alt={convocatoriaActiva.titulo} />
            <a href={convocatoriaActiva.archivo} download className="boton-descargar">
              {trad.descargar}
            </a>
            <button className="cerrar" onClick={() => setConvocatoriaActiva(null)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}
