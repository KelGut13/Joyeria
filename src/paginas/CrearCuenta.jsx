
import React from "react";

const CrearCuenta = () => {
  return (
    <div className="crear-cuenta-container">
      <h2>Crear Cuenta</h2>
      <form className="crear-cuenta-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input type="text" id="nombre" name="nombre" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Crear Cuenta</button>
      </form>
    </div>
  );
};

export default CrearCuenta;
