import React from "react";
import { Link, useParams } from "react-router-dom";
import "./estilos/login.css";
import chicaImg from "../imagenes/chica.jpg"; // Usa tu imagen
import Separar from "../componentes/Separador NavBar/Separador";

const Login = () => {
  const { lng } = useParams();
  return (
    <div className="login-page">
      <div className="login-img-section">
        <img src={chicaImg} alt="Joyería" className="login-img" />
      </div>
      <div className="login-form-section">
        <h2 className="login-title">Iniciar sesión</h2>
        <form className="login-form">
          <label htmlFor="usuario">Usuario</label>
          <input type="text" id="usuario" name="usuario" autoComplete="username" />
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="password" autoComplete="current-password" />
          <button type="submit" className="login-btn">ENVIAR</button>
          <div className="login-links">
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            <Link to={`/${lng}/crear-cuenta`} className="create-link">Crear Cuenta</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;