import React from "react";
import logo from "../../imagenes/logo-footer.png";
import "../Footer/Footer.css";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-logo">
        <img src={logo} alt="Logo" className="logo-footer" />
        <p>Curiosidades Nancy</p>
      </div>
      <div className="footer-links">
        <h3>Información de contacto</h3>
        <ul>
           <li>
            <Phone size={20} style={{marginRight:8, verticalAlign:"middle"}} />
            <a href="tel:+523111281177">+52 311 128 1177</a>
          </li>
          <li>
            <Mail size={20} style={{marginRight:8, verticalAlign:"middle"}} />
            <a href="mailto:curiosidadesnancy@gmail.com">curiosidadesnancy@gmail.com</a>
          </li>
        </ul>
      </div>
      <div className="footer-social">
        <h3>Síguenos</h3>
        <div className="social-icons">
          <a href="https://www.facebook.com/p/Curiosidades-Nancy-100063615276770/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://www.instagram.com/curiosidadesnancy/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
      <p className="developer">
        Desarrollado por <a href="#" target="_blank" rel="noopener noreferrer" className="keycapsoft">Equipo 2</a>
      </p>
    </div>
  </footer>
);

export default Footer;
