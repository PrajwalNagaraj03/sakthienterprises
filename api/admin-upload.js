const multer = require('multer');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('INVALID_FILE_TYPE'));
  },
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });
}

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('No token');
  return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    verifyToken(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized. Please log in again.' });
  }

  try {
    await runMiddleware(req, res, upload.single('image'));
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image too large. Maximum size is 8 MB.' });
    }
    if (err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed.' });
    }
    console.error('Upload middleware error:', err);
    return res.status(400).json({ error: 'Could not process the upload. Please try again.' });
  }

  const { category } = req.body || {};
  if (!category || !req.file) {
    return res.status(400).json({ error: 'An image and a category are required.' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'sakthi-enterprises/gallery',
            tags: [category, 'gallery'],
            resource_type: 'image',
          },
          (error, res) => {
            if (error) reject(error);
            else resolve(res);
          }
        )
        .end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      category,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ error: 'Failed to upload image. Please try again.' });
  }
};

handler.config = { api: { bodyParser: false } };
module.exports = handler;
