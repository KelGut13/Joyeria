import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado." });
    }

    // Guardamos los datos decodificados en la request para usarlos después
    req.user = decoded;
    next();
  });
};

export { verifyToken };