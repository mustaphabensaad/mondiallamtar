const db = require('../config/db');

async function getDashboard(req, res, next) {
  try {
    const [[{ total_teams }]]    = await db.query('SELECT COUNT(*) AS total_teams FROM teams');
    const [[{ approved_teams }]] = await db.query('SELECT COUNT(*) AS approved_teams FROM teams WHERE status = "approved"');
    const [[{ pending_teams }]]  = await db.query('SELECT COUNT(*) AS pending_teams FROM teams WHERE status = "pending"');
    const [[{ total_players }]]  = await db.query('SELECT COUNT(*) AS total_players FROM players WHERE first_name IS NOT NULL');
    const [[{ total_matches }]]  = await db.query('SELECT COUNT(*) AS total_matches FROM matches');
    const [[{ live_matches }]]   = await db.query('SELECT COUNT(*) AS live_matches FROM matches WHERE status = "live"');
    const [[{ total_goals }]]    = await db.query('SELECT COUNT(*) AS total_goals FROM match_events WHERE event_type = "goal"');

    res.json({
      stats: {
        total_teams, approved_teams, pending_teams,
        total_players, total_matches, live_matches, total_goals,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getPendingTeams(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email, u.phone AS captain_phone,
              COUNT(p.id) AS player_count
       FROM teams t
       JOIN users u ON u.id = t.captain_id
       LEFT JOIN players p ON p.team_id = t.id
       WHERE t.status = 'pending'
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );
    res.json({ teams: rows });
  } catch (err) {
    next(err);
  }
}

async function approveTeam(req, res, next) {
  try {
    await db.query(
      `UPDATE teams SET status = 'approved', approved_at = NOW(), approved_by = ? WHERE id = ?`,
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Team approved' });
  } catch (err) {
    next(err);
  }
}

async function rejectTeam(req, res, next) {
  try {
    await db.query(`UPDATE teams SET status = 'rejected' WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Team rejected' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getPendingTeams, approveTeam, rejectTeam };
