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
            name: 'Cliente Joyería',
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
    <div className="checkout-payment-form">
      <div className="checkout-stripe-info-header">
        <div className="checkout-secure-payment-badge">
          <Lock size={16} />
          <span>Pago seguro procesado por Stripe</span>
        </div>
        <p className="checkout-test-card-info">
          Para pruebas, usa la tarjeta: <code>4242 4242 4242 4242</code>
        </p>
      </div>
      
      <div className="checkout-card-element-container">
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
            hidePostalCode: true,
          }}
        />
      </div>
      
      {paymentError && (
        <div className="checkout-payment-error">
          <span>❌ {paymentError}</span>
        </div>
      )}
      
      <button
        type="button"
        onClick={handleStripePayment}
        disabled={!stripe || procesandoPedido}
        className="checkout-btn-pagar-stripe"
      >
        {procesandoPedido ? (
          <>
            <div className="checkout-spinner" />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock size={18} />
            Pagar ${total.toFixed(2)} MXN
          </>
        )}
      </button>
      
      <div className="checkout-test-info">
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!direccionSeleccionada || !metodoPago) {
      setError('Por favor selecciona una dirección y método de pago');
      return;
    }

    if (metodoPago !== 'Tarjeta de Crédito') {
      await procesarPedidoFinal();
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
      setProcesandoPedido(true);
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
        paymentIntentId: paymentIntentId
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
    } finally {
      setProcesandoPedido(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Separar />
        <div className="checkout-loading-container">
          <div className="checkout-loading-spinner">
            <div className="checkout-spinner" />
            <p>Cargando información de checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Separar />

      {/* Botón volver */}
      <div className="checkout-container">
        <button onClick={() => navigate('/carrito')} className="checkout-btn-volver">
          <ChevronLeft size={20} />
          Volver al carrito
        </button>
      </div>

      {/* Header */}
      <div className="checkout-header">
        <div className="checkout-container">
          <h1>Finalizar Compra</h1>
          <div className="checkout-progress-indicator">
            <div className="checkout-step completed">
              <div className="checkout-step-icon">
                <Check size={16} />
              </div>
              <span>Carrito</span>
            </div>
            <div className="checkout-step-line"></div>
            <div className="checkout-step active">
              <div className="checkout-step-icon">
                <CreditCard size={16} />
              </div>
              <span>Pago</span>
            </div>
            <div className="checkout-step-line"></div>
            <div className="checkout-step">
              <div className="checkout-step-icon">
                <Package size={16} />
              </div>
              <span>Confirmación</span>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-container">
          <div className="checkout-grid">
            
            {/* Formulario de checkout */}
            <div className="checkout-form-container">
              <form className="checkout-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="checkout-error-message">
                    <span>{error}</span>
                  </div>
                )}

                {/* Dirección de Envío */}
                <div className="checkout-form-section">
                  <div className="checkout-section-header">
                    <MapPin size={24} />
                    <h3>Dirección de Envío</h3>
                  </div>
                  
                  {direcciones.length > 0 ? (
                    <div className="checkout-direcciones-grid">
                      {direcciones.map(direccion => (
                        <div 
                          key={direccion.ID_direccion}
                          className={`checkout-direccion-card ${direccionSeleccionada === direccion.ID_direccion.toString() ? 'selected' : ''}`}
                          onClick={() => setDireccionSeleccionada(direccion.ID_direccion.toString())}
                        >
                          <input
                            type="radio"
                            name="direccion"
                            value={direccion.ID_direccion}
                            checked={direccionSeleccionada === direccion.ID_direccion.toString()}
                            onChange={() => setDireccionSeleccionada(direccion.ID_direccion.toString())}
                          />
                          <div className="checkout-direccion-info">
                            <div className="checkout-direccion-header">
                              <div className="checkout-direccion-icon">
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
                                  <span className="checkout-badge-predeterminada">Predeterminada</span>
                                )}
                              </div>
                            </div>
                            <p className="checkout-direccion-texto">
                              {direccion.calle} {direccion.numero_exterior}
                              {direccion.numero_interior && ` Int. ${direccion.numero_interior}`}<br/>
                              {direccion.colonia}, {direccion.ciudad}, {direccion.estado} {direccion.codigo_postal}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="checkout-no-direcciones">
                      <MapPin size={48} />
                      <p>No tienes direcciones guardadas</p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setMostrarFormDireccion(!mostrarFormDireccion)}
                    className="checkout-btn-nueva-direccion"
                  >
                    <Plus size={18} />
                    {mostrarFormDireccion ? 'Cancelar' : 'Agregar Nueva Dirección'}
                  </button>

                  {mostrarFormDireccion && (
                    <div className="checkout-form-nueva-direccion">
                      <h4>Nueva Dirección</h4>
                      <div className="checkout-form-grid">
                        <div className="checkout-form-group">
                          <label>Alias</label>
                          <input
                            type="text"
                            name="alias"
                            placeholder="Casa, Trabajo, etc."
                            value={nuevaDireccion.alias}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Calle</label>
                          <input
                            type="text"
                            name="calle"
                            placeholder="Nombre de la calle"
                            value={nuevaDireccion.calle}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Número Exterior</label>
                          <input
                            type="text"
                            name="numero_exterior"
                            placeholder="123"
                            value={nuevaDireccion.numero_exterior}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Número Interior (Opcional)</label>
                          <input
                            type="text"
                            name="numero_interior"
                            placeholder="Apt. 4B"
                            value={nuevaDireccion.numero_interior}
                            onChange={handleNuevaDireccionChange}
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Colonia</label>
                          <input
                            type="text"
                            name="colonia"
                            placeholder="Nombre de la colonia"
                            value={nuevaDireccion.colonia}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Ciudad</label>
                          <input
                            type="text"
                            name="ciudad"
                            placeholder="Ciudad"
                            value={nuevaDireccion.ciudad}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Estado</label>
                          <input
                            type="text"
                            name="estado"
                            placeholder="Estado"
                            value={nuevaDireccion.estado}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>Código Postal</label>
                          <input
                            type="text"
                            name="codigo_postal"
                            placeholder="12345"
                            value={nuevaDireccion.codigo_postal}
                            onChange={handleNuevaDireccionChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group checkout-checkbox-group">
                          <label className="checkout-checkbox-label">
                            <input
                              type="checkbox"
                              name="predeterminada"
                              checked={nuevaDireccion.predeterminada}
                              onChange={handleNuevaDireccionChange}
                            />
                            <span>Establecer como dirección predeterminada</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGuardarNuevaDireccion}
                        className="checkout-btn-guardar-direccion"
                      >
                        <Check size={18} />
                        Guardar Dirección
                      </button>
                    </div>
                  )}
                </div>

                {/* Método de Pago */}
                <div className="checkout-form-section">
                  <div className="checkout-section-header">
                    <CreditCard size={24} />
                    <h3>Método de Pago</h3>
                  </div>

                  <div className="checkout-metodos-pago">
                    <div className="checkout-metodo-option">
                      <input
                        type="radio"
                        id="tarjeta"
                        name="metodoPago"
                        value="Tarjeta de Crédito"
                        checked={metodoPago === 'Tarjeta de Crédito'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                      />
                      <label htmlFor="tarjeta" className="checkout-metodo-label">
                        <div className="checkout-metodo-icon">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h4>Tarjeta de Crédito/Débito</h4>
                          <p>Pago seguro procesado por Stripe</p>
                        </div>
                        <div className="checkout-security-badges">
                          <Shield size={16} />
                        </div>
                      </label>
                    </div>

                    <div className="checkout-metodo-option">
                      <input
                        type="radio"
                        id="efectivo"
                        name="metodoPago"
                        value="Pago en Efectivo"
                        checked={metodoPago === 'Pago en Efectivo'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                      />
                      <label htmlFor="efectivo" className="checkout-metodo-label">
                        <div className="checkout-metodo-icon">
                          <Banknote size={24} />
                        </div>
                        <div>
                          <h4>Pago en Efectivo</h4>
                          <p>Contra entrega</p>
                        </div>
                      </label>
                    </div>

                    <div className="checkout-metodo-option">
                      <input
                        type="radio"
                        id="transferencia"
                        name="metodoPago"
                        value="Transferencia Bancaria"
                        checked={metodoPago === 'Transferencia Bancaria'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                      />
                      <label htmlFor="transferencia" className="checkout-metodo-label">
                        <div className="checkout-metodo-icon">
                          <University size={24} />
                        </div>
                        <div>
                          <h4>Transferencia Bancaria</h4>
                          <p>Transferencia directa a cuenta bancaria</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Formulario de Stripe para tarjeta */}
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

                {/* Botón para métodos que no son Stripe */}
                {metodoPago !== 'Tarjeta de Crédito' && metodoPago && (
                  <button 
                    type="submit" 
                    className="checkout-btn-finalizar-compra"
                    disabled={procesandoPedido || !direccionSeleccionada || !metodoPago}
                  >
                    {procesandoPedido ? (
                      <>
                        <div className="checkout-spinner" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Finalizar Compra - ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>

            {/* Resumen del Pedido */}
            <div className="checkout-order-summary">
              <div className="checkout-summary-card">
                <h3>Resumen del Pedido</h3>
                
                <div className="checkout-productos-summary">
                  {items.map(item => (
                    <div key={item.ID_producto} className="checkout-producto-summary-item">
                      <div className="checkout-producto-image">
                        <img 
                          src={getFirstProductImage(item)}
                          alt={item.nombre}
                          onError={(e) => {
                            e.target.src = "/placeholder-jewelry.svg";
                          }}
                        />
                        <span className="checkout-cantidad-badge">{item.cantidad}</span>
                      </div>
                      <div className="checkout-producto-details">
                        <h4>{item.nombre}</h4>
                        <p className="checkout-producto-precio">${(item.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="checkout-summary-totals">
                  <div className="checkout-total-line">
                    <span>Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="checkout-total-line">
                    <span>Envío</span>
                    <span className="checkout-envio-gratis">
                      {costoEnvio === 0 ? (
                        <>
                          <Truck size={16} />
                          GRATIS
                        </>
                      ) : (
                        `$${costoEnvio.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="checkout-total-line checkout-total-final">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Garantías */}
                <div className="checkout-guarantees">
                  <div className="checkout-guarantee-item">
                    <Shield size={16} />
                    <span>Compra segura y protegida</span>
                  </div>
                  <div className="checkout-guarantee-item">
                    <Truck size={16} />
                    <span>Envío gratis en pedidos +$500</span>
                  </div>
                </div>

                {metodoPago === 'Tarjeta de Crédito' && (
                  <div className="stripe-badge">
                    <Lock size={14} />
                    <span>Pagos seguros con Stripe</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
