import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './TestStripe.css';

const TestStripe = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testStripeConnection = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResult('❌ No hay token de autenticación. Inicia sesión primero.');
        return;
      }

      const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total: 1.00, // $1 MXN para prueba
          currency: 'mxn',
          metodoPago: 'Tarjeta de Crédito',
          productos: [{
            id_producto: 1,
            nombre: 'Producto de prueba',
            cantidad: 1,
            precio: 1.00
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paymentIntentId.includes('pi_dev_')) {
          setTestResult(`🧪 Modo desarrollo funcionando! PaymentIntent simulado: ${data.paymentIntentId}`);
        } else {
          setTestResult(`✅ Stripe configurado correctamente! PaymentIntent ID: ${data.paymentIntentId}`);
        }
      } else {
        const errorData = await response.json();
        setTestResult(`❌ Error: ${errorData.error} - ${errorData.details}`);
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="test-stripe-container">
      <h3 className="test-stripe-title">🧪 Prueba de Configuración Stripe</h3>
      <button 
        onClick={testStripeConnection}
        disabled={isLoading}
        className="test-stripe-button"
      >
        {isLoading ? (
          <>
            <div className="test-stripe-spinner" />
            Probando...
          </>
        ) : (
          'Probar Conexión Stripe'
        )}
      </button>
      {testResult && (
        <div className={`test-stripe-result ${testResult.includes('✅') ? 'success' : 'error'}`}>
          {testResult}
        </div>
      )}
    </div>
  );
};

export default TestStripe;
