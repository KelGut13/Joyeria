import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import './StripeStatus.css';

const StripeStatus = ({ isProduction = false }) => {
  return (
    <div className="stripe-status-container">
      <div className="stripe-status-badge">
        <Shield size={16} className="stripe-status-icon" />
        <span className="stripe-status-text">
          {isProduction ? (
            <>✅ Stripe Activo - Pagos Reales</>
          ) : (
            <>🧪 Modo Desarrollo - Pagos Simulados</>
          )}
        </span>
      </div>
      
      {isProduction && (
        <div className="stripe-status-info">
          <CheckCircle size={14} />
          <span>Procesado por Stripe - Conexión segura</span>
        </div>
      )}
    </div>
  );
};

export default StripeStatus;
