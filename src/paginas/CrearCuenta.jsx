import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Separar from "../componentes/Separador NavBar/Separador";
import { API_ENDPOINTS } from "../config/api";
import "./estilos/CrearCuenta.css";
import "../paginas/estilos/variables.css";

const CrearCuenta = () => {
  const [form, setForm] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    email: "",
    password: "",
    repetir_password: "",
    telefono: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones del frontend
    if (!form.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }

    if (!form.primer_apellido.trim()) {
      setError("El primer apellido es requerido.");
      return;
    }

    if (!form.email.trim()) {
      setError("El correo electrónico es requerido.");
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }

    if (!form.telefono.trim()) {
      setError("El número de teléfono es requerido.");
      return;
    }

    // Validación de formato de teléfono (solo números, 10 dígitos)
    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(form.telefono)) {
      setError("El teléfono debe tener exactamente 10 dígitos numéricos.");
      return;
    }

    if (!form.password) {
      setError("La contraseña es requerida.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password !== form.repetir_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.CREAR_CUENTA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          primer_apellido: form.primer_apellido.trim(),
          segundo_apellido: form.segundo_apellido.trim() || null,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          telefono: form.telefono.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Cuenta creada correctamente.");
        setShowModal(true); // Mostrar modal
        setForm({
          nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          email: "",
          password: "",
          repetir_password: "",
          telefono: ""
        });
      } else {
        setError(data.error || "Error al crear la cuenta.");
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      setError("Error de conexión con el servidor.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/login"); // Redirige al login
  };

  return (
    <div className="crear-cuenta-container">
      <Separar />
      <h2>Crear Cuenta</h2>
      <form className="crear-cuenta-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input type="text" id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="primer_apellido">Primer Apellido</label>
          <input type="text" id="primer_apellido" name="primer_apellido" value={form.primer_apellido} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="segundo_apellido">Segundo Apellido</label>
          <input type="text" id="segundo_apellido" name="segundo_apellido" value={form.segundo_apellido} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="repetir_password">Repetir Contraseña</label>
          <input type="password" id="repetir_password" name="repetir_password" value={form.repetir_password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input type="text" id="telefono" name="telefono" value={form.telefono} onChange={handleChange} required />
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button type="submit">Crear Cuenta</button>
      </form>

      {/* Modal de éxito */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¡Cuenta creada exitosamente!</h3>
            <button onClick={handleModalClose}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearCuenta;
