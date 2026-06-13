const Joi    = require('joi');
const db     = require('../config/db');
const { generateInviteToken, buildInviteLink } = require('../utils/helpers');

// ─── Validation ───────────────────────────────────────────────────────────────
const createSchema = Joi.object({
  name:          Joi.string().min(2).max(100).required(),
  coach_name:    Joi.string().allow('').optional(),
  coach_phone:   Joi.string().allow('').optional(),
  captain_name:  Joi.string().min(2).max(100).required(),
  logo_path:     Joi.string().allow('').optional(),
});

// ─── Public ───────────────────────────────────────────────────────────────────
async function getTeams(req, res, next) {
  try {
    const { status, group } = req.query;
    let sql = `
      SELECT t.*, u.email AS captain_email, u.phone AS captain_phone,
             COUNT(p.id) AS player_count
      FROM teams t
      JOIN users u ON u.id = t.captain_id
      LEFT JOIN players p ON p.team_id = t.id AND p.first_name IS NOT NULL
    `;
    const params = [], where = [];
    if (status) { where.push('t.status = ?'); params.push(status); }
    if (group)  { where.push('t.group_letter = ?'); params.push(group); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' GROUP BY t.id ORDER BY t.group_letter, t.name';
    const [rows] = await db.query(sql, params);
    res.json({ teams: rows });
  } catch (err) { next(err); }
}

async function getTeam(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email, u.phone AS captain_phone
       FROM teams t JOIN users u ON u.id = t.captain_id WHERE t.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Team not found' });
    res.json({ team: rows[0] });
  } catch (err) { next(err); }
}

async function getTeamPlayers(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT *,
        CASE WHEN status='suspended' THEN 'suspended'
             WHEN is_validated=1 THEN 'validated'
             WHEN first_name IS NOT NULL THEN 'pending'
             ELSE 'invited' END AS validation_status
       FROM players WHERE team_id = ? ORDER BY jersey_number`,
      [req.params.id]
    );
    res.json({ players: rows });
  } catch (err) { next(err); }
}

async function getMyTeam(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.email AS captain_email
       FROM teams t JOIN users u ON u.id = t.captain_id
       WHERE t.captain_id = ? ORDER BY t.id DESC LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.json({ team: null, players: [] });
    const team = rows[0];
    const [players] = await db.query(
      `SELECT *,
        CASE WHEN status='suspended' THEN 'suspended'
             WHEN is_validated=1 THEN 'validated'
             WHEN first_name IS NOT NULL THEN 'pending'
             ELSE 'invited' END AS validation_status
       FROM players WHERE team_id = ? ORDER BY jersey_number`,
      [team.id]
    );
    res.json({ team, players });
  } catch (err) { next(err); }
}

// ─── Captain ──────────────────────────────────────────────────────────────────
async function createTeam(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Get active tournament
    const [tours] = await db.query('SELECT id FROM tournament ORDER BY id DESC LIMIT 1');
    if (!tours.length) return res.status(400).json({ message: 'No active tournament' });
    const tournamentId = tours[0].id;

    // Captain can only have one team
    const [existing] = await db.query(
      'SELECT id FROM teams WHERE captain_id = ? AND tournament_id = ?',
      [req.user.id, tournamentId]
    );
    if (existing.length) return res.status(409).json({ message: 'You already have a team registered' });

    const logo_path = req.file ? `/uploads/logos/${req.file.filename}` : (value.logo_path || null);
    const [result] = await db.query(
      `INSERT INTO teams (tournament_id, captain_id, name, coach_name, coach_phone, captain_name, logo_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [tournamentId, req.user.id, value.name, value.coach_name || null,
       value.coach_phone || null, value.captain_name, logo_path]
    );
    const [team] = await db.query('SELECT * FROM teams WHERE id = ?', [result.insertId]);
    res.status(201).json({ team: team[0] });
  } catch (err) { next(err); }
}

async function updateTeam(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Team not found' });
    if (rows[0].captain_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const { name, coach_name, coach_phone, captain_name } = req.body;
    const logo_path = req.file ? `/uploads/logos/${req.file.filename}` : (req.body.logo_path ?? rows[0].logo_path);
    await db.query(
      'UPDATE teams SET name=?, coach_name=?, coach_phone=?, captain_name=?, logo_path=? WHERE id=?',
      [name || rows[0].name, coach_name ?? rows[0].coach_name,
       coach_phone ?? rows[0].coach_phone, captain_name ?? rows[0].captain_name,
       logo_path, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    res.json({ team: updated[0] });
  } catch (err) { next(err); }
}

async function generateInvites(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const count  = parseInt(req.body.count) || 13;

    const [rows] = await db.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (!rows.length) return res.status(404).json({ message: 'Team not found' });
    if (rows[0].captain_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    // Count existing unused slots
    const [existing] = await db.query(
      'SELECT id FROM players WHERE team_id = ? AND token_used = FALSE',
      [teamId]
    );

    // Only create up to (count - existing) new slots
    const needed = Math.max(0, count - existing.length);
    const links  = [];

    // Return existing unused tokens too
    const [unused] = await db.query(
      'SELECT invite_token FROM players WHERE team_id = ? AND token_used = FALSE',
      [teamId]
    );
    unused.forEach(p => links.push(buildInviteLink(p.invite_token)));

    for (let i = 0; i < needed; i++) {
      const token = generateInviteToken();
      await db.query(
        'INSERT INTO players (team_id, invite_token) VALUES (?, ?)',
        [teamId, token]
      );
      links.push(buildInviteLink(token));
    }

    res.json({ links });
  } catch (err) { next(err); }
}

async function getInviteLinks(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const [rows] = await db.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (!rows.length) return res.status(404).json({ message: 'Team not found' });
    if (rows[0].captain_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const [players] = await db.query(
      `SELECT p.id, p.invite_token, p.token_used, p.first_name, p.last_name,
              p.jersey_number, p.position, p.is_validated, p.photo_path,
              CASE WHEN p.status='suspended' THEN 'suspended'
                   WHEN p.is_validated=1 THEN 'validated'
                   WHEN p.first_name IS NOT NULL THEN 'pending'
                   ELSE 'invited' END AS validation_status
       FROM players p WHERE p.team_id = ? ORDER BY p.id`,
      [teamId]
    );
    const playersWithLinks = players.map(p => ({
      ...p,
      invite_link: buildInviteLink(p.invite_token),
    }));
    res.json({ players: playersWithLinks });
  } catch (err) { next(err); }
}

module.exports = {
  getTeams, getTeam, getTeamPlayers, getMyTeam,
  createTeam, updateTeam, generateInvites, getInviteLinks,
};
