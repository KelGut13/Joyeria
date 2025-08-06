import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './estilos/RecuperarPassword.css';
import Separar from '../componentes/Separador NavBar/Separador';
import { ArrowLeft, Mail, CheckCircle, XCircle } from 'lucide-react';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    // Validaciones básicas
    if (!email.trim()) {
      setError('El email es requerido.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.message);
        setEnviado(true);
      } else {
        setError(data.error || 'Error al procesar la solicitud.');
      }
    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="recuperar-password-page">
      <Separar />
      <div className="recuperar-password-container">
        {/* Header con botón volver */}
        <div className="recuperar-password-header">
          <Link to="/login" className="recuperar-password-btn-volver">
            <ArrowLeft size={20} />
            Volver al Login
          </Link>
          <h1>Recuperar Contraseña</h1>
        </div>

        {/* Contenido principal */}
        <div className="recuperar-password-content">
          {!enviado ? (
            <div className="recuperar-password-form-container">
              {/* Icono y descripción */}
              <div className="recuperar-password-icon-section">
                <div className="recuperar-password-icon">
                  <Mail size={48} />
                </div>
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>
                  No te preocupes, ingresa tu email y te enviaremos un enlace 
                  para restablecer tu contraseña.
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="recuperar-password-form">
                {error && (
                  <div className="recuperar-password-error-message">
                    <XCircle size={20} />
                    {error}
                  </div>
                )}

                <div className="recuperar-password-form-group">
                  <label htmlFor="email" className="recuperar-password-label">
                    Correo Electrónico
                  </label>
                  <div className="recuperar-password-input-container">
                    <Mail className="recuperar-password-input-icon" size={20} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="recuperar-password-input"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="recuperar-password-btn-enviar"
                >
                  {loading ? (
                    <>
                      <div className="recuperar-password-spinner"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </button>
              </form>

              <div className="recuperar-password-links">
                <p>
                  ¿Recordaste tu contraseña?{' '}
                  <Link to="/login" className="recuperar-password-link">
                    Iniciar Sesión
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="recuperar-password-success">
              <div className="recuperar-password-success-icon">
                <CheckCircle size={64} />
              </div>
              <h2>Solicitud Procesada</h2>
              <div className="recuperar-password-success-message">
                <p>{mensaje}</p>
                <p>Si el email existe en nuestro sistema, recibirás las instrucciones en tu bandeja de entrada.</p>
              </div>

              <div className="recuperar-password-success-info">
                <div className="recuperar-password-info-item">
                  <span className="recuperar-password-info-label">Email consultado:</span>
                  <span className="recuperar-password-info-value">{email}</span>
                </div>
              </div>

              <div className="recuperar-password-success-actions">
                <Link to="/login" className="recuperar-password-btn-login">
                  Volver al Login
                </Link>
                <button
                  onClick={() => {
                    setEnviado(false);
                    setEmail('');
                    setMensaje('');
                    setError('');
                  }}
                  className="recuperar-password-btn-reenviar"
                >
                  Intentar con Otro Email
                </button>
              </div>

              <div className="recuperar-password-help">
                <h4>¿No recibiste el email?</h4>
                <ul>
                  <li>Verifica que el email esté registrado en nuestro sistema</li>
                  <li>Revisa tu carpeta de spam o correo no deseado</li>
                  <li>Verifica que el email sea correcto</li>
                  <li>Espera unos minutos, el email puede tardar</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
