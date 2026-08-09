const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

// Store file in memory buffer, pipe to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/image', authenticate, uploadLimiter, upload.single('image'), uploadImage);
router.delete('/image/:publicId', authenticate, deleteImage);

module.exports = router;
