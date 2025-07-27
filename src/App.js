import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import Navbar from "./componentes/NavBar/NavBar";
import Inicio from "./paginas/Inicio";
import Clubes from "./paginas/Clubes";
import Directorio from "./paginas/Directorio";
import Contactanos from "./paginas/Contactanos";
import Footer from "./componentes/Footer/Footer";
import Login from "./paginas/login";
import CrearCuenta from "./paginas/CrearCuenta";
import "./paginas/estilos/variables.css";

const LanguageWrapper = () => {
  const { lng } = useParams();
  const location = useLocation();

  // Redirige si el idioma no es válido
  React.useEffect(() => {
    if (!["es", "en"].includes(lng)) {
      const savedLang = localStorage.getItem("lng") || "es";
      window.location.replace(`/${savedLang}`);
    }
  }, [lng]);

  return (
    <>
      {location.pathname !== `/${lng}/login` && <Navbar />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="clubs" element={<Clubes />} />
        <Route path="directorio" element={<Directorio />} />
        <Route path="contactanos" element={<Contactanos />} />
        <Route path="login" element={<Login />} />
        <Route path="crear-cuenta" element={<CrearCuenta />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${localStorage.getItem("lng") || "es"}`} replace />} />
        <Route path="/:lng/*" element={<LanguageWrapper />} />
        <Route path="*" element={<Navigate to={`/${localStorage.getItem("lng") || "es"}`} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
