# 🚀 Configuración para Producción

## 📋 Resumen de configuración

| Componente | URL de Producción | Puerto |
|------------|-------------------|--------|
| Frontend | `https://curiosidadesnancy.shop` | 3000 |
| Frontend (www) | `https://www.curiosidadesnancy.shop` | 3000 |
| Backend API | `https://api-joyeria.curiosidadesnancy.shop` | 5000 |

## ✅ Cambios realizados

### 🎯 Backend (CORS)
- ✅ Agregados dominios de producción en `allowedOrigins`
- ✅ Configurado HOST=0.0.0.0 para producción
- ✅ Variables de entorno actualizadas

### 🎯 Frontend (API)
- ✅ Configuración dinámica en `src/config/api.js`
- ✅ Archivo `.env.production` creado
- ✅ Variables de entorno configuradas

## 🔧 Archivos modificados

### Backend (`/backend/server.js`)
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://127.0.0.1:3000',
  'https://curiosidadesnancy.shop',          // ✅ NUEVO
  'https://www.curiosidadesnancy.shop',      // ✅ NUEVO
  'https://joyeria-frontend.vercel.app',
  'https://kelgut13.github.io'
];
```

### Frontend (`/src/config/api.js`)
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-joyeria.curiosidadesnancy.shop'  // ✅ ACTUALIZADO
  : 'http://127.0.0.1:5000';
```

### Variables de entorno

#### Backend (`.env`)
```env
# Server Configuration
PORT=5000
HOST=0.0.0.0                    # ✅ CAMBIADO para producción
NODE_ENV=production             # ✅ NUEVO
```

#### Frontend (`.env.production`)
```env
REACT_APP_API_URL=https://api-joyeria.curiosidadesnancy.shop
NODE_ENV=production
```

## 🚀 Comandos de despliegue

### Para Frontend
```bash
# Build para producción
npm run build

# Los archivos se generan en /build/
```

### Para Backend
```bash
# Instalar dependencias
cd backend && npm install

# Iniciar en producción
npm start
```

## 🔍 Verificación

### ✅ CORS permitirá conexiones desde:
- `https://curiosidadesnancy.shop`
- `https://www.curiosidadesnancy.shop`

### ✅ Frontend apuntará a:
- `https://api-joyeria.curiosidadesnancy.shop`

### ✅ Backend escuchará en:
- Puerto: `5000`
- Host: `0.0.0.0` (todas las interfaces)

## ⚠️ Recordatorios para el servidor

1. **SSL/HTTPS**: Asegúrate de que `api-joyeria.curiosidadesnancy.shop` tenga certificado SSL
2. **Firewall**: Puerto 5000 debe estar abierto
3. **Proxy reverso**: Configura nginx/apache para manejar el dominio
4. **Variables de entorno**: Copia el archivo `.env` al servidor
5. **Base de datos**: Verifica conectividad a MySQL

## 🎯 Próximos pasos

1. Subir código a la rama `produccion`
2. Deployar en el servidor
3. Configurar dominio y SSL
4. Probar conexión end-to-end
