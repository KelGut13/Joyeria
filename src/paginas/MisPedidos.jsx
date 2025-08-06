import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './estilos/MisPedidos.css';
import Separar from '../componentes/Separador NavBar/Separador';
import { API_ENDPOINTS } from '../config/api';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión para ver tus pedidos');
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.MIS_PEDIDOS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      } else {
        throw new Error('Error al cargar pedidos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return '#f59e0b';
      case 'procesando': return '#3b82f6';
      case 'enviado': return '#8b5cf6';
      case 'entregado': return '#10b981';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return '⏳ Pendiente';
      case 'procesando': return '⚙️ Procesando';
      case 'enviado': return '🚚 Enviado';
      case 'entregado': return '✅ Entregado';
      case 'cancelado': return '❌ Cancelado';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div className="mis-pedidos-page">
        <Separar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando historial de pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-page">
      <Separar />
      <div className="container">
        <div className="pedidos-header">
          <h1>Mis Pedidos</h1>
          <Link to="/panel-usuario" className="btn-volver">
            ← Volver al Panel
          </Link>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <Link to="/login">Iniciar Sesión</Link>
          </div>
        )}

        {pedidos.length === 0 && !error ? (
          <div className="no-pedidos">
            <div className="no-pedidos-icon">📦</div>
            <h2>No tienes pedidos aún</h2>
            <p>Cuando realices tu primera compra, aparecerá aquí.</p>
            <Link to="/" className="btn-explorar">
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="pedidos-list">
            {pedidos.map(pedido => (
              <div key={pedido.ID_pedido} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-numero">
                    <h3>Pedido #{pedido.ID_pedido}</h3>
                    <span className="pedido-fecha">
                      {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div 
                    className="pedido-estado"
                    style={{ backgroundColor: getEstadoColor(pedido.estado) }}
                  >
                    {getEstadoTexto(pedido.estado)}
                  </div>
                </div>

                <div className="pedido-content">
                  <div className="pedido-info">
                    <div className="info-item">
                      <span className="label">Total:</span>
                      <span className="value">${pedido.total}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Productos:</span>
                      <span className="value">{pedido.total_productos} artículo(s)</span>
                    </div>
                  </div>

                  <div className="pedido-actions">
                    <Link 
                      to={`/pedido/${pedido.ID_pedido}`}
                      className="btn-ver-detalle"
                    >
                      Ver Detalles
                    </Link>
                    
                    {pedido.estado === 'entregado' && (
                      <button className="btn-recomprar">
                        Volver a Comprar
                      </button>
                    )}
                    
                    {pedido.estado === 'enviado' && (
                      <button className="btn-rastrear">
                        Rastrear Envío
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;
