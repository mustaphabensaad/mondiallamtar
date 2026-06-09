const db = require('../config/db');

async function getDashboard(req, res, next) {
  try {
    const [[{ total_teams }]]    = await db.query('SELECT COUNT(*) AS total_teams FROM teams');
    const [[{ approved_teams }]] = await db.query('SELECT COUNT(*) AS approved_teams FROM teams WHERE status="approved"');
    const [[{ pending_teams }]]  = await db.query('SELECT COUNT(*) AS pending_teams FROM teams WHERE status="pending"');
    const [[{ total_players }]]  = await db.query('SELECT COUNT(*) AS total_players FROM players WHERE first_name IS NOT NULL');
    const [[{ total_matches }]]  = await db.query('SELECT COUNT(*) AS total_matches FROM matches');
    const [[{ live_matches }]]   = await db.query('SELECT COUNT(*) AS live_matches FROM matches WHERE status="live"');
    const [[{ total_goals }]]    = await db.query('SELECT COUNT(*) AS total_goals FROM match_events WHERE event_type IN ("goal","penalty_scored")');
    const [[{ total_cards }]]    = await db.query('SELECT COUNT(*) AS total_cards FROM match_events WHERE event_type IN ("yellow_card","red_card")');
    res.json({ stats: { total_teams, approved_teams, pending_teams, total_players, total_matches, live_matches, total_goals, total_cards } });
  } catch (err) { next(err); }
}

async function getPendingTeams(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email, u.phone AS captain_phone,
              COUNT(p.id) AS player_count
       FROM teams t
       JOIN users u ON u.id = t.captain_id
       LEFT JOIN players p ON p.team_id = t.id AND p.first_name IS NOT NULL
       WHERE t.status = 'pending'
       GROUP BY t.id ORDER BY t.created_at DESC`
    );
    res.json({ teams: rows });
  } catch (err) { next(err); }
}

async function getAllTeams(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email, COUNT(p.id) AS player_count
       FROM teams t
       JOIN users u ON u.id = t.captain_id
       LEFT JOIN players p ON p.team_id = t.id AND p.first_name IS NOT NULL
       GROUP BY t.id ORDER BY t.created_at DESC`
    );
    res.json({ teams: rows });
  } catch (err) { next(err); }
}

async function approveTeam(req, res, next) {
  try {
    await db.query(
      'UPDATE teams SET status="approved", approved_at=NOW(), approved_by=? WHERE id=?',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Team approved' });
  } catch (err) { next(err); }
}

async function rejectTeam(req, res, next) {
  try {
    await db.query('UPDATE teams SET status="rejected" WHERE id=?', [req.params.id]);
    res.json({ message: 'Team rejected' });
  } catch (err) { next(err); }
}

async function getAllPlayers(req, res, next) {
  try {
    const { team_id, status } = req.query;
    let sql = `
      SELECT p.*,
        CASE WHEN p.status='suspended' THEN 'suspended'
             WHEN p.is_validated=1 THEN 'validated'
             WHEN p.first_name IS NOT NULL THEN 'pending'
             ELSE 'invited' END AS validation_status,
        t.name AS team_name, t.group_letter
      FROM players p JOIN teams t ON t.id = p.team_id
      WHERE p.first_name IS NOT NULL
    `;
    const params = [];
    if (team_id) { sql += ' AND p.team_id = ?'; params.push(team_id); }
    if (status)  { sql += ' AND p.status = ?';  params.push(status); }
    sql += ' ORDER BY t.group_letter, t.name, p.jersey_number';
    const [rows] = await db.query(sql, params);
    res.json({ players: rows });
  } catch (err) { next(err); }
}

async function validatePlayer(req, res, next) {
  try {
    await db.query('UPDATE players SET is_validated=TRUE WHERE id=?', [req.params.id]);
    res.json({ message: 'Player validated' });
  } catch (err) { next(err); }
}

async function suspendPlayer(req, res, next) {
  try {
    await db.query('UPDATE players SET status="suspended" WHERE id=?', [req.params.id]);
    res.json({ message: 'Player suspended' });
  } catch (err) { next(err); }
}

async function addFine(req, res, next) {
  try {
    const { player_id, match_id, amount, reason } = req.body;
    if (!player_id || !amount) return res.status(400).json({ message: 'player_id and amount required' });
    await db.query(
      'INSERT INTO fines (player_id, match_id, amount, reason, issued_by) VALUES (?,?,?,?,?)',
      [player_id, match_id || null, amount, reason || null, req.user.id]
    );
    await db.query('UPDATE players SET fines = fines + ? WHERE id = ?', [amount, player_id]);
    res.status(201).json({ message: 'Fine added' });
  } catch (err) { next(err); }
}

async function getTournamentSettings(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM tournament ORDER BY id DESC LIMIT 1');
    res.json({ tournament: rows[0] || null });
  } catch (err) { next(err); }
}

async function updateTournamentSettings(req, res, next) {
  try {
    const [rows] = await db.query('SELECT id FROM tournament ORDER BY id DESC LIMIT 1');
    if (!rows.length) return res.status(404).json({ message: 'No tournament' });

    const { name, name_ar, name_fr, season, max_teams, team_fee, bank_details,
            status, current_phase, terms_fr, terms_ar, terms_en } = req.body;
    await db.query(
      `UPDATE tournament SET
        name=?, name_ar=?, name_fr=?, season=?, max_teams=?, team_fee=?,
        bank_details=?, status=?, current_phase=?, terms_fr=?, terms_ar=?, terms_en=?
       WHERE id=?`,
      [name, name_ar, name_fr, season, max_teams, team_fee, bank_details,
       status, current_phase, terms_fr, terms_ar, terms_en, rows[0].id]
    );
    const [updated] = await db.query('SELECT * FROM tournament WHERE id=?', [rows[0].id]);
    res.json({ tournament: updated[0] });
  } catch (err) { next(err); }
}

async function getReports(req, res, next) {
  try {
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM teams) AS total_teams,
        (SELECT COUNT(*) FROM teams WHERE status='approved') AS approved_teams,
        (SELECT COUNT(*) FROM players WHERE first_name IS NOT NULL) AS total_players,
        (SELECT COUNT(*) FROM matches) AS total_matches,
        (SELECT COUNT(*) FROM match_events WHERE event_type IN ('goal','penalty_scored')) AS total_goals,
        (SELECT COUNT(*) FROM match_events WHERE event_type='yellow_card') AS total_yellow_cards,
        (SELECT COUNT(*) FROM match_events WHERE event_type='red_card') AS total_red_cards,
        (SELECT COUNT(*) FROM teams WHERE payment_status='paid') AS payments_paid
    `);
    const [top_scorers] = await db.query(
      `SELECT p.id, p.first_name, p.last_name, p.goals, p.photo_path, t.name AS team_name
       FROM players p JOIN teams t ON t.id=p.team_id
       WHERE p.goals > 0 ORDER BY p.goals DESC LIMIT 10`
    );
    const [fines] = await db.query(
      `SELECT f.id, CONCAT(p.first_name,' ',p.last_name) AS player_name,
              f.amount, f.reason, f.paid, f.created_at
       FROM fines f JOIN players p ON p.id=f.player_id
       ORDER BY f.created_at DESC LIMIT 20`
    );
    res.json({ ...stats, top_scorers, fines });
  } catch (err) { next(err); }
}

async function confirmPayment(req, res, next) {
  try {
    await db.query("UPDATE teams SET payment_status='paid', payment_date=NOW() WHERE id=?", [req.params.id]);
    res.json({ message: 'Payment confirmed' });
  } catch (err) { next(err); }
}

module.exports = {
  getDashboard, getPendingTeams, getAllTeams,
  approveTeam, rejectTeam,
  getAllPlayers, validatePlayer, suspendPlayer,
  addFine, getTournamentSettings, updateTournamentSettings,
  getReports, confirmPayment,
};
