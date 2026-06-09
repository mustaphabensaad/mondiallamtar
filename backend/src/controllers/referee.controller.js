const db = require('../config/db');

async function getReferees(req, res, next) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM referees ORDER BY name'
    );
    res.json({ referees: rows });
  } catch (err) { next(err); }
}

async function createReferee(req, res, next) {
  try {
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [tours] = await db.query('SELECT id FROM tournament ORDER BY id DESC LIMIT 1');
    if (!tours.length) return res.status(400).json({ message: 'No tournament found' });

    const [result] = await db.query(
      'INSERT INTO referees (tournament_id, name, phone, email) VALUES (?, ?, ?, ?)',
      [tours[0].id, name, phone || null, email || null]
    );
    const [ref] = await db.query('SELECT * FROM referees WHERE id = ?', [result.insertId]);
    res.status(201).json({ referee: ref[0] });
  } catch (err) { next(err); }
}

async function updateReferee(req, res, next) {
  try {
    const { name, phone, email, is_active } = req.body;
    const [rows] = await db.query('SELECT * FROM referees WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Referee not found' });

    await db.query(
      'UPDATE referees SET name=?, phone=?, email=?, is_active=? WHERE id=?',
      [name ?? rows[0].name, phone ?? rows[0].phone, email ?? rows[0].email,
       is_active ?? rows[0].is_active, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM referees WHERE id = ?', [req.params.id]);
    res.json({ referee: updated[0] });
  } catch (err) { next(err); }
}

async function deleteReferee(req, res, next) {
  try {
    await db.query('UPDATE referees SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Referee deactivated' });
  } catch (err) { next(err); }
}

module.exports = { getReferees, createReferee, updateReferee, deleteReferee };
