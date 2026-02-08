const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-me'; // Should be env var

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains id, username
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports.SignToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
};
