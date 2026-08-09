const cloudinary = require('cloudinary').v2;
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/apiResponse');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/v1/uploads/image
 * Auth: any authenticated user — Upload a single image
 * Expects: multipart/form-data with field "image"
 * MOCKED FALLBACK: if Cloudinary is not configured, returns a placeholder URL
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image file provided.', 400);

  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    // Return a placeholder for dev without Cloudinary
    const placeholderUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
    return sendSuccess(res, 200, 'Image uploaded (placeholder — configure Cloudinary)', {
      url: placeholderUrl,
      publicId: `placeholder_${Date.now()}`,
    });
  }

  // Upload to Cloudinary from buffer
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'foodexpress',
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError(`Upload failed: ${error.message}`, 500));
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  sendSuccess(res, 200, 'Image uploaded successfully', {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    width: uploadResult.width,
    height: uploadResult.height,
  });
});

/**
 * DELETE /api/v1/uploads/image/:publicId
 * Auth: admin — Delete an image from Cloudinary
 */
const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return sendSuccess(res, 200, 'Image deleted (placeholder)');
  }

  await cloudinary.uploader.destroy(publicId);
  sendSuccess(res, 200, 'Image deleted');
});

module.exports = { uploadImage, deleteImage };
