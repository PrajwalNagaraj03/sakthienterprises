const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

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
      // The category tag is everything except the generic 'gallery' tag
      category: r.tags.find((t) => t !== 'gallery') || 'uncategorized',
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ images });
  } catch (err) {
    console.error('Gallery fetch error:', err);
    return res.status(500).json({ error: 'Failed to load gallery images.' });
  }
};

module.exports = handler;
