import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./componentes/NavBar/NavBar";
import Inicio from "./paginas/Inicio";
import Conocenos from "./paginas/Conocenos";
import Clubes from "./paginas/Clubes";
import Directorio from "./paginas/Directorio";
import Contactanos from "./paginas/Contactanos";
import Footer from "./componentes/Footer/Footer";
import Login from "./paginas/login";
import CrearCuenta from "./paginas/CrearCuenta";
import PanelUsuario from "./paginas/PanelUsuario";
import "./paginas/estilos/variables.css";
import Aretes from "./paginas/Aretes";
import Anillos from "./paginas/Anillos";
import Collares from "./paginas/Collares";
import Pulseras from "./paginas/Pulseras";
import Llavero from "./paginas/Llavero";
import Juegos from "./paginas/Juegos";
import { CarritoProvider } from "./context/CarritoContext";
import Carrito from "./paginas/Carrito";
import Checkout from "./paginas/Checkout";
import PedidoConfirmado from "./paginas/PedidoConfirmado";
import MisPedidos from "./paginas/MisPedidos";
import DetalleProducto from "./paginas/DetalleProducto";

const LanguageWrapper = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" &&
        location.pathname !== "/crear-cuenta" &&
        <Navbar />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/clubs" element={<Clubes />} />
        <Route path="/directorio" element={<Directorio />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/contactanos" element={<Contactanos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
        <Route path="/perfil" element={<PanelUsuario />} />
        <Route path="/panel-usuario" element={<PanelUsuario />} />
        <Route path="/aretes" element={<Aretes />} />
        <Route path="/anillos" element={<Anillos />} />
        <Route path="/collares" element={<Collares />} />
        <Route path="/pulseras" element={<Pulseras />} />
        <Route path="/llaveros" element={<Llavero />} />
        <Route path="/Juegos" element={<Juegos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedido-confirmado/:pedidoId" element={<PedidoConfirmado />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <CarritoProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<LanguageWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CarritoProvider>
  );
};

export default App;
