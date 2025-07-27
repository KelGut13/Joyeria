import React from "react";
import Separar from "../componentes/Separador NavBar/Separador";
import Carrusel from "../componentes/Carrusel/Carrusel";
import "./estilos/Inicio.css";

const Inicio = () => {
  return (
    <div className="Container-Inicio">
      <Separar />
      <Carrusel />
    </div>
  );
};

export default Inicio;