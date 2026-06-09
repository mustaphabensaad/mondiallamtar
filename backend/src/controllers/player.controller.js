const db = require('../config/db');

async function getTopScorers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      `SELECT p.id, p.first_name, p.last_name, p.goals, p.yellow_cards, p.red_cards,
              p.jersey_number, p.position, p.photo_path,
              t.name AS team_name, t.logo_path AS team_logo
       FROM players p
       JOIN teams t ON t.id = p.team_id
       WHERE p.goals > 0
       ORDER BY p.goals DESC, p.yellow_cards ASC
       LIMIT ?`,
      [limit]
    );
    res.json({ scorers: rows });
  } catch (err) {
    next(err);
  }
}

async function getInviteInfo(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT p.*, t.name AS team_name, t.logo_path AS team_logo
       FROM players p JOIN teams t ON t.id = p.team_id
       WHERE p.invite_token = ?`,
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Invalid or expired link' });
    const player = rows[0];
    if (player.token_used && player.first_name) {
      return res.status(409).json({ message: 'This invitation has already been used' });
    }
    res.json({ player });
  } catch (err) {
    next(err);
  }
}

async function submitInviteForm(req, res, next) {
  try {
    const { first_name, last_name, date_of_birth, phone, jersey_number, position, bio } = req.body;
    const [rows] = await db.query(
      'SELECT * FROM players WHERE invite_token = ?',
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Invalid link' });
    const player = rows[0];
    if (player.token_used && player.first_name) {
      return res.status(409).json({ message: 'Already submitted' });
    }
    const photo_path = req.file ? `uploads/players/${req.file.filename}` : null;
    await db.query(
      `UPDATE players SET
         first_name = ?, last_name = ?, date_of_birth = ?, phone = ?,
         jersey_number = ?, position = ?, bio = ?, token_used = TRUE
         ${photo_path ? ', photo_path = ?' : ''}
       WHERE id = ?`,
      photo_path
        ? [first_name, last_name, date_of_birth || null, phone, jersey_number, position, bio || null, photo_path, player.id]
        : [first_name, last_name, date_of_birth || null, phone, jersey_number, position, bio || null, player.id]
    );
    res.json({ message: 'Profile submitted successfully' });
  } catch (err) {
    next(err);
  }
}

async function getPlayerById(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT p.*, t.id AS team_id, t.name AS team_name, t.logo_path AS team_logo
       FROM players p
       JOIN teams t ON t.id = p.team_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Player not found' });
    res.json({ player: rows[0] });
  } catch (err) { next(err); }
}

async function getAllPlayers(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.first_name, p.last_name, p.photo_path, p.jersey_number,
              p.position, p.goals, p.yellow_cards, p.red_cards, p.is_validated,
              p.status, p.bio, p.date_of_birth,
              t.id AS team_id, t.name AS team_name, t.logo_path AS team_logo
       FROM players p
       JOIN teams t ON t.id = p.team_id
       WHERE p.first_name IS NOT NULL
       ORDER BY p.goals DESC, p.first_name ASC`
    );
    res.json({ players: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTopScorers, getInviteInfo, submitInviteForm, getAllPlayers, getPlayerById };
