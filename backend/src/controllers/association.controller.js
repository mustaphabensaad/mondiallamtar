const db = require('../config/db');

async function getImages(req, res, next) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM association_images ORDER BY display_order ASC'
    );
    res.json({ images: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getImages };
