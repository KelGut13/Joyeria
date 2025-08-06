import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './estilos/DetallePedido.css';
import Separar from '../componentes/Separador NavBar/Separador';
import { API_ENDPOINTS } from '../config/api';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, CreditCard, MapPin, User, Calendar, DollarSign } from 'lucide-react';

const DetallePedido = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDetallePedido();
  }, [pedidoId]);

  const cargarDetallePedido = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.PEDIDO_BY_ID(pedidoId), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPedido(data);
      } else if (response.status === 404) {
        setError('Pedido no encontrado');
      } else {
        throw new Error('Error al cargar el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'procesando': return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' };
      case 'enviado': return { bg: '#e2e3ff', color: '#383d41', border: '#c3c6ff' };
      case 'entregado': return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
      case 'cancelado': return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      default: return { bg: '#e9ecef', color: '#495057', border: '#ced4da' };
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return <Clock size={20} />;
      case 'procesando': return <Package size={20} />;
      case 'enviado': return <Truck size={20} />;
      case 'entregado': return <CheckCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  if (loading) {
    return (
      <div className="detalle-pedido-page">
        <Separar />
        <div className="detalle-pedido-container">
          <div className="detalle-pedido-loading">
            <div className="detalle-pedido-spinner"></div>
            <p>Cargando detalles del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-pedido-page">
        <Separar />
        <div className="detalle-pedido-container">
          <div className="detalle-pedido-error">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/mis-pedidos" className="detalle-pedido-btn-volver">
              <ArrowLeft size={20} />
              Volver a Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="detalle-pedido-page">
        <Separar />
        <div className="detalle-pedido-container">
          <div className="detalle-pedido-not-found">
            <h2>Pedido no encontrado</h2>
            <Link to="/mis-pedidos" className="detalle-pedido-btn-volver">
              <ArrowLeft size={20} />
              Volver a Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const estadoConfig = getEstadoColor(pedido.estado);

  return (
    <div className="detalle-pedido-page">
      <Separar />
      <div className="detalle-pedido-container">
        {/* Header */}
        <div className="detalle-pedido-header">
          <Link to="/mis-pedidos" className="detalle-pedido-btn-volver">
            <ArrowLeft size={20} />
            Volver a Mis Pedidos
          </Link>
          
          <div className="detalle-pedido-title">
            <h1>Pedido #{pedido.ID_pedido}</h1>
            <div className="detalle-pedido-fecha">
              <Calendar size={16} />
              Realizado el {formatearFecha(pedido.fecha_pedido)}
            </div>
          </div>

          <div className="detalle-pedido-estado-badge" style={{
            backgroundColor: estadoConfig.bg,
            color: estadoConfig.color,
            border: `1px solid ${estadoConfig.border}`
          }}>
            {getEstadoIcon(pedido.estado)}
            <span>{pedido.estado?.charAt(0).toUpperCase() + pedido.estado?.slice(1)}</span>
          </div>
        </div>

        <div className="detalle-pedido-content">
          {/* Información del pedido */}
          <div className="detalle-pedido-info-card">
            <h3>
              <Package size={20} />
              Información del Pedido
            </h3>
            
            <div className="detalle-pedido-info-grid">
              <div className="detalle-pedido-info-item">
                <label>
                  <DollarSign size={16} />
                  Total
                </label>
                <span className="detalle-pedido-total">{formatearPrecio(pedido.total)}</span>
              </div>
              
              <div className="detalle-pedido-info-item">
                <label>
                  <CreditCard size={16} />
                  Método de Pago
                </label>
                <span>{pedido.metodo_pago || 'Tarjeta de crédito'}</span>
              </div>
              
              <div className="detalle-pedido-info-item">
                <label>
                  <MapPin size={16} />
                  Dirección de Envío
                </label>
                <span>{pedido.direccion_envio || 'No disponible'}</span>
              </div>
              
              <div className="detalle-pedido-info-item">
                <label>
                  <User size={16} />
                  Cliente
                </label>
                <span>{pedido.nombre_usuario || 'Usuario'}</span>
              </div>
            </div>
          </div>

          {/* Productos del pedido */}
          <div className="detalle-pedido-productos-card">
            <h3>
              <Package size={20} />
              Productos ({pedido.productos?.length || 0} artículo{(pedido.productos?.length || 0) !== 1 ? 's' : ''})
            </h3>
            
            <div className="detalle-pedido-productos-lista">
              {pedido.productos?.map((producto, index) => (
                <div key={index} className="detalle-pedido-producto-item">
                  <div className="detalle-pedido-producto-imagen">
                    <img 
                      src={producto.imagen || '/placeholder-jewelry.svg'} 
                      alt={producto.nombre}
                      onError={(e) => { e.target.src = '/placeholder-jewelry.svg' }}
                    />
                  </div>
                  
                  <div className="detalle-pedido-producto-info">
                    <h4>{producto.nombre}</h4>
                    <p className="detalle-pedido-producto-descripcion">
                      {producto.descripcion}
                    </p>
                    <div className="detalle-pedido-producto-detalles">
                      <span>Cantidad: {producto.cantidad}</span>
                      <span>Precio unitario: {formatearPrecio(producto.precio)}</span>
                    </div>
                  </div>
                  
                  <div className="detalle-pedido-producto-total">
                    {formatearPrecio(producto.precio * producto.cantidad)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de costos */}
          <div className="detalle-pedido-resumen-card">
            <h3>
              <DollarSign size={20} />
              Resumen de Costos
            </h3>
            
            <div className="detalle-pedido-resumen-lista">
              <div className="detalle-pedido-resumen-item">
                <span>Subtotal:</span>
                <span>{formatearPrecio(pedido.subtotal || pedido.total)}</span>
              </div>
              
              {pedido.costo_envio && (
                <div className="detalle-pedido-resumen-item">
                  <span>Envío:</span>
                  <span>{formatearPrecio(pedido.costo_envio)}</span>
                </div>
              )}
              
              {pedido.descuento && (
                <div className="detalle-pedido-resumen-item descuento">
                  <span>Descuento:</span>
                  <span>-{formatearPrecio(pedido.descuento)}</span>
                </div>
              )}
              
              <div className="detalle-pedido-resumen-item total">
                <span>Total:</span>
                <span>{formatearPrecio(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="detalle-pedido-acciones">
            {pedido.estado === 'entregado' && (
              <Link to="/aretes" className="detalle-pedido-btn-recomprar">
                <Package size={20} />
                Volver a Comprar
              </Link>
            )}
            
            <Link to="/mis-pedidos" className="detalle-pedido-btn-secundario">
              Ver Todos los Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;
