// /middleware/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secreto123";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Soporta "Bearer <token>"

  if (!token) return res.status(401).json({ type: "no_token", message: "Token no enviado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ type: "invalid_token", message: "Token inválido" });
  }
}

module.exports = verifyToken;
