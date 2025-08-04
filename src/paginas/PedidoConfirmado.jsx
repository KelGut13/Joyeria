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
        <div className="container">
          <div className="loading">Cargando información del pedido...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pedido-confirmado-page">
      <Separar />
      <div className="container">
        <div className="confirmacion-content">
          <div className="icono-exito">
            <i className="fas fa-check-circle"></i>
          </div>
          
          <h1>¡Pedido Confirmado!</h1>
          
          <div className="pedido-info">
            <h2>Pedido #{pedidoId}</h2>
            
            {stateData && (
              <div className="resumen-rapido">
                <div className="info-item">
                  <span className="label">Total:</span>
                  <span className="value">${stateData.total}</span>
                </div>
                <div className="info-item">
                  <span className="label">Método de Pago:</span>
                  <span className="value">{stateData.metodoPago}</span>
                </div>
              </div>
            )}

            {pedido && (
              <div className="detalles-pedido">
                <div className="info-item">
                  <span className="label">Fecha:</span>
                  <span className="value">{new Date(pedido.fecha).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Estado:</span>
                  <span className="value status-pendiente">{pedido.estado}</span>
                </div>
                {pedido.alias && (
                  <div className="direccion-envio">
                    <h3>Dirección de Envío:</h3>
                    <p>{pedido.alias}</p>
                    <p>{pedido.calle} {pedido.numero_exterior}</p>
                    <p>{pedido.colonia}, {pedido.ciudad}</p>
                    <p>{pedido.estado}, {pedido.codigo_postal}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mensaje-confirmacion">
            <h3>¿Qué sigue?</h3>
            <div className="pasos">
              <div className="paso">
                <i className="fas fa-box"></i>
                <span>Prepararemos tu pedido (1-2 días hábiles)</span>
              </div>
              <div className="paso">
                <i className="fas fa-truck"></i>
                <span>Te notificaremos cuando esté listo para envío</span>
              </div>
              <div className="paso">
                <i className="fas fa-home"></i>
                <span>Recibirás tu pedido en 3-5 días hábiles</span>
              </div>
            </div>
          </div>

          <div className="acciones">
            <Link to="/mis-pedidos" className="btn btn-primary">
              Ver Mis Pedidos
            </Link>
            <Link to="/" className="btn btn-secondary">
              Seguir Comprando
            </Link>
          </div>

          <div className="contacto-info">
            <p>¿Tienes alguna pregunta sobre tu pedido?</p>
            <p>Contáctanos: <strong>contacto@joyeria.com</strong> | <strong>+52 311 444 1683</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoConfirmado;
