import React, { useEffect } from "react";
import Separar from "../componentes/Separador NavBar/Separador.jsx";
import "./estilos/Conocenos.css";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad.jsx";

const tituloResena = "Curiosidades NANCY";
const subtituloResena = "Joyería Artesanal con Significado";
const textoResena = "Curiosidades Nancy es un emprendimiento dedicado a la joyería artesanal, enfocado en crear piezas únicas con un estilo propio y lleno de significado. A través de ventas en línea, ofrece una amplia variedad de accesorios personalizados, ideales para cualquier ocasión.";
const textoMision = "Cada pieza es elaborada con dedicación, cuidando cada detalle para reflejar la esencia y personalidad de quien la lleva. Con un enfoque creativo y cercano, Curiosidades Nancy transforma cada pedido en una experiencia especial, donde lo hecho a mano se convierte en algo inolvidable.";

const Conocenos = () => {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="conocenos-container">
      <Separar />
      
      {/* Hero Section */}
      <section className="conocenos-hero">
        <div className="conocenos-hero-content">
          <div className="conocenos-hero-image">
            <img 
              src="/logo-conocenos.svg" 
              alt="Joyería artesanal elegante"
              className="conocenos-image"
            />
          </div>
          <div className="conocenos-hero-text">
            <h1 className="conocenos-title">{tituloResena}</h1>
            <h2 className="conocenos-subtitle">{subtituloResena}</h2>
            <p className="conocenos-description">{textoResena}</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="conocenos-mission">
        <div className="conocenos-mission-content">
          <div className="conocenos-mission-icon">
            <div className="conocenos-icon-circle">
              ✨
            </div>
          </div>
          <div className="conocenos-mission-text">
            <h3 className="conocenos-mission-title">Nuestra Misión</h3>
            <p className="conocenos-mission-description">{textoMision}</p>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="conocenos-social">
        <div className="conocenos-social-content">
          <h3 className="conocenos-social-title">Síguenos en Facebook</h3>
          <div className="conocenos-facebook-wrapper">
            <div className="conocenos-facebook-container">
              <div
                className="fb-page"
                data-href="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/"
                data-tabs="timeline"
                data-width="400"
                data-height="500"
                data-small-header="false"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="true"
              >
                <blockquote
                  cite="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/"
                  className="fb-xfbml-parse-ignore"
                >
                  <a href="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/">
                    Curiosidades NANCY
                  </a>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="conocenos-values">
        <div className="conocenos-values-content">
          <h3 className="conocenos-values-title">Nuestros Valores</h3>
          <div className="conocenos-values-grid">
            <div className="conocenos-value-card">
              <div className="conocenos-value-icon">💎</div>
              <h4 className="conocenos-value-name">Calidad</h4>
              <p className="conocenos-value-text">Materiales de primera calidad en cada pieza</p>
            </div>
            <div className="conocenos-value-card">
              <div className="conocenos-value-icon">🎨</div>
              <h4 className="conocenos-value-name">Creatividad</h4>
              <p className="conocenos-value-text">Diseños únicos e innovadores</p>
            </div>
            <div className="conocenos-value-card">
              <div className="conocenos-value-icon">❤️</div>
              <h4 className="conocenos-value-name">Pasión</h4>
              <p className="conocenos-value-text">Amor por el arte de la joyería</p>
            </div>
          </div>
        </div>
      </section>

      <Accesibilidad />
    </div>
  );
};

export default Conocenos;