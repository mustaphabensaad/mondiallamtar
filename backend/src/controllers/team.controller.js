const db = require('../config/db');

async function getTeams(req, res, next) {
  try {
    const { status, group } = req.query;
    let sql = `
      SELECT t.*, u.email AS captain_email, u.phone AS captain_phone,
             COUNT(p.id) AS player_count
      FROM teams t
      JOIN users u ON u.id = t.captain_id
      LEFT JOIN players p ON p.team_id = t.id
    `;
    const params = [];
    const where  = [];
    if (status) { where.push('t.status = ?'); params.push(status); }
    if (group)  { where.push('t.group_letter = ?'); params.push(group); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' GROUP BY t.id ORDER BY t.group_letter, t.name';
    const [rows] = await db.query(sql, params);
    res.json({ teams: rows });
  } catch (err) {
    next(err);
  }
}

async function getTeam(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email, u.phone AS captain_phone
       FROM teams t JOIN users u ON u.id = t.captain_id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Team not found' });
    res.json({ team: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getTeamPlayers(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM players WHERE team_id = ? ORDER BY jersey_number`,
      [req.params.id]
    );
    res.json({ players: rows });
  } catch (err) {
    next(err);
  }
}

async function getMyTeam(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email
       FROM teams t JOIN users u ON u.id = t.captain_id
       WHERE t.captain_id = ?
       ORDER BY t.id DESC LIMIT 1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.json({ team: null });
    const team = rows[0];
    const [players] = await db.query(
      'SELECT * FROM players WHERE team_id = ? ORDER BY jersey_number',
      [team.id]
    );
    res.json({ team, players });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTeams, getTeam, getTeamPlayers, getMyTeam };
