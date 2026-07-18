require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { sendCareersApplication, isAllowedResume, MAX_RESUME_SIZE } = require('./lib/careersEmail');
const { sendContactEnquiry } = require('./lib/contactEmail');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE },
  fileFilter: (req, file, cb) => {
    if (isAllowedResume(file)) cb(null, true);
    else cb(new Error('INVALID_FILE_TYPE'));
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the coming soon page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Local dev equivalent of api/careers-application.js (the Vercel serverless function
// used in production). Kept in sync via the shared lib/careersEmail.js module.
app.post('/api/careers-application', upload.single('resume'), async (req, res, next) => {
  try {
    const { firstName, phone, email, qualification, position } = req.body;

    if (!firstName || !phone || !email || !qualification || !position || !req.file) {
      return res.status(400).json({ error: 'Please fill in all required fields and attach your resume.' });
    }

    await sendCareersApplication({ firstName, phone, email, qualification, position, file: req.file });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Local dev equivalent of api/contact.js
app.post('/api/contact', express.json(), async (req, res, next) => {
  try {
    const { name, phone, product, message } = req.body || {};
    if (!name || !phone || !product) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }
    await sendContactEnquiry({ name, phone, product, message });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── Admin: login ──
app.post('/api/admin-login', express.json(), (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password.' });
  }
  const token = jwt.sign({ admin: true }, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
});

// ── Admin: image upload ──
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('INVALID_FILE_TYPE'));
  },
});

function verifyAdmin(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

app.post('/api/admin-upload', imageUpload.single('image'), async (req, res, next) => {
  if (!verifyAdmin(req, res)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { category } = req.body || {};
  if (!category || !req.file) {
    return res.status(400).json({ error: 'An image and a category are required.' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'sakthi-enterprises/gallery', tags: [category, 'gallery'], resource_type: 'image' },
          (err, r) => (err ? reject(err) : resolve(r))
        )
        .end(req.file.buffer);
    });
    return res.json({ success: true, url: result.secure_url, publicId: result.public_id, category });
  } catch (err) {
    next(err);
  }
});

// ── Gallery images (public) ──
app.get('/api/gallery-images', async (req, res, next) => {
  const { category } = req.query;
  try {
    const expression =
      category && category !== 'all'
        ? `folder:sakthi-enterprises/gallery AND tags=${category}`
        : 'folder:sakthi-enterprises/gallery';

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .with_field('tags')
      .execute();

    const images = result.resources.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      category: r.tags.find((t) => t !== 'gallery') || 'uncategorized',
    }));

    return res.json({ images });
  } catch (err) {
    next(err);
  }
});

// Error handler — covers multer errors (bad file type, too large) and other failures
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large.' });
  }
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'Invalid file type.' });
  }
  console.error('Server error:', err);
  res.status(500).json({ error: err.publicMessage || 'Something went wrong. Please try again later.' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Sakthi Enterprises server running at http://localhost:${server.address().port}`);
});
