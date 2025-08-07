const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Link = require('../models/Link');
const User = require('../models/User');

// Middleware para verificar token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token inválido' });
    req.userId = decoded.id;
    next();
  });
}

// Obtener todos los enlaces del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener los enlaces' });
  }
});

// Crear un nuevo enlace
router.post('/', verifyToken, async (req, res) => {
  const { title, url, description } = req.body;
  try {
    const newLink = new Link({
      userId: req.userId,
      title,
      url,
      description
    });
    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ msg: 'Error al guardar el enlace' });
  }
});

// Eliminar un enlace por ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Link.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ msg: 'Enlace eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar el enlace' });
  }
});

module.exports = router;
