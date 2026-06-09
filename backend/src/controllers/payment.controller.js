const path = require('path');
const db   = require('../config/db');

async function uploadProof(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path.replace(/\\/g, '/');

    await db.query(
      `UPDATE teams SET payment_proof = ?, payment_status = 'pending_review', payment_date = NOW()
       WHERE captain_id = ?`,
      [filePath, req.user.id]
    );
    res.json({ message: 'Proof uploaded, awaiting review', file: filePath });
  } catch (err) { next(err); }
}

async function getStatus(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.name, t.payment_status, t.payment_proof, t.payment_date,
              tr.team_fee, tr.bank_details
       FROM teams t
       JOIN tournament tr ON tr.id = t.tournament_id
       WHERE t.captain_id = ?
       ORDER BY t.id DESC LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.json({ team: null });
    res.json({ payment: rows[0] });
  } catch (err) { next(err); }
}

// Admin: confirm payment
async function confirmPayment(req, res, next) {
  try {
    await db.query(
      `UPDATE teams SET payment_status = 'paid', payment_date = NOW() WHERE id = ?`,
      [req.params.id]
    );
    res.json({ message: 'Payment confirmed' });
  } catch (err) { next(err); }
}

module.exports = { uploadProof, getStatus, confirmPayment };
