import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCarrito } from '../context/CarritoContext';
import { API_ENDPOINTS, STRIPE_CONFIG, getFirstProductImage } from '../config/api';
import './estilos/Checkout.css';
import Separar from '../componentes/Separador NavBar/Separador';
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  Lock,
  Plus,
  Check,
  Banknote,
  University,
  Package,
  User,
  Home,
  Building
} from 'lucide-react';

// Configurar Stripe con tu clave pública real
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

// Componente de formulario de pago con Stripe
const PaymentForm = ({ 
  onPaymentSuccess, 
  onPaymentError, 
  total, 
  productos, 
  direccionSeleccionada, 
  metodoPago, 
  procesandoPedido,
  setProcesandoPedido 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState('');

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setPaymentError('Stripe no está disponible');
      return;
    }

    try {
      setProcesandoPedido(true);
      setPaymentError('');

      console.log('💳 Iniciando proceso de pago con Stripe...');

      // Crear Payment Intent
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total: total,
          currency: 'mxn',
          metodoPago: metodoPago,
          productos: productos
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();
      console.log('✅ Payment Intent creado:', paymentIntentId);

      // Confirmar el pago
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Cliente Joyería', // Podrías obtener esto del usuario logueado
          },
        }
      });

      if (error) {
        console.error('❌ Error en pago:', error);
        setPaymentError(error.message);
        onPaymentError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Pago exitoso:', paymentIntent.id);
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      setPaymentError(error.message);
      onPaymentError(error.message);
    } finally {
      setProcesandoPedido(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="stripe-info-header">
        <div className="secure-payment-badge">
          <Lock size={16} />
          <span>Pago seguro procesado por Stripe</span>
        </div>
        <p className="test-card-info">
          Para pruebas, usa la tarjeta: <code>4242 4242 4242 4242</code>
        </p>
      </div>
      
      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                '::placeholder': {
                  color: '#9ca3af',
                },
                iconColor: '#6366f1',
              },
              invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
              },
            },
          }}
        />
      </div>
      
      {paymentError && (
        <div className="payment-error">
          <span>❌ {paymentError}</span>
        </div>
      )}
      
      <button
        type="button"
        onClick={handleStripePayment}
        disabled={!stripe || procesandoPedido}
        className="btn-pagar-stripe"
      >
        {procesandoPedido ? (
          <>
            <div className="spinner" />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock size={18} />
            Pagar ${total.toFixed(2)} MXN
          </>
        )}
      </button>
      
      <div className="test-info">
        <p>Para pruebas: 4242 4242 4242 4242 | MM/AA: fecha futura | CVC: 3 dígitos</p>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, total, costoEnvio, limpiarCarrito } = useCarrito();
  
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [procesandoPedido, setProcesandoPedido] = useState(false);
  const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para nueva dirección
  const [nuevaDireccion, setNuevaDireccion] = useState({
    alias: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    predeterminada: false
  });

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Verificar que hay items en el carrito
    if (items.length === 0) {
      navigate('/carrito');
      return;
    }

    cargarDirecciones();
  }, []);

  const cargarDirecciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DIRECCIONES, {
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
      } else {
        throw new Error('Error al cargar direcciones');
      }
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
      setError('Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaDireccionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevaDireccion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardarNuevaDireccion = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DIRECCIONES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaDireccion)
      });

      if (response.ok) {
        const result = await response.json();
        await cargarDirecciones();
        setDireccionSeleccionada(result.ID_direccion.toString());
        setMostrarFormDireccion(false);
        setNuevaDireccion({
          alias: '', calle: '', numero_exterior: '', numero_interior: '',
          colonia: '', ciudad: '', estado: '', codigo_postal: '', predeterminada: false
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar dirección');
      }
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      setError('Error al guardar dirección');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    await procesarPedidoFinal(paymentIntentId);
  };

  const handlePaymentError = (errorMessage) => {
    setError(`Error en el pago: ${errorMessage}`);
  };

  const procesarPedidoFinal = async (paymentIntentId = null) => {
    try {
      const token = localStorage.getItem('token');
      const pedidoData = {
        productos: items.map(item => ({
          id_producto: item.ID_producto,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio),
          nombre: item.nombre
        })),
        total: parseFloat(total),
        subtotal: parseFloat(subtotal),
        costoEnvio: parseFloat(costoEnvio || 0),
        descuento: parseFloat(0),
        direccionEnvio: parseInt(direccionSeleccionada),
        metodoPago: metodoPago,
        paymentIntentId: paymentIntentId // Agregar Payment Intent ID para Stripe
      };

      console.log('🛒 Enviando pedido final:', pedidoData);

      const response = await fetch(API_ENDPOINTS.PEDIDOS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Pedido creado exitosamente:', result);
        
        // Limpiar el carrito
        await limpiarCarrito();
        
        // Redirigir a página de confirmación
        navigate(`/pedido-confirmado/${result.pedidoId}`, {
          state: {
            pedidoId: result.pedidoId,
            total: result.total,
            metodoPago: result.metodoPago,
            paymentIntentId: result.paymentIntentId
          }
        });
      } else {
        throw new Error(result.error || 'Error al procesar el pedido');
      }
    } catch (error) {
      console.error('❌ Error al crear pedido final:', error);
      setError(`Error al procesar el pedido: ${error.message}`);
    }
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    
    if (!direccionSeleccionada) {
      setError('Por favor selecciona una dirección de envío');
      return;
    }
    
    if (!metodoPago) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    setError('');

    // Si es pago con tarjeta, el componente PaymentForm manejará el proceso
    if (metodoPago === 'Tarjeta de Crédito') {
      // El pago será manejado por el componente PaymentForm
      return;
    }

    // Para otros métodos de pago (efectivo, transferencia, etc.)
    setProcesandoPedido(true);
    try {
      await procesarPedidoFinal();
    } finally {
      setProcesandoPedido(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Separar />
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner" />
            <p>Cargando información de checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Separar />
      
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <div className="container">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/carrito">Carrito</Link>
          <span>/</span>
          <span>Finalizar Compra</span>
        </div>
      </nav>

      {/* Botón volver */}
      <div className="container">
        <button onClick={() => navigate('/carrito')} className="btn-volver">
          <ChevronLeft size={20} />
          Volver al carrito
        </button>
      </div>

      {/* Header */}
      <div className="checkout-header">
        <div className="container">
          <h1>Finalizar Compra</h1>
          <div className="progress-indicator">
            <div className="step completed">
              <div className="step-icon">
                <Check size={16} />
              </div>
              <span>Carrito</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <div className="step-icon">
                <CreditCard size={16} />
              </div>
              <span>Pago</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-icon">
                <Package size={16} />
              </div>
              <span>Confirmación</span>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="container">
          <div className="checkout-grid">
            
            {/* Formulario de checkout */}
            <div className="checkout-form-container">
              <form className="checkout-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="error-message">
                    <span>{error}</span>
                  </div>
                )}

                {/* Dirección de Envío */}
                <div className="form-section">
                  <div className="section-header">
                    <MapPin size={24} />
                    <h3>Dirección de Envío</h3>
                  </div>
                  
                  {direcciones.length > 0 ? (
                    <div className="direcciones-grid">
                      {direcciones.map(direccion => (
                        <div 
                          key={direccion.ID_direccion}
                          className={`direccion-card ${direccionSeleccionada === direccion.ID_direccion.toString() ? 'selected' : ''}`}
                          onClick={() => setDireccionSeleccionada(direccion.ID_direccion.toString())}
                        >
                          <input
                            type="radio"
                            name="direccion"
                            value={direccion.ID_direccion}
                            checked={direccionSeleccionada === direccion.ID_direccion.toString()}
                            onChange={() => setDireccionSeleccionada(direccion.ID_direccion.toString())}
                          />
                          <div className="direccion-info">
                            <div className="direccion-header">
                              <div className="direccion-icon">
                                {direccion.alias?.toLowerCase().includes('casa') ? 
                                  <Home size={20} /> : 
                                  direccion.alias?.toLowerCase().includes('trabajo') ? 
                                  <Building size={20} /> : 
                                  <MapPin size={20} />
                                }
                              </div>
                              <div>
                                <h4>{direccion.alias}</h4>
                                {direccion.predeterminada && (
                                  <span className="badge-predeterminada">Predeterminada</span>
                                )}
                              </div>
                            </div>
                            <p className="direccion-texto">
                              {direccion.calle} {direccion.numero_exterior}
                              {direccion.numero_interior && ` Int. ${direccion.numero_interior}`}<br/>
                              {direccion.colonia}, {direccion.ciudad}, {direccion.estado} {direccion.codigo_postal}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-direcciones">
                      <MapPin size={48} />
                      <p>No tienes direcciones guardadas</p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setMostrarFormDireccion(!mostrarFormDireccion)}
                    className="btn-nueva-direccion"
                  >
                    <Plus size={18} />
                    {mostrarFormDireccion ? 'Cancelar' : 'Agregar Nueva Dirección'}
                  </button>
          <div className="error-message" style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmitPedido}>
            
            {/* Sección de Dirección */}
            <div className="checkout-section">
              <h3>
                <i className="fas fa-map-marker-alt"></i>
                Dirección de Envío
              </h3>
              
              {direcciones.length > 0 ? (
                <div className="direcciones-list">
                  {direcciones.map(direccion => (
                    <div key={direccion.ID_direccion} className="direccion-option">
                      <input
                        type="radio"
                        id={`direccion-${direccion.ID_direccion}`}
                        name="direccion"
                        value={direccion.ID_direccion}
                        checked={direccionSeleccionada === direccion.ID_direccion.toString()}
                        onChange={(e) => setDireccionSeleccionada(e.target.value)}
                      />
                      <div className="direccion-info">
                        <h4>{direccion.alias}</h4>
                        <p>{direccion.calle} {direccion.numero_exterior}</p>
                        <p>{direccion.colonia}, {direccion.ciudad}</p>
                        <p>{direccion.estado}, {direccion.codigo_postal}</p>
                        {direccion.predeterminada && <span className="badge-predeterminada">Predeterminada</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-direcciones">
                  <p>No tienes direcciones guardadas</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setMostrarFormDireccion(!mostrarFormDireccion)}
                className="btn-nueva-direccion"
              >
                {mostrarFormDireccion ? 'Cancelar' : 'Agregar Nueva Dirección'}
              </button>

              {mostrarFormDireccion && (
                <div className="form-nueva-direccion">
                  <h4>Nueva Dirección</h4>
                  <div className="form-grid">
                    <input
                      type="text"
                      name="alias"
                      placeholder="Alias (ej. Casa, Trabajo)"
                      value={nuevaDireccion.alias}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                    <input
                      type="text"
                      name="calle"
                      placeholder="Calle"
                      value={nuevaDireccion.calle}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                    <input
                      type="text"
                      name="numero_exterior"
                      placeholder="Número Exterior"
                      value={nuevaDireccion.numero_exterior}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                    <input
                      type="text"
                      name="numero_interior"
                      placeholder="Número Interior (Opcional)"
                      value={nuevaDireccion.numero_interior}
                      onChange={handleNuevaDireccionChange}
                    />
                    <input
                      type="text"
                      name="colonia"
                      placeholder="Colonia"
                      value={nuevaDireccion.colonia}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                    <input
                      type="text"
                      name="ciudad"
                      placeholder="Ciudad"
                      value={nuevaDireccion.ciudad}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                    <input
                      type="text"
                      name="estado"
                      placeholder="Estado"
                      value={nuevaDireccion.estado}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                    <input
                      type="text"
                      name="codigo_postal"
                      placeholder="Código Postal"
                      value={nuevaDireccion.codigo_postal}
                      onChange={handleNuevaDireccionChange}
                      required
                    />
                  </div>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="predeterminada"
                      checked={nuevaDireccion.predeterminada}
                      onChange={handleNuevaDireccionChange}
                    />
                    Establecer como dirección predeterminada
                  </label>
                  <button
                    type="button"
                    onClick={handleGuardarNuevaDireccion}
                    className="btn-guardar-direccion"
                  >
                    Guardar Dirección
                  </button>
                </div>
              )}
            </div>

            {/* Sección de Método de Pago */}
            <div className="checkout-section">
              <h3>
                <i className="fas fa-credit-card"></i>
                Método de Pago
              </h3>
              
              <div className="metodos-pago">
                <div className="metodo-option">
                  <input
                    type="radio"
                    id="tarjeta"
                    name="metodoPago"
                    value="Tarjeta de Crédito"
                    checked={metodoPago === 'Tarjeta de Crédito'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  />
                  <label htmlFor="tarjeta">
                    <i className="fas fa-credit-card" style={{color: '#1e40af'}}></i>
                    Tarjeta de Crédito/Débito (Stripe)
                  </label>
                </div>

                <div className="metodo-option">
                  <input
                    type="radio"
                    id="efectivo"
                    name="metodoPago"
                    value="Pago en Efectivo"
                    checked={metodoPago === 'Pago en Efectivo'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  />
                  <label htmlFor="efectivo">
                    <i className="fas fa-money-bill-wave" style={{color: '#16a34a'}}></i>
                    Pago en Efectivo (Contra entrega)
                  </label>
                </div>

                <div className="metodo-option">
                  <input
                    type="radio"
                    id="transferencia"
                    name="metodoPago"
                    value="Transferencia Bancaria"
                    checked={metodoPago === 'Transferencia Bancaria'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  />
                  <label htmlFor="transferencia">
                    <i className="fas fa-university" style={{color: '#7c3aed'}}></i>
                    Transferencia Bancaria
                  </label>
                </div>
              </div>

              {/* Mostrar formulario de Stripe solo para pagos con tarjeta */}
              {metodoPago === 'Tarjeta de Crédito' && (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    total={total}
                    productos={items}
                    direccionSeleccionada={direccionSeleccionada}
                    metodoPago={metodoPago}
                    procesandoPedido={procesandoPedido}
                    setProcesandoPedido={setProcesandoPedido}
                  />
                </Elements>
              )}
            </div>

            {/* Botón para métodos de pago que no requieren Stripe */}
            {metodoPago !== 'Tarjeta de Crédito' && (
              <button 
                type="submit" 
                className="btn-finalizar-compra"
                disabled={procesandoPedido || !direccionSeleccionada || !metodoPago}
              >
                {procesandoPedido ? 'Procesando...' : `Finalizar Compra - $${total.toFixed(2)}`}
              </button>
            )}
          </form>

          {/* Resumen del Pedido */}
          <div className="pedido-resumen">
            <h3>Resumen del Pedido</h3>
            
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
                <span>{costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio.toFixed(2)}`}</span>
              </div>
              <div className="linea total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {metodoPago === 'Tarjeta de Crédito' && (
              <div className="stripe-info">
                <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                  🔒 Pagos seguros procesados por Stripe
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
