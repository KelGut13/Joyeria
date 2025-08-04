import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import './estilos/Checkout.css';
import Separar from '../componentes/Separador NavBar/Separador';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, total, limpiarCarrito } = useCarrito();
  
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [loading, setLoading] = useState(false);
  const [procesandoPedido, setProcesandoPedido] = useState(false);

  useEffect(() => {
    // Verificar si hay items en el carrito
    if (items.length === 0) {
      navigate('/carrito');
      return;
    }

    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    cargarDirecciones();
  }, [items, navigate]);

  const cargarDirecciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/direcciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const direccionesData = await response.json();
        setDirecciones(direccionesData);
        
        // Seleccionar automáticamente la dirección predeterminada
        const predeterminada = direccionesData.find(dir => dir.predeterminada);
        if (predeterminada) {
          setDireccionSeleccionada(predeterminada.ID_direccion.toString());
        }
      }
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
    }
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    
    if (!direccionSeleccionada) {
      alert('Por favor selecciona una dirección de envío');
      return;
    }
    
    if (!metodoPago) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setProcesandoPedido(true);
    
    try {
      const token = localStorage.getItem('token');
      const pedidoData = {
        productos: items.map(item => ({
          id_producto: item.ID_producto,
          cantidad: item.cantidad,
          precio: item.precio,
          nombre: item.nombre
        })),
        total: total,
        subtotal: subtotal,
        costoEnvio: 0,
        descuento: 0,
        direccionEnvio: parseInt(direccionSeleccionada),
        metodoPago: metodoPago
      };

      const response = await fetch('http://localhost:5001/api/pedidos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      });

      const result = await response.json();

      if (response.ok) {
        // Limpiar el carrito
        await limpiarCarrito();
        
        // Redirigir a página de confirmación
        navigate(`/pedido-confirmado/${result.pedidoId}`);
      } else {
        throw new Error(result.error || 'Error al procesar el pedido');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert(`Error al procesar el pedido: ${error.message}`);
    } finally {
      setProcesandoPedido(false);
    }
  };

  return (
    <div className="checkout-page">
      <Separar />
      <div className="container">
        <h1>Finalizar Compra</h1>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmitPedido}>
              {/* Dirección de envío */}
              <div className="checkout-section">
                <h3>📍 Dirección de Envío</h3>
                <div className="direcciones-list">
                  {direcciones.length === 0 ? (
                    <div className="no-direcciones">
                      <p>No tienes direcciones guardadas.</p>
                      <button 
                        type="button"
                        onClick={() => navigate('/panel-usuario')}
                      >
                        Agregar Dirección
                      </button>
                    </div>
                  ) : (
                    direcciones.map(direccion => (
                      <label key={direccion.ID_direccion} className="direccion-option">
                        <input
                          type="radio"
                          name="direccion"
                          value={direccion.ID_direccion}
                          checked={direccionSeleccionada === direccion.ID_direccion.toString()}
                          onChange={(e) => setDireccionSeleccionada(e.target.value)}
                        />
                        <div className="direccion-info">
                          <h4>{direccion.alias}</h4>
                          <p>
                            {direccion.calle} {direccion.numero_exterior}
                            {direccion.numero_interior && `, Int. ${direccion.numero_interior}`}
                          </p>
                          <p>
                            {direccion.colonia}, {direccion.ciudad}, {direccion.estado} {direccion.codigo_postal}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Método de pago */}
              <div className="checkout-section">
                <h3>💳 Método de Pago</h3>
                <div className="metodos-pago">
                  <label className="metodo-option">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="tarjeta"
                      checked={metodoPago === 'tarjeta'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <span>💳 Tarjeta de Crédito/Débito</span>
                  </label>
                  
                  <label className="metodo-option">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="paypal"
                      checked={metodoPago === 'paypal'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <span>🅿️ PayPal</span>
                  </label>
                  
                  <label className="metodo-option">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === 'efectivo'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <span>💵 Pago en Efectivo (Contra entrega)</span>
                  </label>
                  
                  <label className="metodo-option">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={metodoPago === 'transferencia'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <span>🏦 Transferencia Bancaria</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-finalizar-compra"
                disabled={procesandoPedido || !direccionSeleccionada || !metodoPago}
              >
                {procesandoPedido ? 'Procesando...' : `Finalizar Compra - $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="pedido-resumen">
            <h3>📋 Resumen del Pedido</h3>
            
            <div className="productos-resumen">
              {items.map(item => (
                <div key={item.ID_producto} className="producto-resumen">
                  <img 
                    src={
                      item.imagen
                        ? Array.isArray(item.imagen)
                          ? item.imagen[0]
                          : item.imagen.split(",")[0]
                        : "/placeholder.jpg"
                    }
                    alt={item.nombre}
                    onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                  />
                  <div className="producto-info">
                    <h4>{item.nombre}</h4>
                    <p>Cantidad: {item.cantidad}</p>
                    <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="totales-resumen">
              <div className="linea">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="linea">
                <span>Envío:</span>
                <span>GRATIS</span>
              </div>
              <div className="linea total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
                          