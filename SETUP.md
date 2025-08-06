# 🏪 Proyecto Joyería - Guía de Instalación

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **XAMPP** o **MySQL** local
- **Git**

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/KelGut13/Joyeria.git
cd Joyeria
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

#### Configurar Variables de Entorno
1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus configuraciones:
   ```bash
   # Database Configuration (Base de datos remota - NO cambiar)
   DB_HOST=srv1009.hstgr.io
   DB_USER=u465901502_admin
   DB_PASSWORD=@UTequipo2
   DB_NAME=u465901502_joyeria
   DB_PORT=3306
   
   # Server Configuration
   PORT=5000
   
   # JWT Configuration
   JWT_SECRET=tu_clave_secreta_aqui
   ```

#### ⚠️ Configuraciones Opcionales

**Stripe (para pagos)** - Solo si necesitas procesar pagos reales:
```bash
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
```

**Email (para contacto)** - Solo si necesitas envío de emails:
```bash
CORREO_ORIGEN=tu_email@gmail.com
CORREO_PASSWORD=tu_password_de_aplicacion
CORREO_DESTINO=destino@gmail.com
```

### 3. Base de Datos

**⚠️ IMPORTANTE**: Este proyecto usa una **base de datos remota compartida** en `srv1009.hstgr.io`

- ✅ **NO necesitas** instalar XAMPP o MySQL local
- ✅ **NO necesitas** crear ninguna base de datos
- ✅ **NO necesitas** importar archivos SQL
- ✅ La configuración de la base de datos **ya está lista** en `.env.example`

**La base de datos remota ya contiene:**
- Todas las tablas necesarias
- Datos de productos
- Estructura completa del sistema

### 4. Configurar el Frontend

```bash
cd ../  # Volver a la raíz del proyecto
npm install
```

### 5. Iniciar el Proyecto

#### Opción A: Iniciar todo de una vez
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

#### Opción B: Usar concurrently (si está instalado)
```bash
npm run dev
```

## 🌐 URLs del Proyecto

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Base de Datos**: srv1009.hstgr.io (remota, no local)

## 🔧 Solución de Problemas Comunes

### Backend no inicia
- ✅ Verifica que la conexión a Internet esté funcionando (base de datos remota)
- ✅ Revisa que el archivo `.env` esté configurado
- ✅ Confirma que el puerto 5000 esté libre

### Frontend no conecta con Backend
- ✅ Verifica que el backend esté corriendo en puerto 5000
- ✅ Revisa la configuración en `src/config/api.js`

### Error de Base de Datos
- ✅ Confirma que tengas conexión a Internet (base de datos remota)
- ✅ Verifica que las credenciales en `.env` sean exactas
- ✅ **NO cambies** la configuración de la base de datos (es compartida)

### Stripe no funciona
- ✅ **Es normal** - Stripe es opcional para desarrollo
- ✅ Para habilitarlo, configura tus claves en `.env`
- ✅ El proyecto funciona sin Stripe (solo sin pagos)

## 📁 Estructura del Proyecto

```
Joyeria/
├── backend/              # Servidor Node.js/Express
│   ├── .env             # Variables de entorno (crear desde .env.example)
│   ├── server.js        # Servidor principal
│   └── middlewares/     # Middlewares de autenticación
├── src/                 # Frontend React
│   ├── config/          # Configuración de API
│   ├── componentes/     # Componentes React
│   └── paginas/         # Páginas de la aplicación
└── public/              # Archivos estáticos
```

## 🤝 Colaboración

### Para Colaboradores

1. **Fork** el repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. **No commitees** el archivo `.env` (está en `.gitignore`)
4. Haz commit de tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
5. Push a la rama: `git push origin feature/nueva-funcionalidad`
6. Abre un **Pull Request**

### Configuraciones Personales

Cada colaborador debe:
- ✅ Crear su propio archivo `.env` desde `.env.example`
- ✅ **NO modificar** las credenciales de la base de datos (son compartidas)
- ✅ Si necesita Stripe, usar sus propias claves de prueba

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Verifica los logs de la consola
3. Abre un Issue en GitHub
4. Contacta al equipo de desarrollo

---
**¡Feliz desarrollo! 🚀**
