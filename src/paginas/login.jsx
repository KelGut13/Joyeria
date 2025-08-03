import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./estilos/login.css";
import chicaImg from "../imagenes/chica.jpg";
import Separar from "../componentes/Separador NavBar/Separador";

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
      const res = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        // Guarda el token y el usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // Redirige al perfil del cliente
        navigate("/perfil");
      }else {
        setError(data.error || "Error al iniciar sesión.");
      }
    } catch (err) {
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
