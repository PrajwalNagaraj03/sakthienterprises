const { sendContactEnquiry } = require('../lib/contactEmail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { name, phone, product, message } = req.body || {};

  if (!name || !phone || !product) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    await sendContactEnquiry({ name, phone, product, message });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact enquiry error:', err);
    return res.status(500).json({ error: err.publicMessage || 'Something went wrong. Please try again later.' });
  }
};
