const db = require('../config/db');

async function getTournament(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM tournament ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ message: 'No tournament found' });
    res.json({ tournament: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTournament };
