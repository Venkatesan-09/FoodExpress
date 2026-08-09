require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    console.log('Testing Cloudinary upload with config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined,
    });

    // Upload a small 1x1 transparent pixel GIF
    const base64Image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'foodexpress_test',
    });
    
    console.log('Upload successful! Result url:', result.secure_url);
  } catch (err) {
    console.error('Cloudinary upload failed with error:', err);
  }
}

testUpload();
