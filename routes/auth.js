// /routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "secreto123";

// === REGISTRO CON ENVÍO DE CÓDIGO ===
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "El correo ya está registrado" });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({ username, email, password, verificationCode });

    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "Usuario creado. Verifica tu correo con el código enviado." });
  } catch (err) {
    console.error("❌ Error en /register:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// === VERIFICAR CÓDIGO DE VERIFICACIÓN ===
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (user.isVerified) {
      return res.status(400).json({ message: "El usuario ya está verificado", success: false });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Código incorrecto", success: false });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Cuenta verificada correctamente" });
  } catch (err) {
    console.error("❌ Error en /verify-code:", err);
    res.status(500).json({ message: "Error en el servidor", success: false });
  }
});

// === LOGIN (sólo si está verificado) ===
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Contraseña incorrecta" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Debes verificar tu cuenta antes de iniciar sesión" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
