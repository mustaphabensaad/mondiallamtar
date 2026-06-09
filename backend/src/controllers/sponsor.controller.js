const db = require('../config/db');

// GET /api/sponsors  (public)
async function getSponsors(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sponsors WHERE is_active = TRUE
       ORDER BY FIELD(tier,'gold','silver','bronze'), display_order ASC`
    );
    res.json({ sponsors: rows });
  } catch (err) { next(err); }
}

// GET /api/sponsors/all  (admin — includes inactive)
async function getAllSponsors(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sponsors
       ORDER BY FIELD(tier,'gold','silver','bronze'), display_order ASC`
    );
    res.json({ sponsors: rows });
  } catch (err) { next(err); }
}

// POST /api/sponsors  (admin)
async function createSponsor(req, res, next) {
  try {
    const { name, logo_path, website_url, tier = 'bronze', display_order = 0 } = req.body;
    const [[t]] = await db.query('SELECT id FROM tournament ORDER BY id DESC LIMIT 1');
    if (!t) return res.status(404).json({ message: 'No tournament found' });

    const [r] = await db.query(
      `INSERT INTO sponsors (tournament_id, name, logo_path, website_url, tier, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [t.id, name, logo_path || null, website_url || null, tier, display_order]
    );
    const [[sponsor]] = await db.query('SELECT * FROM sponsors WHERE id = ?', [r.insertId]);
    res.status(201).json({ sponsor });
  } catch (err) { next(err); }
}

// PUT /api/sponsors/:id  (admin)
async function updateSponsor(req, res, next) {
  try {
    const { name, logo_path, website_url, tier, display_order, is_active } = req.body;
    const [[current]] = await db.query('SELECT * FROM sponsors WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Sponsor not found' });

    await db.query(
      `UPDATE sponsors SET
         name          = ?,
         logo_path     = ?,
         website_url   = ?,
         tier          = ?,
         display_order = ?,
         is_active     = ?
       WHERE id = ?`,
      [
        name          ?? current.name,
        logo_path     ?? current.logo_path,
        website_url   ?? current.website_url,
        tier          ?? current.tier,
        display_order ?? current.display_order,
        is_active     != null ? is_active : current.is_active,
        req.params.id,
      ]
    );
    const [[sponsor]] = await db.query('SELECT * FROM sponsors WHERE id = ?', [req.params.id]);
    res.json({ sponsor });
  } catch (err) { next(err); }
}

// DELETE /api/sponsors/:id  (admin)
async function deleteSponsor(req, res, next) {
  try {
    const [[s]] = await db.query('SELECT id FROM sponsors WHERE id = ?', [req.params.id]);
    if (!s) return res.status(404).json({ message: 'Sponsor not found' });
    await db.query('DELETE FROM sponsors WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { getSponsors, getAllSponsors, createSponsor, updateSponsor, deleteSponsor };
