import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./estilos/login.css";
import chicaImg from "../imagenes/chica.jpg";
import Separar from "../componentes/Separador NavBar/Separador";
import { API_ENDPOINTS } from '../config/api';

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        // Guarda el token y el usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        console.log("✅ Login exitoso, datos guardados:", {
          token: !!data.token,
          usuario: data.usuario.nombre,
          id: data.usuario.id
        });
        
        // Forzar actualización del contexto del carrito
        window.dispatchEvent(new Event('storage'));
        
        // Esperar un poco más para que el contexto del carrito detecte el cambio
        setTimeout(() => {
          console.log("🔄 Redirigiendo a panel de usuario...");
          navigate("/panel-usuario");
          // Forzar recarga de la página para asegurar sincronización
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }, 1000);
      } else {
        setError(data.error || "Error al iniciar sesión.");
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="login-page">
      <Separar />
      <div className="login-img-section">
        <img src={chicaImg} alt="Joyería" className="login-img" />
      </div>
      <div className="login-form-section">
        <h2 className="login-title">Iniciar sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
          
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required />
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" className="login-btn">ACCEDER</button>
          
          <div className="login-links">
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            <Link to="/crear-cuenta" className="create-link">Crear Cuenta</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
