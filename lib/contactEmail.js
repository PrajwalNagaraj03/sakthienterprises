const { Resend } = require('resend');

const CONTACT_FROM_EMAIL = 'Sakthi Enterprises <hello@sakthienterprises.co.in>';
const CONTACT_TO_EMAIL = 'info@sakthienterprises.co.in';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendContactEnquiry({ name, phone, product, message }) {
  if (!process.env.RESEND_API_KEY) {
    const err = new Error('RESEND_API_KEY is not set');
    err.publicMessage = 'Email service is not configured yet. Please call us instead.';
    throw err;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
    subject: `New Enquiry — ${escapeHtml(name)} (${escapeHtml(product)})`,
    html: `
      <h2>New Product Enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Product:</strong> ${escapeHtml(product)}</p>
      ${message ? `<p><strong>Message:</strong> ${escapeHtml(message)}</p>` : ''}
    `
  });

  if (error) {
    console.error('Resend API error:', error);
    const err = new Error(error.message || 'Resend API error');
    err.publicMessage = 'Something went wrong sending your enquiry. Please try again later.';
    throw err;
  }
}

module.exports = { sendContactEnquiry };
