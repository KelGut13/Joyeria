import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

    // El segundo apellido es opcional, no necesita validación

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
      <h2>Crear una nueva cuenta</h2>
      <form className="crear-cuenta-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre *</label>
          <input 
            type="text" 
            id="nombre" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            placeholder="Ingresa tu nombre"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="primer_apellido">Primer Apellido *</label>
          <input 
            type="text" 
            id="primer_apellido" 
            name="primer_apellido" 
            value={form.primer_apellido} 
            onChange={handleChange} 
            placeholder="Ingresa tu primer apellido"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="segundo_apellido">Segundo Apellido</label>
          <input 
            type="text" 
            id="segundo_apellido" 
            name="segundo_apellido" 
            value={form.segundo_apellido} 
            onChange={handleChange} 
            placeholder="Ingresa tu segundo apellido (opcional)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico *</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="ejemplo@correo.com"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono *</label>
          <input 
            type="tel" 
            id="telefono" 
            name="telefono" 
            value={form.telefono} 
            onChange={handleChange} 
            placeholder="10 dígitos sin espacios"
            maxLength="10"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña *</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Mínimo 6 caracteres"
            minLength="6"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="repetir_password">Confirmar Contraseña *</label>
          <input 
            type="password" 
            id="repetir_password" 
            name="repetir_password" 
            value={form.repetir_password} 
            onChange={handleChange} 
            placeholder="Repite tu contraseña"
            required 
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <button type="submit">Crear cuenta</button>
      </form>

      {/* Modal de éxito */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¡Cuenta creada exitosamente! 🎉</h3>
            <p style={{color: '#64748b', marginBottom: '24px', fontSize: '0.9rem'}}>
              Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.
            </p>
            <button onClick={handleModalClose}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearCuenta;
