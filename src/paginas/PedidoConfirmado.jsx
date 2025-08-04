import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './estilos/PedidoConfirmado.css';
import Separar from '../componentes/Separador NavBar/Separador';

const PedidoConfirmado = () => {
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/pedidos/${pedidoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const pedidoData = await response.json();
          setPedido(pedidoData);
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    if (pedidoId) {
      cargarPedido();
    }
  }, [pedidoId]);

  if (loading) {
    return (
      <div className="pedido-confirmado-page">
        <Separar />
        <div className="container">
          <div className="loading">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pedido-confirmado-page">
      <Separar />
      <div className="container">
        <div className="confirmacion-content">
          <div className="confirmacion-header">
            <div className="check-icon">✅</div>
            <h1>¡Pedido Confirmado!</h1>
            <p>Tu pedido #{pedidoId} ha sido procesado exitosamente</p>
          </div>

          {pedido && (
            <div className="pedido-detalles">
              <h3>Detalles del Pedido</h3>
              <div className="detalle-info">
                <p><strong>Número de pedido:</strong> #{pedido.ID_pedido}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ${pedido.total}</p>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                {pedido.alias && (
                  <p><strong>Dirección de envío:</strong> {pedido.alias}</p>
                )}
              </div>
            </div>
          )}

          <div className="siguientes-pasos">
            <h3>¿Qué sigue?</h3>
            <ul>
              <li>📧 Recibirás un email de confirmación</li>
              <li>📦 Prepararemos tu pedido (1-2 días hábiles)</li>
              <li>🚚 Te notificaremos cuando esté en camino</li>
              <li>🏠 Recibirás tu pedido en 3-5 días hábiles</li>
            </ul>
          </div>

          <div className="acciones-confirmacion">
            <Link to="/panel-usuario" className="btn-ver-cuenta">
              Ver Mi Cuenta
            </Link>
            <Link to="/" className="btn-seguir-comprando">
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoConfirmado;
