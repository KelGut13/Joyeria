import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log("🔐 Verificando token...");
  console.log("🔍 Headers recibidos:", {
    authorization: req.headers['authorization'] ? `Bearer ${req.headers['authorization'].substring(7, 20)}...` : 'No presente',
    'content-type': req.headers['content-type']
  });
  
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    console.log("❌ No authorization header");
    return res.status(401).json({ 
      error: "Token de acceso requerido",
      code: "NO_TOKEN" 
    });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  if (!token) {
    console.log("❌ Token vacío");
    return res.status(401).json({ 
      error: "Token de acceso requerido",
      code: "EMPTY_TOKEN" 
    });
  }

  console.log("🔑 Token recibido (primeros 20 chars):", token.substring(0, 20) + "...");
  console.log("🔑 JWT_SECRET configurado:", !!process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    
    console.log("✅ Token válido, datos decodificados:", {
      id: decoded.id,
      rol: decoded.rol,
      email: decoded.email,
      exp: new Date(decoded.exp * 1000).toISOString(),
      iat: new Date(decoded.iat * 1000).toISOString(),
      timeUntilExpiry: `${Math.floor(timeUntilExpiry / 3600)}h ${Math.floor((timeUntilExpiry % 3600) / 60)}m`
    });
    
    // Advertir si el token expira pronto (menos de 1 día)
    if (timeUntilExpiry < 86400) {
      console.log("⚠️ Token expira en menos de 24 horas");
    }
    
    req.user = {
      id: decoded.id,
      rol: decoded.rol,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", {
      name: error.name,
      message: error.message,
      stack: error.stack.split('\n')[0]
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        code: "TOKEN_EXPIRED" 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: "Token inválido. Por favor, inicia sesión nuevamente.",
        code: "INVALID_TOKEN" 
      });
    } else {
      return res.status(401).json({ 
        error: "Error de autenticación. Intenta iniciar sesión nuevamente.",
        code: "AUTH_ERROR" 
      });
    }
  }
};