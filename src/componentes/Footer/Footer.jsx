import React from "react";
import logo from "../../imagenes/logo.svg";
import "../Footer/Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-logo">
        <img src={logo} alt="Logo" className="logo" />
        <p>Federación Nacional e Internacional de Nayaritas en Estados Unidos</p>
      </div>
      <div className="footer-links">
        <h3>Enlaces</h3>
        <ul>
          <li><a href="https://www.nayarit.gob.mx/">Gobierno de Nayarit</a></li>
          <li><a href="https://www.gob.mx/">Gobierno de México</a></li>
          <li><a href="https://www.gob.mx/sre">SRE</a></li>
        </ul>
      </div>
      <div className="footer-social">
        <h3>Síguenos</h3>
        <div className="social-icons">
          <a href="https://www.facebook.com/Nayaritas" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
      <p className="developer">
        Desarrollado por <a href="https://www.keycapsoft.com" target="_blank" rel="noopener noreferrer" className="keycapsoft">Keycapsoft</a>
      </p>
    </div>
  </footer>
);

export default Footer;
