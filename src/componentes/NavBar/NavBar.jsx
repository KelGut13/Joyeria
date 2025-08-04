import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../imagenes/logo.svg";
import "../NavBar/NavBar.css";
import { useTheme } from "../../context/ThemeContext";
import CarritoIcono from '../CarritoIcono/CarritoIcono';

const categorias = [
  { nombre: "Aretes", ruta: "/aretes" },
  { nombre: "Pulseras", ruta: "/pulseras" },
  { nombre: "Llaveros", ruta: "/llaveros" },
  { nombre: "Juegos", ruta: "/juegos" },
  { nombre: "Descubrir", ruta: "/conocenos" },
];

const Navbar = () => {
  const [search, setSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // Cierra el menú al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showMobileMenu) setShowMobileMenu(false);
      if (showMobileSearch) setShowMobileSearch(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showMobileMenu, showMobileSearch]);

  // Cierra el menú al dar clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isHamburgerBtn = hamburgerRef.current && hamburgerRef.current.contains(event.target);
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);

      if (showMobileMenu && clickedOutsideMenu && !isHamburgerBtn) {
        setShowMobileMenu(false);
      }

      const clickedOutsideSearch = !event.target.closest(".mobile-search-form") && !event.target.closest(".minimal-search-btn");
      if (showMobileSearch && clickedOutsideSearch && clickedOutsideMenu) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileSearch, showMobileMenu]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedToken = localStorage.getItem('token');
      const storedUsuario = localStorage.getItem('usuario');
      
      if (storedToken && storedUsuario) {
        setToken(storedToken);
        try {
          setUsuario(JSON.parse(storedUsuario));
        } catch (error) {
          console.error('Error parsing usuario from localStorage:', error);
          localStorage.removeItem('usuario');
          setUsuario(null);
        }
      } else {
        setToken(null);
        setUsuario(null);
      }
    };

    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'usuario') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setShowMobileSearch(false);
    }
  };

  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...");
    
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    
    // Forzar actualización del contexto del carrito
    window.dispatchEvent(new Event('storage'));
    
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Botón hamburguesa animado */}
        <button
          className={`hamburger-btn${showMobileMenu ? " open" : ""}`}
          aria-label="Abrir menú"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          ref={hamburgerRef}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <Link to="/" className="navbar-logo-link">
          <img src={logo} alt="Logo" className="logo" />
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar joyas, colecciones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" aria-label="Buscar">
            <Search size={20} />
          </button>
        </form>

        {/* USAR SOLO NAVBAR-ICONS */}
        <div className="navbar-icons">
          <button
            className="minimal-search-btn"
            aria-label="Buscar"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search size={20} />
          </button>
          
          {/* Carrito de compras */}
          <CarritoIcono />
          
          {/* Usuario/Login */}
          {token ? (
            <div className="user-dropdown">
              <button className="user-btn">
                <i className="fas fa-user"></i>
                <span className="user-name">{usuario?.nombre}</span>
              </button>
              <div className="dropdown-menu">
                <Link to="/panel-usuario">
                  <i className="fas fa-user-cog"></i>
                  Mi cuenta
                </Link>
                <Link to="/mis-pedidos">
                  <i className="fas fa-box"></i>
                  Mis pedidos
                </Link>
                <button onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <i className="fas fa-user"></i>
              <span>Iniciar sesión</span>
            </Link>
          )}
          
          <button
            className="theme-toggle-switch"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Modal búsqueda móvil */}
      <div className={`mobile-search-modal${showMobileSearch ? " active" : ""}`}>
        <form className="mobile-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar joyas, colecciones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button type="submit" className="search-btn" aria-label="Buscar">
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Menú de categorías responsivo */}
      <div
        className={`navbar-categorias${showMobileMenu ? " open" : ""}`}
        ref={menuRef}
      >
        <ul className="categorias-list">
          {categorias.map(cat => (
            <li key={cat.nombre}>
              <Link
                to={cat.ruta}
                className={location.pathname.includes(cat.ruta) ? "active" : ""}
                onClick={() => setShowMobileMenu(false)}
              >
                {cat.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
