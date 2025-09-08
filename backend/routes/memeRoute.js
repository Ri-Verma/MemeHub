const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const memeController = require('../controllers/memeController');
const authMiddleware = require('../auth/userAuth');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const fileType = path.extname(file.originalname).toLowerCase();
        let uploadPath = 'public/uploads/';
        
        if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
            uploadPath += 'images/';
        } else if (['.gif'].includes(fileType)) {
            uploadPath += 'gifs/';
        } else if (['.mp4', '.webm'].includes(fileType)) {
            uploadPath += 'videos/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', memeController.getAllMemes);
router.get('/category/:category', memeController.getMemesByCategory);
router.get('/:memeId', memeController.getMemeById);


// Protected routes
router.post('/upload', authMiddleware, upload.single('meme'), memeController.uploadMeme);
router.post('/:memeId/like', authMiddleware, memeController.likeMeme);
router.delete('/:memeId/like', authMiddleware, memeController.unlikeMeme);
router.post('/:memeId/share', authMiddleware, memeController.shareMeme);

module.exports = router;