import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./estilos/Perfil.css";
import Separar from "../componentes/Separador NavBar/Separador";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const usuarioStorage = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    
    if (!usuarioStorage || !token) {
      navigate("/login");
      return;
    }
    
    setUsuario(JSON.parse(usuarioStorage));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  const profileSections = [
    {
      id: 'datos-personales',
      title: 'Datos personales',
      description: `${usuario.nombre} ${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`,
      icon: '👤',
      status: 'Validado',
      color: '#e8d5ff'
    },
    {
      id: 'datos-cuenta',
      title: 'Datos de tu cuenta',
      description: 'Datos que representan tu cuenta.',
      icon: '✉️',
      status: 'Validado',
      color: '#e8d5ff'
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      description: 'Configura la seguridad de tu cuenta.',
      icon: '🛡️',
      status: 'Validado',
      color: '#e8d5ff'
    },
    {
      id: 'direcciones',
      title: 'Direcciones',
      description: 'Direcciones guardadas en tu cuenta.',
      icon: '📍',
      status: '',
      color: '#e8d5ff'
    }
  ];

  return (
    <div className="perfil-page">
      <Separar />
      
      {/* Header del perfil */}
      <div className="perfil-header">
        <div className="perfil-avatar">
          <div className="avatar-circle">
            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <div className="perfil-info">
          <h1>{usuario.nombre} {usuario.primer_apellido || ''}</h1>
          <p>{usuario.email}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Grid de secciones */}
      <div className="perfil-sections">
        {profileSections.map((section) => (
          <div 
            key={section.id}
            className="section-card"
            onClick={() => setActiveSection(section.id)}
            style={{ backgroundColor: section.color }}
          >
            <div className="section-icon">
              {section.icon}
            </div>
            <div className="section-content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              {section.status && (
                <span className="section-status">✓ {section.status}</span>
              )}
            </div>
            <div className="section-arrow">
              <span>✏️</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar secciones */}
      {activeSection && (
        <div className="modal-overlay" onClick={() => setActiveSection(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {profileSections.find(s => s.id === activeSection)?.title}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {activeSection === 'datos-personales' && (
                <DatosPersonales usuario={usuario} setUsuario={setUsuario} />
              )}
              {activeSection === 'datos-cuenta' && (
                <DatosCuenta usuario={usuario} setUsuario={setUsuario} />
              )}
              {activeSection === 'seguridad' && (
                <Seguridad usuario={usuario} />
              )}
              {activeSection === 'direcciones' && (
                <Direcciones usuario={usuario} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para datos personales
const DatosPersonales = ({ usuario, setUsuario }) => {
  const [form, setForm] = useState({
    nombre: usuario.nombre || '',
    primer_apellido: usuario.primer_apellido || '',
    segundo_apellido: usuario.segundo_apellido || '',
    telefono: usuario.telefono || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí implementarías la actualización de datos personales
    console.log('Actualizando datos personales:', form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="form-group">
        <label>Nombre</label>
        <input
          type="text"
          value={form.nombre}
          onChange={(e) => setForm({...form, nombre: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Primer apellido</label>
        <input
          type="text"
          value={form.primer_apellido}
          onChange={(e) => setForm({...form, primer_apellido: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Segundo apellido</label>
        <input
          type="text"
          value={form.segundo_apellido}
          onChange={(e) => setForm({...form, segundo_apellido: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="tel"
          value={form.telefono}
          onChange={(e) => setForm({...form, telefono: e.target.value})}
        />
      </div>
      <button type="submit" className="save-btn">Guardar cambios</button>
    </form>
  );
};

// Componente para datos de cuenta
const DatosCuenta = ({ usuario, setUsuario }) => {
  const [form, setForm] = useState({
    email: usuario.email || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Actualizando datos de cuenta:', form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="form-group">
        <label>Correo electrónico</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          required
        />
      </div>
      <button type="submit" className="save-btn">Guardar cambios</button>
    </form>
  );
};

// Componente para seguridad
const Seguridad = ({ usuario }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Actualizando contraseña');
  };

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="form-group">
        <label>Contraseña actual</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({...form, currentPassword: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Nueva contraseña</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({...form, newPassword: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Confirmar nueva contraseña</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
          required
        />
      </div>
      <button type="submit" className="save-btn">Cambiar contraseña</button>
    </form>
  );
};

// Componente para direcciones
const Direcciones = ({ usuario }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    alias: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Agregando nueva dirección:', form);
    setShowForm(false);
  };

  return (
    <div className="direcciones-section">
      <div className="direcciones-header">
        <h3>Mis direcciones</h3>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          + Agregar dirección
        </button>
      </div>

      {direcciones.length === 0 ? (
        <p>No tienes direcciones guardadas</p>
      ) : (
        <div className="direcciones-list">
          {direcciones.map((direccion, index) => (
            <div key={index} className="direccion-card">
              <h4>{direccion.alias}</h4>
              <p>{direccion.calle} {direccion.numero_exterior}</p>
              <p>{direccion.colonia}, {direccion.ciudad}</p>
              <p>{direccion.estado} {direccion.codigo_postal}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label>Alias</label>
            <input
              type="text"
              value={form.alias}
              onChange={(e) => setForm({...form, alias: e.target.value})}
              placeholder="Casa, Trabajo, etc."
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Calle</label>
              <input
                type="text"
                value={form.calle}
                onChange={(e) => setForm({...form, calle: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Número exterior</label>
              <input
                type="text"
                value={form.numero_exterior}
                onChange={(e) => setForm({...form, numero_exterior: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Colonia</label>
              <input
                type="text"
                value={form.colonia}
                onChange={(e) => setForm({...form, colonia: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input
                type="text"
                value={form.ciudad}
                onChange={(e) => setForm({...form, ciudad: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-buttons">
            <button type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              Guardar dirección
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Perfil;
