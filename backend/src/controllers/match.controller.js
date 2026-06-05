const db = require('../config/db');

const MATCH_SELECT = `
  SELECT m.*,
    ht.name AS home_team_name, ht.logo_path AS home_team_logo,
    at.name AS away_team_name, at.logo_path AS away_team_logo,
    r.name  AS referee_name,
    CONCAT(mp.first_name, ' ', mp.last_name) AS motm_name,
    mp.photo_path AS motm_photo, mp.team_id AS motm_team_id
  FROM matches m
  LEFT JOIN teams   ht ON ht.id = m.home_team_id
  LEFT JOIN teams   at ON at.id = m.away_team_id
  LEFT JOIN referees r ON r.id  = m.referee_id
  LEFT JOIN players mp ON mp.id = m.man_of_match_id
`;

async function getMatches(req, res, next) {
  try {
    const { status, phase, limit } = req.query;
    let sql = MATCH_SELECT;
    const params = [];
    const where  = [];
    if (status) { where.push('m.status = ?'); params.push(status); }
    if (phase)  { where.push('m.phase = ?');  params.push(phase); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY m.scheduled_at DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
    const [rows] = await db.query(sql, params);
    res.json({ matches: rows });
  } catch (err) {
    next(err);
  }
}

async function getTodayMatches(req, res, next) {
  try {
    const [rows] = await db.query(
      MATCH_SELECT + `
      WHERE DATE(m.scheduled_at) = CURDATE()
      ORDER BY m.scheduled_at ASC`
    );
    res.json({ matches: rows });
  } catch (err) {
    next(err);
  }
}

async function getLiveMatches(req, res, next) {
  try {
    const [rows] = await db.query(
      MATCH_SELECT + ` WHERE m.status = 'live' ORDER BY m.started_at DESC`
    );
    res.json({ matches: rows });
  } catch (err) {
    next(err);
  }
}

async function getMatch(req, res, next) {
  try {
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Match not found' });
    const match = rows[0];

    const [events] = await db.query(
      `SELECT me.*, CONCAT(p.first_name, ' ', p.last_name) AS player_name,
              p.photo_path AS player_photo, p.jersey_number
       FROM match_events me
       JOIN players p ON p.id = me.player_id
       WHERE me.match_id = ?
       ORDER BY me.minute ASC`,
      [req.params.id]
    );
    res.json({ match, events });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMatches, getTodayMatches, getLiveMatches, getMatch };
