const express = require('express');
const router = express.router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        let user = await User.findOne({ where: { username } });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({ ...req.body, role: 'user', password: hashedPassword });

        // Auto-login
        const token = jwt.sign({ id: user.id }, 'your-secret-key-change-me', { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const token = jwt.sign({ id: user.id }, 'your-secret-key-change-me', { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, settings: user.settings } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Current User
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
