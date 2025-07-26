import React, { useState, useEffect } from "react";
import "./estilos/Contactanos.css";
import Separar from "../componentes/Separador NavBar/Separador";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad";
import { useParams } from "react-router-dom";
import { translateText } from "../utils/translate";

const textos = {
  es: {
    titulo: "Contáctanos",
    nombre: "Nombre:",
    correo: "Correo:",
    asunto: "Asunto:",
    mensaje: "Mensaje:",
    enviar: "Enviar",
    olvidaste: "¿Olvidaste tu contraseña?",
    crear: "Crear Cuenta"
  }
};

function Contactanos() {
  const { lng } = useParams();
  const [trad, setTrad] = useState(textos.es);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: ""
  });

  const [estado, setEstado] = useState("");

  useEffect(() => {
    const traducir = async () => {
      if (lng !== "es") {
        setTrad({
          titulo: await translateText(textos.es.titulo, "es", lng),
          nombre: await translateText(textos.es.nombre, "es", lng),
          correo: await translateText(textos.es.correo, "es", lng),
          asunto: await translateText(textos.es.asunto, "es", lng),
          mensaje: await translateText(textos.es.mensaje, "es", lng),
          enviar: await translateText(textos.es.enviar, "es", lng),
          olvidaste: await translateText(textos.es.olvidaste, "es", lng),
          crear: await translateText(textos.es.crear, "es", lng),
        });
      } else {
        setTrad(textos.es);
      }
    };
    traducir();
  }, [lng]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado("Enviando...");

    try {
        const response = await fetch("http://localhost:5000/api/contacto", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
          });

      if (response.ok) {
        setEstado("¡Mensaje enviado correctamente!");
        setFormData({ nombre: "", correo: "", asunto: "", mensaje: "" });
      } else {
        setEstado("Error al enviar el mensaje.");
      }
    } catch (error) {
      console.error(error);
      setEstado("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="contactanos-container">
      <Separar />
      <h1 className="contactanos-titulo">{trad.titulo}</h1>

      <form className="contactanos-form" onSubmit={handleSubmit}>
        <label className="contactanos-label">{trad.nombre}</label>
        <input
          className="contactanos-input"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <label className="contactanos-label">{trad.correo}</label>
        <input
          className="contactanos-input"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          required
        />

        <label className="contactanos-label">{trad.asunto}</label>
        <input
          className="contactanos-input"
          type="text"
          name="asunto"
          value={formData.asunto}
          onChange={handleChange}
          required
        />

        <label className="contactanos-label">{trad.mensaje}</label>
        <textarea
          className="contactanos-textarea"
          name="mensaje"
          rows="4"
          value={formData.mensaje}
          onChange={handleChange}
          required
        ></textarea>

        <button className="contactanos-boton" type="submit">{trad.enviar}</button>
      </form>

      {estado && <p className="contactanos-estado">{estado}</p>}
    <Accesibilidad/>
    </div>
  );
}

export default Contactanos;
