import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { emailService } from './services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const STORAGE_ROOT = path.join(__dirname, '..', 'storage');
const JWT_SECRET = 'heroos_secret_key_change_in_production';

// --- Config ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use('/storage', express.static(STORAGE_ROOT));

// --- Database (SQLite) ---
// --- Database (PostgreSQL / SQLite) ---
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:heroos.sqlite', {
    dialect: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
    storage: process.env.DATABASE_URL ? undefined : path.join(__dirname, 'heroos.sqlite'),
    dialectOptions: process.env.DATABASE_URL ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {},
    logging: false
});

// --- Models ---
const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    settings: { type: DataTypes.JSON, defaultValue: {} }
});

const File = sequelize.define('File', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    physicalPath: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    category: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE },
    ownerId: { type: DataTypes.UUID, allowNull: false }
});

const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.STRING },
    details: { type: DataTypes.STRING }
});

const SMTPConfig = sequelize.define('SMTPConfig', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    host: { type: DataTypes.STRING, allowNull: false },
    port: { type: DataTypes.INTEGER, allowNull: false },
    secure: { type: DataTypes.BOOLEAN, defaultValue: false },
    user: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Initialize DB and create admin
async function initializeDatabase() {
    await sequelize.sync({ alter: true });
    console.log("✅ Database Synced");

    // Create default admin if not exists
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('hi220806', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            name: 'System Administrator',
            email: 'admin@heroos.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            settings: {
                theme: 'dark',
                wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
                volume: 60,
                wifi: true,
                brightness: 100
            }
        });

        const adminDir = path.join(STORAGE_ROOT, 'admin');
        if (!fs.existsSync(adminDir)) {
            fs.mkdirSync(adminDir, { recursive: true });
        }
        console.log("👤 Admin account created: admin / hi220806");
    }
}

initializeDatabase().then(async () => {
    // Load SMTP configuration if exists
    const smtpConfig = await SMTPConfig.findOne({ where: { isActive: true } });
    if (smtpConfig) {
        emailService.configure({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            user: smtpConfig.user,
            password: smtpConfig.password
        });
        console.log("📧 SMTP Configured");
    }
});

// --- Middleware ---
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// --- Storage Engine ---
if (!fs.existsSync(STORAGE_ROOT)) fs.mkdirSync(STORAGE_ROOT, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const username = req.user.username;
        if (!username) return cb(new Error("User context missing"));

        const safeUser = username.replace(/[^a-z0-9]/gi, '_');
        const userDir = path.join(STORAGE_ROOT, safeUser);

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// --- Routes: Auth ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, name, email } = req.body;

        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Username taken' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: hashedPassword,
            name: name || username,
            email: email || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            settings: {
                theme: 'dark',
                wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
                volume: 60,
                wifi: true,
                brightness: 100
            }
        });

        const safeUser = username.replace(/[^a-z0-9]/gi, '_');
        const userDir = path.join(STORAGE_ROOT, safeUser);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        await ActivityLog.create({ userId: user.id, action: 'REGISTER', details: `User ${username} registered.` });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, email: user.email, avatar: user.avatar, settings: user.settings } });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        await ActivityLog.create({ userId: user.id, action: 'LOGIN', details: `User ${username} logged in.` });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                settings: user.settings
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Routes: User Management ---

app.get('/api/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', auth, adminOnly, async (req, res) => {
    try {
        const { username, password, role, name, email } = req.body;

        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Username exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
            role: role || 'user',
            name: name || username,
            email: email || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            settings: {}
        });

        const safeUser = username.replace(/[^a-z0-9]/gi, '_');
        fs.mkdirSync(path.join(STORAGE_ROOT, safeUser), { recursive: true });

        // Send welcome email
        if (email) {
            await emailService.sendAccountCreatedEmail(email, username, password);
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Users can update themselves, admins can update anyone
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { name, email, settings, password, role } = req.body;
        const changes = {};

        if (name && name !== user.name) { user.name = name; changes.name = true; }
        if (email && email !== user.email) { user.email = email; changes.email = true; }
        if (settings) { user.settings = { ...user.settings, ...settings }; }
        if (role && req.user.role === 'admin') { user.role = role; changes.role = true; }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
            // Send password reset email if admin is resetting someone else's password
            if (req.user.role === 'admin' && req.user.id !== id && user.email) {
                await emailService.sendPasswordResetEmail(user.email, user.username, password);
            }
        }

        await user.save();

        // Send update notification if admin changed something
        if (req.user.role === 'admin' && req.user.id !== id && Object.keys(changes).length > 0 && user.email) {
            await emailService.sendAccountUpdatedEmail(user.email, user.username, changes);
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.id === id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Send deletion notification before deleting
        if (user.email) {
            await emailService.sendAccountDeletedEmail(user.email, user.username);
        }

        // Delete user's files
        await File.destroy({ where: { ownerId: id } });

        // Delete physical folder
        const safeUser = user.username.replace(/[^a-z0-9]/gi, '_');
        const userDir = path.join(STORAGE_ROOT, safeUser);
        if (fs.existsSync(userDir)) {
            fs.rmSync(userDir, { recursive: true, force: true });
        }

        await user.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Routes: Files ---

app.get('/api/files', auth, async (req, res) => {
    try {
        const files = await File.findAll({
            where: { ownerId: req.user.id, isDeleted: false },
            order: [['createdAt', 'DESC']]
        });
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/files/bin', auth, async (req, res) => {
    try {
        const files = await File.findAll({
            where: { ownerId: req.user.id, isDeleted: true },
            order: [['deletedAt', 'DESC']]
        });
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file received' });

    try {
        const newFile = await File.create({
            name: req.file.originalname,
            path: `/storage/${req.user.username}/${req.file.originalname}`,
            physicalPath: req.file.path,
            type: req.file.mimetype,
            size: req.file.size,
            category: req.file.mimetype.startsWith('image/') ? 'Images' :
                req.file.mimetype.startsWith('video/') ? 'Videos' :
                    req.file.mimetype.startsWith('audio/') ? 'Music' : 'Documents',
            ownerId: req.user.id
        });

        await ActivityLog.create({ userId: req.user.id, action: 'UPLOAD', details: `Uploaded ${req.file.originalname}` });

        // Check storage usage and send alerts
        const user = await User.findByPk(req.user.id);
        const userFiles = await File.findAll({ where: { ownerId: req.user.id, isDeleted: false } });
        const totalSize = userFiles.reduce((sum, f) => sum + (f.size || 0), 0);
        const totalGB = totalSize / (1024 * 1024 * 1024);
        const storageLimit = 5; // 5GB default limit
        const usedPercentage = Math.round((totalGB / storageLimit) * 100);

        // Send storage alert emails at thresholds: 50%, 75%, 90%, 100%
        if (user.email && (usedPercentage === 50 || usedPercentage === 75 || usedPercentage === 90 || usedPercentage >= 100)) {
            await emailService.sendStorageAlertEmail(user.email, user.username, usedPercentage, totalGB, storageLimit);
        }

        res.json(newFile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/files/:id', auth, async (req, res) => {
    try {
        const file = await File.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
        if (!file) return res.status(404).json({ error: 'Not found' });

        file.isDeleted = true;
        file.deletedAt = new Date();
        await file.save();

        await ActivityLog.create({ userId: req.user.id, action: 'TRASH', details: `Moved ${file.name} to bin` });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/files/restore/:id', auth, async (req, res) => {
    try {
        const file = await File.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
        if (!file) return res.status(404).json({ error: 'Not found' });

        file.isDeleted = false;
        file.deletedAt = null;
        await file.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/files/permanent/:id', auth, async (req, res) => {
    try {
        const file = await File.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
        if (!file) return res.status(404).json({ error: 'Not found' });

        const safeUser = req.user.username.replace(/[^a-z0-9]/gi, '_');
        const filePath = path.join(STORAGE_ROOT, safeUser, file.name);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await file.destroy();
        await ActivityLog.create({ userId: req.user.id, action: 'DELETE', details: `Permanently deleted ${file.name}` });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/files/empty-bin', auth, async (req, res) => {
    try {
        const files = await File.findAll({ where: { ownerId: req.user.id, isDeleted: true } });

        const safeUser = req.user.username.replace(/[^a-z0-9]/gi, '_');
        for (const file of files) {
            const filePath = path.join(STORAGE_ROOT, safeUser, file.name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await file.destroy();
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Routes: SMTP Configuration ---

app.get('/api/smtp/config', auth, adminOnly, async (req, res) => {
    try {
        const config = await SMTPConfig.findOne({ where: { isActive: true } });
        if (!config) {
            return res.json({ configured: false });
        }
        // Don't send password to frontend
        res.json({
            configured: true,
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/smtp/config', auth, adminOnly, async (req, res) => {
    try {
        const { host, port, secure, user, password } = req.body;

        if (!host || !port || !user || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Deactivate existing configs
        await SMTPConfig.update({ isActive: false }, { where: {} });

        // Create new config
        const config = await SMTPConfig.create({
            host,
            port: parseInt(port),
            secure: secure === true || secure === 'true',
            user,
            password,
            isActive: true
        });

        // Configure email service
        emailService.configure({
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.user,
            password: config.password
        });

        res.json({ success: true, message: 'SMTP configured successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/smtp/test', auth, adminOnly, async (req, res) => {
    try {
        const { testEmail } = req.body;

        if (!testEmail) {
            return res.status(400).json({ error: 'Test email address required' });
        }

        await emailService.sendTestEmail(testEmail);
        res.json({ success: true, message: 'Test email sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to send test email' });
    }
});

// --- Routes: Broadcast & Newsletter ---

app.post('/api/broadcast', auth, adminOnly, async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message required' });
        }

        // Get all users with emails
        const users = await User.findAll({ where: { email: { [Sequelize.Op.ne]: null } } });
        const recipients = users.map(u => u.email).filter(e => e && e.length > 0);

        if (recipients.length === 0) {
            return res.status(400).json({ error: 'No users with email addresses found' });
        }

        const adminUser = await User.findByPk(req.user.id);
        await emailService.sendBroadcastEmail(recipients, subject, message, adminUser.name || 'HeroOS Admin');

        await ActivityLog.create({
            userId: req.user.id,
            action: 'BROADCAST',
            details: `Sent broadcast to ${recipients.length} users: ${subject}`
        });

        res.json({ success: true, message: `Broadcast sent to ${recipients.length} users` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/newsletter', auth, adminOnly, async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content required' });
        }

        // Get all users with emails
        const users = await User.findAll({ where: { email: { [Sequelize.Op.ne]: null } } });
        const recipients = users.map(u => u.email).filter(e => e && e.length > 0);

        if (recipients.length === 0) {
            return res.status(400).json({ error: 'No users with email addresses found' });
        }

        await emailService.sendNewsletterEmail(recipients, title, content, imageUrl);

        await ActivityLog.create({
            userId: req.user.id,
            action: 'NEWSLETTER',
            details: `Sent newsletter to ${recipients.length} users: ${title}`
        });

        res.json({ success: true, message: `Newsletter sent to ${recipients.length} users` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Route: Support ---
app.post('/api/support', async (req, res) => {
    try {
        const { name, email, subject, message, type } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const success = await emailService.sendSupportEmail({ name, email, subject, message, type });

        if (success) {
            res.json({ success: true, message: 'Support request sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send support email. Check SMTP configuration.' });
        }
    } catch (err) {
        console.error('Support API Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`\n🚀 HeroOS Server running on http://localhost:${PORT}`);
    console.log(`📁 Physical Storage: ${STORAGE_ROOT}`);
    console.log(`🔐 Admin: admin / hi220806\n`);
});
