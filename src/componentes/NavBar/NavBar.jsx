import React, { useState, useRef, useEffect } from "react";
import { Search, User, UserCheck, Settings, Package, LogOut, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../imagenes/logo.svg";
import "../NavBar/NavBar.css";
import { useTheme } from "../../context/ThemeContext";
import CarritoIcono from '../CarritoIcono/CarritoIcono';
import { API_ENDPOINTS, getFirstProductImage } from '../../config/api';

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
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const searchRef = useRef(null);
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

      // Cerrar resultados de búsqueda al hacer clic fuera
      const clickedOutsideSearchResults = searchRef.current && !searchRef.current.contains(event.target);
      if (showSearchResults && clickedOutsideSearchResults) {
        setShowSearchResults(false);
      }

      // Limpiar barra de búsqueda cuando se hace clic fuera de toda el área de búsqueda
      const clickedOutsideEntireSearch = !event.target.closest(".search-container") && 
                                        !event.target.closest(".mobile-search-modal") &&
                                        !event.target.closest(".minimal-search-btn");
      
      if (clickedOutsideEntireSearch && search.trim().length > 0) {
        setSearch("");
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileSearch, showMobileMenu, showSearchResults, search]);

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

  // Función para buscar productos
  const searchProducts = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 Iniciando búsqueda para:', searchTerm);
      console.log('📡 Endpoint:', API_ENDPOINTS.PRODUCTOS);
      
      // Obtener productos y materiales en paralelo
      const [productosResponse, materialesResponse] = await Promise.all([
        fetch(API_ENDPOINTS.PRODUCTOS, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_ENDPOINTS.PRODUCTOS.replace('/productos', '/materiales')}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      console.log('📊 Respuesta del servidor:', productosResponse.status, productosResponse.statusText);
      
      if (!productosResponse.ok) {
        if (productosResponse.status === 500) {
          console.error('❌ Error del servidor (500). El backend podría estar desconectado.');
          throw new Error('El servidor no está disponible en este momento.');
        } else if (productosResponse.status === 404) {
          console.error('❌ Endpoint no encontrado (404)');
          throw new Error('El servicio de búsqueda no está disponible.');
        } else {
          throw new Error(`Error del servidor: ${productosResponse.status}`);
        }
      }
      
      const productos = await productosResponse.json();
      const materiales = materialesResponse.ok ? await materialesResponse.json() : [];
      
      console.log('✅ Productos obtenidos:', productos?.length || 0);
      console.log('✅ Materiales obtenidos:', materiales?.length || 0);
      
      if (!Array.isArray(productos)) {
        throw new Error('Respuesta del servidor no válida');
      }
      
      // Crear mapa de materiales para búsqueda rápida
      const materialesMap = {};
      if (Array.isArray(materiales)) {
        materiales.forEach(material => {
          materialesMap[material.ID_material] = material.nombre_material;
        });
      }
      
      // Enriquecer productos con nombre del material
      const productosEnriquecidos = productos.map(producto => ({
        ...producto,
        material: materialesMap[producto.id_material] || 'Material no especificado'
      }));
      
      // Filtrar productos que coincidan con el término de búsqueda
      const resultados = productosEnriquecidos.filter(producto => {
        const searchLower = searchTerm.toLowerCase();
        return (
          producto.nombre.toLowerCase().includes(searchLower) ||
          (producto.descripcion && producto.descripcion.toLowerCase().includes(searchLower)) ||
          (producto.material && producto.material.toLowerCase().includes(searchLower)) ||
          (producto.marca && producto.marca.toLowerCase().includes(searchLower))
        );
      }).slice(0, 6); // Limitar a 6 resultados

      console.log('🎯 Resultados filtrados:', resultados.length);
      
      setSearchResults(resultados);
      // Siempre mostrar el dropdown cuando hay resultados o cuando se busca
      setShowSearchResults(true);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      
      // Mostrar diferentes mensajes según el tipo de error
      if (error.message.includes('servidor no está disponible')) {
        setSearchResults([{ error: 'Servidor no disponible' }]);
      } else if (error.message.includes('servicio de búsqueda no está disponible')) {
        setSearchResults([{ error: 'Servicio no disponible' }]);
      } else {
        setSearchResults([{ error: 'Error de conexión' }]);
      }
      
      setShowSearchResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Effect para búsqueda en tiempo real
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim().length >= 2) {
        searchProducts(search);
        setShowSearchResults(true); // Mostrar automáticamente los resultados
      } else if (search.trim().length === 0) {
        setSearchResults([]);
        setShowSearchResults(false);
      } else {
        // Si tiene 1 carácter, ocultar resultados pero no limpiar
        setShowSearchResults(false);
      }
    }, 200); // Debounce de 200ms para mayor velocidad

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleProductClick = (productId) => {
    navigate(`/producto/${productId}`);
    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);
    setShowMobileSearch(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Si hay un producto específico seleccionado, ir a él
      if (searchResults.length > 0) {
        handleProductClick(searchResults[0].ID_producto);
      }
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

        <div className="search-container" ref={searchRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar joyas, colecciones..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
              onFocus={() => {
                // Si ya hay texto y resultados, mostrar el dropdown
                if (search.trim().length >= 2 && searchResults.length >= 0) {
                  setShowSearchResults(true);
                }
              }}
            />
            <button type="submit" className="search-btn" aria-label="Buscar">
              <Search size={20} strokeWidth={1.8} />
            </button>
          </form>

          {/* Dropdown de resultados de búsqueda */}
          {showSearchResults && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-loading">
                  <div className="loading-spinner"></div>
                  <span>Buscando...</span>
                </div>
              ) : searchResults.length > 0 && searchResults[0].error ? (
                <div className="search-error">
                  <span>⚠️ {searchResults[0].error === 'Servidor no disponible' 
                    ? 'El servidor no está disponible. Intenta más tarde.' 
                    : searchResults[0].error === 'Servicio no disponible' 
                    ? 'El servicio de búsqueda no está disponible.' 
                    : 'Error de conexión. Verifica tu conexión a internet.'}</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map(producto => (
                    <div 
                      key={producto.ID_producto} 
                      className="search-result-item"
                      onClick={() => handleProductClick(producto.ID_producto)}
                    >
                      <div className="result-image">
                        <img 
                          src={getFirstProductImage(producto)} 
                          alt={producto.nombre}
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="result-info">
                        <h4 className="result-name">{producto.nombre}</h4>
                        <p className="result-price">{formatPrice(producto.precio)}</p>
                        <p className="result-material">{producto.material || 'Material no especificado'}</p>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 6 && (
                    <div className="search-result-more">
                      Ver más resultados...
                    </div>
                  )}
                </>
              ) : search.trim().length >= 2 && !isSearching ? (
                <div className="search-no-results">
                  <Search size={24} />
                  <span>No se encontraron productos</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* USAR SOLO NAVBAR-ICONS */}
        <div className="navbar-icons">
          {/* Carrito de compras */}
          <CarritoIcono />
          
          {/* Usuario/Login */}
          {token ? (
            <div className="user-dropdown">
              <button className="user-btn">
                <UserCheck size={20} strokeWidth={1.8} />
                <span className="user-name">{usuario?.nombre}</span>
              </button>
              <div className="dropdown-menu">
                <Link to="/panel-usuario">
                  <Settings size={18} strokeWidth={1.8} />
                  Mi cuenta
                </Link>
                <Link to="/mis-pedidos">
                  <Package size={18} strokeWidth={1.8} />
                  Mis pedidos
                </Link>
                <button onClick={handleLogout}>
                  <LogOut size={18} strokeWidth={1.8} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <User size={20} strokeWidth={1.8} />
            </Link>
          )}
          
          <button
            className="theme-toggle-switch"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === "light" ? 
              <Moon size={20} strokeWidth={1.8} /> : 
              <Sun size={20} strokeWidth={1.8} />
            }
          </button>
        </div>

        {/* Iconos móviles - solo visibles en móvil */}
        <div className="navbar-mobile-icons">
          <button
            className="minimal-search-btn"
            aria-label="Buscar"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search size={20} strokeWidth={1.8} />
          </button>
          
          {/* Carrito de compras */}
          <CarritoIcono />
          
          {/* Usuario/Login móvil */}
          {token ? (
            <div className="user-dropdown">
              <button className="user-btn">
                <UserCheck size={20} strokeWidth={1.8} />
              </button>
              <div className="dropdown-menu">
                <Link to="/panel-usuario">
                  <Settings size={18} strokeWidth={1.8} />
                  Mi cuenta
                </Link>
                <Link to="/mis-pedidos">
                  <Package size={18} strokeWidth={1.8} />
                  Mis pedidos
                </Link>
                <button onClick={handleLogout}>
                  <LogOut size={18} strokeWidth={1.8} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <User size={20} strokeWidth={1.8} />
            </Link>
          )}
          
          <button
            className="theme-toggle-switch"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === "light" ? 
              <Moon size={20} strokeWidth={1.8} /> : 
              <Sun size={20} strokeWidth={1.8} />
            }
          </button>
        </div>
      </div>

      {/* Modal búsqueda móvil */}
      <div className={`mobile-search-modal${showMobileSearch ? " active" : ""}`}>
        <div className="mobile-search-container">
          <form className="mobile-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar joyas, colecciones..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
              autoFocus
            />
            <button type="submit" className="search-btn" aria-label="Buscar">
              <Search size={20} strokeWidth={1.8} />
            </button>
          </form>

          {/* Resultados de búsqueda móvil */}
          {showSearchResults && (
            <div className="mobile-search-results">
              {isSearching ? (
                <div className="search-loading">
                  <div className="loading-spinner"></div>
                  <span>Buscando...</span>
                </div>
              ) : searchResults.length > 0 && searchResults[0].error ? (
                <div className="search-error">
                  <span>⚠️ {searchResults[0].error === 'Servidor no disponible' 
                    ? 'El servidor no está disponible.' 
                    : 'Error de conexión.'}</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map(producto => (
                    <div 
                      key={producto.ID_producto} 
                      className="search-result-item"
                      onClick={() => handleProductClick(producto.ID_producto)}
                    >
                      <div className="result-image">
                        <img 
                          src={getFirstProductImage(producto)} 
                          alt={producto.nombre}
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="result-info">
                        <h4 className="result-name">{producto.nombre}</h4>
                        <p className="result-price">{formatPrice(producto.precio)}</p>
                        <p className="result-material">{producto.material || 'Material no especificado'}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : search.trim().length >= 2 && (
                <div className="search-no-results">
                  <Search size={24} />
                  <span>No se encontraron productos</span>
                </div>
              )}
            </div>
          )}
        </div>
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
