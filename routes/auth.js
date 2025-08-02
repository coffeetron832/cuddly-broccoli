// /routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secreto123";

// REGISTRO
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ¿Ya existe?
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "El correo ya está registrado" });

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Contraseña incorrecta" });

    // Crear token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
