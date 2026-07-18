require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const { sendCareersApplication, isAllowedResume, MAX_RESUME_SIZE } = require('./lib/careersEmail');
const { sendContactEnquiry } = require('./lib/contactEmail');

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

// Error handler — multer errors (bad file type, too large) and any other failures above
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Resume file is too large. Maximum size is 4MB.' });
  }
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'Resume must be a PDF or Word document (.pdf, .doc, .docx).' });
  }
  console.error('Careers application error:', err);
  res.status(500).json({ error: err.publicMessage || 'Something went wrong. Please try again later.' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Sakthi Enterprises server running at http://localhost:${server.address().port}`);
});
