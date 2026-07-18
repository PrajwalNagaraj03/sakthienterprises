const jwt = require('jsonwebtoken');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { password } = req.body || {};

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  const token = jwt.sign({ admin: true }, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
  return res.status(200).json({ token });
};

module.exports = handler;
