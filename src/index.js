import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ThemeProvider } from './context/ThemeContext'; 
import { CartProvider } from './context/CartContext'; // 👈 importar carrito
import './paginas/estilos/variables.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartProvider> {/* 👈 envolvemos todo */}
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </CartProvider>
  </React.StrictMode>
);

reportWebVitals();
