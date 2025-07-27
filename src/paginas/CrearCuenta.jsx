import React from "react";
import { useParams } from "react-router-dom";
import { translateText } from "../utils/translate";
import "./estilos/CrearCuenta.css";
import "../paginas/estilos/variables.css";
import Separar from "../componentes/Separador NavBar/Separador";

const CrearCuenta = () => {
  return (
    <div className="crear-cuenta-container">
      <Separar />
      <h2>Crear Cuenta</h2>
      <form className="crear-cuenta-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombres</label>
          <input type="text" id="nombre" name="nombre" required />
        </div>
          <div className="form-group">
          <label htmlFor="Primer Apellido">Primer Apellido</label>
          <input type="text" id="Primer Apellido" name="Primer Apellido" required />
        </div>
          <div className="form-group">
          <label htmlFor="Segundo Apellido">Segundo Apellido</label>
          <input type="text" id="Segundo Apellido" name="Segundo Apellido" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Repetir Contraseña</label>
          <input type="password" id="Repetir Contraseña" name="Repetir Contraseña" required />
        </div>
         <div className="form-group">
          <label htmlFor="Telefono">Telefono</label>
          <input type="text" id="Telefono" name="Telefono" required />
        </div>
        <button type="submit">Crear Cuenta</button>
      </form>
    </div>
  );
};

export default CrearCuenta;
