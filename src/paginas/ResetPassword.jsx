import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './estilos/ResetPassword.css';
import Separar from '../componentes/Separador NavBar/Separador';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Shield } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const token = searchParams.get('token');

  // Verificar token al cargar la página
  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido.');
      setTokenValid(false);
      return;
    }

    // Aquí podrías hacer una validación previa del token si quisieras
    setTokenValid(true);
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!formData.password.trim() || !formData.confirmPassword.trim()) {
      setError('Todos los campos son requeridos.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña.' 
            }
          });
        }, 3000);
      } else {
        setError(data.error || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para evaluar la fortaleza de la contraseña
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Muy débil', color: '#dc2626' };
    if (password.length < 8) return { strength: 2, label: 'Débil', color: '#f59e0b' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 4, label: 'Fuerte', color: '#10b981' };
    }
    if (password.length >= 8) return { strength: 3, label: 'Buena', color: '#3b82f6' };
    return { strength: 2, label: 'Débil', color: '#f59e0b' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (tokenValid === false) {
    return (
      <div className="reset-password-page">
        <Separar />
        <div className="reset-password-container">
          <div className="reset-password-content">
            <div className="reset-password-error-state">
              <div className="reset-password-error-icon">
                <XCircle size={64} />
              </div>
              <h2>Enlace No Válido</h2>
              <p>
                El enlace de recuperación no es válido o ha expirado. 
                Por favor, solicita un nuevo enlace de recuperación.
              </p>
              <div className="reset-password-error-actions">
                <Link to="/recuperar-password" className="reset-password-btn-primary">
                  Solicitar Nuevo Enlace
                </Link>
                <Link to="/login" className="reset-password-btn-secondary">
                  Volver al Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <Separar />
        <div className="reset-password-container">
          <div className="reset-password-content">
            <div className="reset-password-success-state">
              <div className="reset-password-success-icon">
                <CheckCircle size={64} />
              </div>
              <h2>¡Contraseña Actualizada!</h2>
              <p>Tu contraseña ha sido cambiada exitosamente.</p>
              <p>Serás redirigido al login en unos momentos...</p>
              <div className="reset-password-success-actions">
                <Link to="/login" className="reset-password-btn-primary">
                  Ir al Login Ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <Separar />
      <div className="reset-password-container">
        {/* Header */}
        <div className="reset-password-header">
          <Link to="/login" className="reset-password-btn-volver">
            <ArrowLeft size={20} />
            Volver al Login
          </Link>
          <h1>Restablecer Contraseña</h1>
        </div>

        {/* Contenido principal */}
        <div className="reset-password-content">
          <div className="reset-password-form-container">
            {/* Icono y descripción */}
            <div className="reset-password-icon-section">
              <div className="reset-password-icon">
                <Shield size={48} />
              </div>
              <h2>Nueva Contraseña</h2>
              <p>
                Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="reset-password-form">
              {error && (
                <div className="reset-password-error-message">
                  <XCircle size={20} />
                  {error}
                </div>
              )}

              {/* Nueva contraseña */}
              <div className="reset-password-form-group">
                <label htmlFor="password" className="reset-password-label">
                  Nueva Contraseña
                </label>
                <div className="reset-password-input-container">
                  <Lock className="reset-password-input-icon" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu nueva contraseña"
                    className="reset-password-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="reset-password-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Indicador de fortaleza */}
                {formData.password && (
                  <div className="reset-password-strength-container">
                    <div className="reset-password-strength-bar">
                      <div 
                        className="reset-password-strength-fill"
                        style={{
                          width: `${(passwordStrength.strength / 4) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      />
                    </div>
                    <span 
                      className="reset-password-strength-label"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="reset-password-form-group">
                <label htmlFor="confirmPassword" className="reset-password-label">
                  Confirmar Contraseña
                </label>
                <div className="reset-password-input-container">
                  <Lock className="reset-password-input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirma tu nueva contraseña"
                    className="reset-password-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="reset-password-toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Validación de coincidencia */}
                {formData.confirmPassword && formData.password && (
                  <div className={`reset-password-match-indicator ${
                    formData.password === formData.confirmPassword ? 'match' : 'no-match'
                  }`}>
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle size={16} />
                        Las contraseñas coinciden
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Las contraseñas no coinciden
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Requerimientos de contraseña */}
              <div className="reset-password-requirements">
                <h4>La contraseña debe:</h4>
                <ul>
                  <li className={formData.password.length >= 6 ? 'valid' : 'invalid'}>
                    Tener al menos 6 caracteres
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}>
                    Contener al menos una mayúscula (recomendado)
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'valid' : 'invalid'}>
                    Contener al menos un número (recomendado)
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                className="reset-password-btn-submit"
              >
                {loading ? (
                  <>
                    <div className="reset-password-spinner"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Actualizar Contraseña
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
