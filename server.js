const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- Storage Config ---
// Simulating "Partitioned" Storage
const STORAGE_ROOT = path.join(__dirname, 'storage');

// Ensure root exists
if (!fs.existsSync(STORAGE_ROOT)) fs.mkdirSync(STORAGE_ROOT);

// Multer Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const username = req.headers['x-user-id']; // Client sends username
        if (!username) return cb(new Error('No User ID provided'));

        // Security: Sanitize username to prevent directory traversal
        const safeUser = username.replace(/[^a-z0-9]/gi, '_');
        const userDir = path.join(STORAGE_ROOT, safeUser);

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original name
    }
});

const upload = multer({ storage });

// --- Endpoints ---

// LIST FILES
app.get('/api/files', (req, res) => {
    const username = req.headers['x-user-id'];
    if (!username) return res.status(400).json({ error: 'User ID required' });

    const safeUser = username.replace(/[^a-z0-9]/gi, '_');
    const userDir = path.join(STORAGE_ROOT, safeUser);

    if (!fs.existsSync(userDir)) return res.json([]); // Empty if new user

    fs.readdir(userDir, (err, files) => {
        if (err) return res.status(500).json({ error: 'Read failed' });

        // Map to HeroOS File Object format
        const fileList = files.map(filename => {
            const stats = fs.statSync(path.join(userDir, filename));
            return {
                name: filename,
                size: stats.size,
                createdAt: stats.birthtime,
                path: `/storage/${safeUser}/${filename}`
            };
        });
        res.json(fileList);
    });
});

// UPLOAD FILE
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ success: true, file: req.file });
});

// DELETE FILE
app.delete('/api/files/:filename', (req, res) => {
    const username = req.headers['x-user-id'];
    const filename = req.params.filename;

    if (!username) return res.status(400).json({ error: 'User ID required' });

    const safeUser = username.replace(/[^a-z0-9]/gi, '_');
    const filePath = path.join(STORAGE_ROOT, safeUser, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(PORT, () => {
    console.log(`HeroOS File Server running on http://localhost:${PORT}`);
    console.log(`Physical Storage Location: ${STORAGE_ROOT}`);
});
