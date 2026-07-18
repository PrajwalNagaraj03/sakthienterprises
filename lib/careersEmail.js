const { Resend } = require('resend');

const CAREERS_FROM_EMAIL = 'Sakthi Enterprises Careers <careers@sakthienterprises.co.in>';
const CAREERS_TO_EMAIL = 'office.sakthienterprises@gmail.com';
const MAX_RESUME_SIZE = 4 * 1024 * 1024; // 4MB — stays under Vercel's ~4.5MB function payload limit
const ALLOWED_RESUME_EXT = /\.(pdf|doc|docx)$/i;
const ALLOWED_RESUME_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isAllowedResume(file) {
  return ALLOWED_RESUME_EXT.test(file.originalname) && ALLOWED_RESUME_MIME.includes(file.mimetype);
}

async function sendCareersApplication({ firstName, phone, email, qualification, position, file }) {
  if (!process.env.RESEND_API_KEY) {
    const err = new Error('RESEND_API_KEY is not set');
    err.publicMessage = 'Email service is not configured yet. Please call us instead.';
    throw err;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: CAREERS_FROM_EMAIL,
    to: CAREERS_TO_EMAIL,
    replyTo: email,
    subject: `New Job Application — ${firstName} (${position})`,
    html: `
      <h2>New Careers Application</h2>
      <p><strong>First Name:</strong> ${escapeHtml(firstName)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Qualification:</strong> ${escapeHtml(qualification)}</p>
      <p><strong>Position Interested In:</strong> ${escapeHtml(position)}</p>
    `,
    attachments: [
      {
        filename: file.originalname,
        content: file.buffer
      }
    ]
  });

  if (error) {
    console.error('Resend API error:', error);
    const err = new Error(error.message || 'Resend API error');
    err.publicMessage = 'Something went wrong sending your application. Please try again later.';
    throw err;
  }
}

module.exports = {
  sendCareersApplication,
  isAllowedResume,
  MAX_RESUME_SIZE,
  CAREERS_FROM_EMAIL,
  CAREERS_TO_EMAIL
};
