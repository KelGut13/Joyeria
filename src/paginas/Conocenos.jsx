import React, { useEffect, useState } from "react";
import Separar from "../componentes/Separador NavBar/Separador.jsx";
import "./estilos/Conocenos.css";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad.jsx";
import { useParams } from "react-router-dom";
import { translateText } from "../utils/translate.js";

const textos = {
  "es": {
    tituloResena: "Curiosidades NANCY",
    textoResena: "Curiosidades Nancy es un emprendimiento dedicado a la joyería artesanal, enfocado en crear piezas únicas con un estilo propio y lleno de significado. A través de ventas en línea, ofrece una amplia variedad de accesorios personalizados, ideales para cualquier ocasión. Cada pieza es elaborada con dedicación, cuidando cada detalle para reflejar la esencia y personalidad de quien la lleva. Con un enfoque creativo y cercano, Curiosidades Nancy transforma cada pedido en una experiencia especial, donde lo hecho a mano se convierte en algo inolvidable.",
  }
};

const Conocenos = () => {
  const { lng } = useParams();
  const [trad, setTrad] = useState(textos["es"]);

  useEffect(() => {
    const traducir = async () => {
      if (lng !== "es") {
        setTrad({
          tituloResena: await translateText(textos.es.tituloResena, "es", lng),
          textoResena: await translateText(textos.es.textoResena, "es", lng),
        });
      } else {
        setTrad(textos["es"]);
      }
    };
    traducir();
  }, [lng]);

  useEffect(() => {
    if (!window.FB) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v22.0";
      document.body.appendChild(script);
    } else {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="Container-Conocenos">
      <Separar />
      <div className="Conocenos-Seccion_Uno">
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
      <Accesibilidad />
    </div>
  );
}

export default Conocenos;
