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
    <div className="inicio-login-page">
      <Separar />
      <div className="inicio-login-img-section">
        <img src={chicaImg} alt="Joyería" className="inicio-login-img" />
      </div>
      <div className="inicio-login-form-section">
        <h2 className="inicio-login-title">Iniciar sesión</h2>
        <form className="inicio-login-form" onSubmit={handleSubmit}>
          <div className="inicio-form-group">
            <label htmlFor="email">Correo electrónico</label>
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
          
          <div className="inicio-form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="Ingresa tu contraseña"
              required 
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" className="inicio-login-btn">ACCEDER</button>
          
          <div className="inicio-login-links">
            <Link to="/recuperar-password" className="inicio-forgot-link">¿Olvidaste tu contraseña?</Link>
            <Link to="/crear-cuenta" className="inicio-create-link">Crear Cuenta Nueva</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
