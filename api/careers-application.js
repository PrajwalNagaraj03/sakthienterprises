const multer = require('multer');
const { sendCareersApplication, isAllowedResume, MAX_RESUME_SIZE } = require('../lib/careersEmail');

// Vercel parses the request body by default — disable it so multer can read
// the raw multipart stream directly.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE },
  fileFilter: (req, file, cb) => {
    if (isAllowedResume(file)) cb(null, true);
    else cb(new Error('INVALID_FILE_TYPE'));
  }
});

// Vercel doesn't parse multipart/form-data automatically, so multer's middleware
// is invoked manually against the raw req/res instead of through Express.
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await runMiddleware(req, res, upload.single('resume'));
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Resume file is too large. Maximum size is 4MB.' });
    }
    if (err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: 'Resume must be a PDF or Word document (.pdf, .doc, .docx).' });
    }
    console.error('Upload error:', err);
    return res.status(400).json({ error: 'Could not process your upload. Please try again.' });
  }

  const { firstName, phone, email, qualification, position } = req.body || {};
  if (!firstName || !phone || !email || !qualification || !position || !req.file) {
    return res.status(400).json({ error: 'Please fill in all required fields and attach your resume.' });
  }

  try {
    await sendCareersApplication({ firstName, phone, email, qualification, position, file: req.file });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Careers application error:', err);
    return res.status(500).json({ error: err.publicMessage || 'Something went wrong. Please try again later.' });
  }
};
