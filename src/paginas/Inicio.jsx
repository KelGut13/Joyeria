import React, { useEffect, useState } from "react";
import Separar from "../componentes/Separador NavBar/Separador";
import "./estilos/Inicio.css";
import Carrusel from "../componentes/Carrusel/Carrusel";
import Eventos from "../componentes/Eventos/Eventos";
import Convocatorias from "../componentes/Convocatorias/Convocatorias";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad.jsx";
import video from "../videos/videofenine.mp4";
import { useParams } from "react-router-dom";
import { translateText } from "../utils/translate";

const textos = {
  "es": {
    tituloResena: "Curiosidades NANCY",
    textoResena: "Curiosidades Nancy es un emprendimiento dedicado a la joyería artesanal, enfocado en crear piezas únicas con un estilo propio y lleno de significado. A través de ventas en línea, ofrece una amplia variedad de accesorios personalizados, ideales para cualquier ocasión. Cada pieza es elaborada con dedicación, cuidando cada detalle para reflejar la esencia y personalidad de quien la lleva. Con un enfoque creativo y cercano, Curiosidades Nancy transforma cada pedido en una experiencia especial, donde lo hecho a mano se convierte en algo inolvidable.",
    // ...eliminado: ubicacionTitulo y ubicacionDireccion...
  }
};

const Inicio = () => {
  const { lng } = useParams();
  const [trad, setTrad] = useState(textos["es"]); // ubicacion removida

  useEffect(() => {
    const traducir = async () => {
      if (lng !== "es") {
        setTrad({
          tituloResena: await translateText(textos.es.tituloResena, "es", lng),
          textoResena: await translateText(textos.es.textoResena, "es", lng),
          // ubicacion removida
        });
      } else {
        setTrad(textos["es"]);
      }
    };
    traducir();
  }, [lng]);

  useEffect(() => {
    // Cargar el SDK de Facebook solo una vez
    if (!window.FB) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v22.0";
      document.body.appendChild(script);
    } else {
      // Si ya está cargado, reanaliza el widget
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="Container-Inicio">
      <Separar />
      <Carrusel />

      <div className="Inicio-Seccion_Uno">
        <div className="facebook">
          <div className="facebook-container">
            <div
              className="fb-page"
              data-href="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/"
              data-tabs="timeline"
              data-width=""
              data-height=""
              data-small-header="false"
              data-adapt-container-width="false"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/"
                className="fb-xfbml-parse-ignore"
              >
                <a href="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/">Curiosidades NANCY</a>
              </blockquote>
            </div>
          </div>
        </div>

        <div className="espaciador"></div>

        <div className="resena">
            <h1>{trad.tituloResena}</h1>
            <p>
                {trad.textoResena}
            </p>
        </div>
      </div>

      <div className="video-container">
        <video width="640" height="360" controls className="video">
          <source src={video} type="video/mp4"/>
        </video>
      </div>

      <div className="Inicio-Seccion_Dos">
        <Eventos lng={lng} />
      </div>

      <div className="Inicio-Seccion_Tres">
        <Convocatorias lng={lng} />
      </div>

      {/* Sección 4 (ubicación) eliminada */}
      <Accesibilidad />
    </div>
  );
}

export default Inicio;
