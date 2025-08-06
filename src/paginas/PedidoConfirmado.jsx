import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './estilos/PedidoConfirmado.css';
import Separar from '../componentes/Separador NavBar/Separador';

const PedidoConfirmado = () => {
  const { pedidoId } = useParams();
  const location = useLocation();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener datos del estado si están disponibles
  const stateData = location.state;

  useEffect(() => {
    if (pedidoId) {
      obtenerPedido();
    }
  }, [pedidoId]);

  const obtenerPedido = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PEDIDO_BY_ID(pedidoId), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pedidoData = await response.json();
        setPedido(pedidoData);
      } else {
        throw new Error('Error al obtener información del pedido');
      }
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pedido-confirmado-page">
        <Separar />
        <div className="pedido-confirmado-container">
          <div className="pedido-confirmado-loading">
            <div className="pedido-confirmado-loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Cargando información del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pedido-confirmado-page">
      <Separar />
      <div className="pedido-confirmado-container">
        <div className="pedido-confirmado-content">
          {/* Header con icono de éxito */}
          <div className="pedido-confirmado-header">
            <div className="pedido-confirmado-icono-exito">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1 className="pedido-confirmado-titulo">¡PEDIDO CONFIRMADO!</h1>
            <p className="pedido-confirmado-subtitulo">
              Tu pedido ha sido procesado exitosamente
            </p>
          </div>

          {/* Card principal con información del pedido */}
          <div className="pedido-confirmado-card-principal">
            <div className="pedido-confirmado-numero">
              <span className="pedido-confirmado-label">Pedido</span>
              <span className="pedido-confirmado-numero-valor">#{pedidoId}</span>
            </div>

            <div className="pedido-confirmado-grid-info">
              <div className="pedido-confirmado-info-izquierda">
                {stateData && (
                  <>
                    <div className="pedido-confirmado-info-item">
                      <span className="pedido-confirmado-info-label">Fecha:</span>
                      <span className="pedido-confirmado-info-valor">{new Date().toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="pedido-confirmado-info-item">
                      <span className="pedido-confirmado-info-label">Estado:</span>
                      <span className="pedido-confirmado-estado pedido-confirmado-estado-nayarit">Nayarit</span>
                    </div>
                  </>
                )}
                {pedido && (
                  <>
                    <div className="pedido-confirmado-info-item">
                      <span className="pedido-confirmado-info-label">Fecha:</span>
                      <span className="pedido-confirmado-info-valor">{new Date(pedido.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="pedido-confirmado-info-item">
                      <span className="pedido-confirmado-info-label">Estado:</span>
                      <span className="pedido-confirmado-estado pedido-confirmado-estado-procesando">{pedido.estado}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pedido-confirmado-info-derecha">
                {stateData && (
                  <>
                    <div className="pedido-confirmado-total">
                      <span className="pedido-confirmado-total-label">Total:</span>
                      <span className="pedido-confirmado-total-valor">${stateData.total}</span>
                    </div>
                    <div className="pedido-confirmado-metodo-pago">
                      <span className="pedido-confirmado-metodo-label">Método de Pago:</span>
                      <div className="pedido-confirmado-tarjeta-info">
                        <i className="fas fa-credit-card"></i>
                        <span>Tarjeta de Crédito</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dirección de envío */}
            {pedido && pedido.alias && (
              <div className="pedido-confirmado-direccion-envio">
                <h3 className="pedido-confirmado-direccion-titulo">Dirección de Envío:</h3>
                <div className="pedido-confirmado-direccion-contenido">
                  <div className="pedido-confirmado-direccion-icono">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="pedido-confirmado-direccion-texto">
                    <p className="pedido-confirmado-direccion-alias">{pedido.alias}</p>
                    <p className="pedido-confirmado-direccion-calle">{pedido.calle} {pedido.numero_exterior}</p>
                    <p className="pedido-confirmado-direccion-ciudad">{pedido.colonia}, {pedido.ciudad}</p>
                    <p className="pedido-confirmado-direccion-estado">{pedido.estado}, {pedido.codigo_postal}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline de seguimiento */}
          <div className="pedido-confirmado-timeline">
            <h3 className="pedido-confirmado-timeline-titulo">¿Qué sigue?</h3>
            <div className="pedido-confirmado-pasos">
              <div className="pedido-confirmado-paso pedido-confirmado-paso-activo">
                <div className="pedido-confirmado-paso-icono">
                  <i className="fas fa-check"></i>
                </div>
                <div className="pedido-confirmado-paso-contenido">
                  <h4>Pedido Confirmado</h4>
                  <p>Tu pedido ha sido recibido y confirmado</p>
                </div>
              </div>
              <div className="pedido-confirmado-paso">
                <div className="pedido-confirmado-paso-icono">
                  <i className="fas fa-box"></i>
                </div>
                <div className="pedido-confirmado-paso-contenido">
                  <h4>Preparando Envío</h4>
                  <p>Prepararemos tu pedido (1-2 días hábiles)</p>
                </div>
              </div>
              <div className="pedido-confirmado-paso">
                <div className="pedido-confirmado-paso-icono">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="pedido-confirmado-paso-contenido">
                  <h4>En Camino</h4>
                  <p>Te notificaremos cuando esté listo para envío</p>
                </div>
              </div>
              <div className="pedido-confirmado-paso">
                <div className="pedido-confirmado-paso-icono">
                  <i className="fas fa-home"></i>
                </div>
                <div className="pedido-confirmado-paso-contenido">
                  <h4>Entregado</h4>
                  <p>Recibirás tu pedido en 3-5 días hábiles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pedido-confirmado-acciones">
            <Link to="/mis-pedidos" className="pedido-confirmado-btn pedido-confirmado-btn-primary">
              <i className="fas fa-list"></i>
              Ver Mis Pedidos
            </Link>
            <Link to="/aretes" className="pedido-confirmado-btn pedido-confirmado-btn-secondary">
              <i className="fas fa-shopping-bag"></i>
              Seguir Comprando
            </Link>
          </div>

          {/* Información de contacto */}
          <div className="pedido-confirmado-contacto">
            <div className="pedido-confirmado-contacto-icono">
              <i className="fas fa-headset"></i>
            </div>
            <div className="pedido-confirmado-contacto-texto">
              <h4>¿Necesitas ayuda?</h4>
              <p>Contáctanos para cualquier duda sobre tu pedido</p>
              <div className="pedido-confirmado-contacto-info">
                <span><strong>contacto@joyeria.com</strong></span>
                <span><strong>+52 311 444 1683</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoConfirmado;
