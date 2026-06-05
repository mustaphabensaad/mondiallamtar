const db = require('../config/db');

async function getSponsors(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sponsors WHERE is_active = TRUE ORDER BY display_order ASC`
    );
    res.json({ sponsors: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSponsors };
