import React, { useState } from "react";
import "./estilos/Contactanos.css";
import Separar from "../componentes/Separador NavBar/Separador";
import Accesibilidad from "../componentes/Accesibilidad/Accesibilidad";

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
      const response = await fetch("http://localhost:5001/api/contacto", {
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
      <Separar />
      <h1 className="contactanos-titulo">Contáctanos</h1>

      <form className="contactanos-form" onSubmit={handleSubmit}>
        <label className="contactanos-label">Nombre:</label>
        <input
          className="contactanos-input"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <label className="contactanos-label">Correo:</label>
        <input
          className="contactanos-input"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          required
        />

        <label className="contactanos-label">Asunto:</label>
        <input
          className="contactanos-input"
          type="text"
          name="asunto"
          value={formData.asunto}
          onChange={handleChange}
          required
        />

        <label className="contactanos-label">Mensaje:</label>
        <textarea
          className="contactanos-textarea"
          name="mensaje"
          rows="4"
          value={formData.mensaje}
          onChange={handleChange}
          required
        ></textarea>

        <button className="contactanos-boton" type="submit">Enviar</button>
      </form>

      {estado && <p className="contactanos-estado">{estado}</p>}
      <Accesibilidad />
    </div>
  );
}

export default Contactanos;
