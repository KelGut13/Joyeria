import React, { useState } from "react";
import "./estilos/Contactanos.css";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad";
import { API_ENDPOINTS } from '../config/api';

function Contactanos() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: ""
  });

  const [estado, setEstado] = useState("");

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
      const response = await fetch(API_ENDPOINTS.CONTACTO, {
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
      setEstado("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="contactanos-container">
      <h1 className="contactanos-titulo">Contáctanos</h1>

      <form className="contactanos-form" onSubmit={handleSubmit}>
        <div className="contactanos-form-group">
          <label className="contactanos-label">Nombre:</label>
          <input
            className="contactanos-input"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

        <div className="contactanos-form-group">
          <label className="contactanos-label">Correo:</label>
          <input
            className="contactanos-input"
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div className="contactanos-form-group">
          <label className="contactanos-label">Asunto:</label>
          <input
            className="contactanos-input"
            type="text"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            placeholder="¿De qué quieres hablar?"
            required
          />
        </div>

        <div className="contactanos-form-group">
          <label className="contactanos-label">Mensaje:</label>
          <textarea
            className="contactanos-textarea"
            name="mensaje"
            rows="4"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Cuéntanos tu consulta o comentario..."
            required
          ></textarea>
        </div>

        <button className="contactanos-boton" type="submit">
          {estado === "Enviando..." ? "Enviando..." : "Enviar Mensaje"}
        </button>
      </form>

      {estado && <p className="contactanos-estado">{estado}</p>}
      <Accesibilidad />
    </div>
  );
}

export default Contactanos;
