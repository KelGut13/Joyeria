import React, { useState } from 'react';
import { CheckCircle, AlertCircle, CreditCard, Lock } from 'lucide-react';
import './DevPaymentForm.css';

// Simulador de pagos para desarrollo
const DevPaymentForm = ({ 
  onPaymentSuccess, 
  onPaymentError, 
  total, 
  productos, 
  procesandoPedido,
  setProcesandoPedido 
}) => {
  const [selectedResult, setSelectedResult] = useState('success');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');

  const handleDevPayment = async () => {
    setProcesandoPedido(true);

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (selectedResult === 'success') {
      const mockPaymentIntentId = `pi_dev_${Date.now()}_success`;
      onPaymentSuccess(mockPaymentIntentId);
    } else {
      let errorMessage = 'Error simulado de desarrollo';
      switch (selectedResult) {
        case 'declined':
          errorMessage = 'Tu tarjeta fue rechazada (simulado para desarrollo).';
          break;
        case 'expired':
          errorMessage = 'Tu tarjeta ha expirado (simulado para desarrollo).';
          break;
        case 'insufficient':
          errorMessage = 'Fondos insuficientes (simulado para desarrollo).';
          break;
        case 'network':
          errorMessage = 'Error de red (simulado para desarrollo).';
          break;
        default:
          errorMessage = 'Error desconocido (simulado para desarrollo).';
      }
      onPaymentError(errorMessage);
    }

    setProcesandoPedido(false);
  };

  return (
    <div className="dev-payment-form">
      <div className="dev-payment-header">
        <div className="dev-payment-mode-badge">
          🧪 MODO DESARROLLO
        </div>
        <div className="dev-payment-secure-badge">
          <Lock size={16} />
          <span>Simulador de pagos para pruebas</span>
        </div>
      </div>

      <div className="dev-payment-card-section">
        <label className="dev-payment-label">
          Número de tarjeta (simulado)
        </label>
        <div className="dev-payment-card-input">
          <CreditCard className="dev-payment-card-icon" size={20} />
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            maxLength="19"
            className="dev-payment-input"
            disabled={procesandoPedido}
          />
        </div>
      </div>

      <div className="dev-payment-result-section">
        <label className="dev-payment-label">
          Resultado a simular:
        </label>
        <div className="dev-payment-result-options">
          <label className="dev-payment-option">
            <input
              type="radio"
              name="result"
              value="success"
              checked={selectedResult === 'success'}
              onChange={(e) => setSelectedResult(e.target.value)}
              disabled={procesandoPedido}
            />
            <CheckCircle size={16} className="dev-payment-success-icon" />
            Pago exitoso
          </label>
          
          <label className="dev-payment-option">
            <input
              type="radio"
              name="result"
              value="declined"
              checked={selectedResult === 'declined'}
              onChange={(e) => setSelectedResult(e.target.value)}
              disabled={procesandoPedido}
            />
            <AlertCircle size={16} className="dev-payment-error-icon" />
            Tarjeta rechazada
          </label>
          
          <label className="dev-payment-option">
            <input
              type="radio"
              name="result"
              value="expired"
              checked={selectedResult === 'expired'}
              onChange={(e) => setSelectedResult(e.target.value)}
              disabled={procesandoPedido}
            />
            <AlertCircle size={16} className="dev-payment-error-icon" />
            Tarjeta expirada
          </label>
          
          <label className="dev-payment-option">
            <input
              type="radio"
              name="result"
              value="insufficient"
              checked={selectedResult === 'insufficient'}
              onChange={(e) => setSelectedResult(e.target.value)}
              disabled={procesandoPedido}
            />
            <AlertCircle size={16} className="dev-payment-error-icon" />
            Fondos insuficientes
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDevPayment}
        disabled={procesandoPedido}
        className="dev-payment-btn-pagar"
      >
        {procesandoPedido ? (
          <>
            <div className="dev-payment-spinner" />
            Procesando pago simulado...
          </>
        ) : (
          <>
            <Lock size={18} />
            Simular Pago ${total.toFixed(2)} MXN
          </>
        )}
      </button>

      <div className="dev-payment-info">
        <p>🧪 Este es un simulador para desarrollo. No se procesarán pagos reales.</p>
        <p>📝 Prueba diferentes escenarios seleccionando el resultado deseado.</p>
      </div>
    </div>
  );
};

export default DevPaymentForm;
