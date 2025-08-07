const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ msg: 'Ya existe este usuario' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: 'Usuario creado con éxito' });
    } catch (err) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: 'Error al iniciar sesión' });
    }
});

module.exports = router;
