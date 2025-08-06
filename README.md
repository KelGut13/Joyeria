# 🏪 Joyería - E-commerce Platform

**Plataforma de comercio electrónico para joyería con carrito de compras, autenticación de usuarios y procesamiento de pagos.**

## 🚀 Inicio Rápido

### Para Colaboradores Nuevos
```bash
git clone https://github.com/KelGut13/Joyeria.git
cd Joyeria
npm run setup    # Instala dependencias de frontend y backend
```

**📋 [Ver Guía Completa de Instalación - SETUP.md](./SETUP.md)**

### Para Desarrollo
```bash
npm run dev      # Ejecuta frontend (3000) + backend (5000)
# O por separado:
npm start        # Solo frontend
npm run backend  # Solo backend
```

## ⚡ Scripts Útiles

```bash
npm run setup    # Instalar todas las dependencias
npm run dev      # Ejecutar frontend + backend
npm run backend  # Solo backend
cd backend && npm run check  # Verificar configuración
```

## 🔧 Configuración Rápida

1. **Base de datos**: ✅ **Ya configurada** (remota en srv1009.hstgr.io)
2. **Variables**: Copiar `backend/.env.example` → `backend/.env` 
3. **Desarrollo**: `npm run dev`

## 📁 Estructura

```
Joyeria/
├── backend/          # API Node.js/Express
├── src/             # Frontend React
├── public/          # Archivos estáticos
├── SETUP.md         # 📖 Guía completa
└── package.json     # Scripts principales
```

## 🌐 URLs en Desarrollo

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000  
- **Base de Datos**: srv1009.hstgr.io (remota, compartida)

## 🤝 Colaboración

- ✅ Usar `backend/.env.example` como plantilla
- ✅ **No commitear** archivos `.env`
- ✅ **No modificar** credenciales de base de datos (son compartidas)
- ✅ Seguir la estructura de ramas: `feature/nombre`

## 📞 Soporte

¿Problemas? Consulta **[SETUP.md](./SETUP.md)** o abre un Issue.

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
