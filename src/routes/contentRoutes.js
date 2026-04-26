const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    uploadContent,
    getMyContents,
    getContentById,
    getAllContents,
    deleteContent,
} = require('../controllers/contentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});

// Teacher routes
router.post(
    '/upload',
    authMiddleware,
    roleMiddleware(['teacher']),
    upload.single('file'),
    uploadContent
);

router.get('/my-contents', authMiddleware, roleMiddleware(['teacher']), getMyContents);

// Principal & Teacher routes
router.get('/:id', authMiddleware, getContentById);
router.get('/', authMiddleware, getAllContents);

// Delete content
router.delete('/:id', authMiddleware, deleteContent);

module.exports = router;
