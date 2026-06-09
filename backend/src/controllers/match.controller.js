const db = require('../config/db');
const { broadcastMatchUpdate, broadcastGoal, broadcastCard,
        broadcastMatchStart, broadcastMatchEnd } = require('../services/socket.service');

const MATCH_SELECT = `
  SELECT m.*,
    ht.name AS home_team_name, ht.logo_path AS home_team_logo,
    at.name AS away_team_name, at.logo_path AS away_team_logo,
    r.name  AS referee_name,
    CONCAT(mp.first_name,' ',mp.last_name) AS motm_name,
    mp.photo_path AS motm_photo, mp.team_id AS motm_team_id
  FROM matches m
  LEFT JOIN teams   ht ON ht.id = m.home_team_id
  LEFT JOIN teams   at ON at.id = m.away_team_id
  LEFT JOIN referees r ON r.id  = m.referee_id
  LEFT JOIN players mp ON mp.id = m.man_of_match_id
`;

// ─── Public ───────────────────────────────────────────────────────────────────
async function getMatches(req, res, next) {
  try {
    const { status, phase, limit } = req.query;
    let sql = MATCH_SELECT, params = [], where = [];
    if (status) { where.push('m.status = ?'); params.push(status); }
    if (phase)  { where.push('m.phase = ?');  params.push(phase); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY m.scheduled_at DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
    const [rows] = await db.query(sql, params);
    res.json({ matches: rows });
  } catch (err) { next(err); }
}

async function getTodayMatches(req, res, next) {
  try {
    const [rows] = await db.query(
      MATCH_SELECT + ' WHERE DATE(m.scheduled_at) = CURDATE() ORDER BY m.scheduled_at ASC'
    );
    res.json({ matches: rows });
  } catch (err) { next(err); }
}

async function getLiveMatches(req, res, next) {
  try {
    const [rows] = await db.query(
      MATCH_SELECT + " WHERE m.status = 'live' ORDER BY m.started_at DESC"
    );
    res.json({ matches: rows });
  } catch (err) { next(err); }
}

async function getMatch(req, res, next) {
  try {
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Match not found' });
    const [events] = await db.query(
      `SELECT me.*, CONCAT(p.first_name,' ',p.last_name) AS player_name,
              p.photo_path AS player_photo, p.jersey_number, t.name AS team_name
       FROM match_events me
       JOIN players p ON p.id = me.player_id
       JOIN teams   t ON t.id = me.team_id
       WHERE me.match_id = ? ORDER BY me.minute ASC, me.id ASC`,
      [req.params.id]
    );
    res.json({ match: rows[0], events });
  } catch (err) { next(err); }
}

// ─── Admin ────────────────────────────────────────────────────────────────────
async function createMatch(req, res, next) {
  try {
    const { home_team_id, away_team_id, scheduled_at, venue, referee_id, phase, group_id } = req.body;
    const [tours] = await db.query('SELECT id FROM tournament ORDER BY id DESC LIMIT 1');
    const [result] = await db.query(
      `INSERT INTO matches (tournament_id, phase, group_id, home_team_id, away_team_id,
        referee_id, venue, scheduled_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [tours[0].id, phase || 'group', group_id || null,
       home_team_id, away_team_id, referee_id || null, venue || null, scheduled_at]
    );
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [result.insertId]);
    res.status(201).json({ match: rows[0] });
  } catch (err) { next(err); }
}

async function updateMatch(req, res, next) {
  try {
    const { scheduled_at, venue, referee_id } = req.body;
    await db.query(
      'UPDATE matches SET scheduled_at=?, venue=?, referee_id=? WHERE id=?',
      [scheduled_at, venue, referee_id || null, req.params.id]
    );
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    res.json({ match: rows[0] });
  } catch (err) { next(err); }
}

async function startMatch(req, res, next) {
  try {
    await db.query(
      "UPDATE matches SET status='live', started_at=NOW() WHERE id=?",
      [req.params.id]
    );
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    const io = req.app.get('io');
    broadcastMatchStart(io, req.params.id);
    broadcastMatchUpdate(io, req.params.id, { type: 'start', match: rows[0] });
    res.json({ match: rows[0] });
  } catch (err) { next(err); }
}

async function endMatch(req, res, next) {
  try {
    const { winner_id, man_of_match_id } = req.body;
    const [current] = await db.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
    if (!current.length) return res.status(404).json({ message: 'Match not found' });

    const match = current[0];
    // Auto-determine winner from score if not provided
    let winnerId = winner_id || null;
    if (!winnerId) {
      if (match.home_score > match.away_score) winnerId = match.home_team_id;
      else if (match.away_score > match.home_score) winnerId = match.away_team_id;
    }

    await db.query(
      "UPDATE matches SET status='finished', ended_at=NOW(), winner_id=?, man_of_match_id=? WHERE id=?",
      [winnerId, man_of_match_id || null, req.params.id]
    );

    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    const io = req.app.get('io');
    broadcastMatchEnd(io, req.params.id, { home: rows[0].home_score, away: rows[0].away_score });
    broadcastMatchUpdate(io, req.params.id, { type: 'end', match: rows[0] });
    res.json({ match: rows[0] });
  } catch (err) { next(err); }
}

async function addEvent(req, res, next) {
  try {
    const { player_id, team_id, event_type, minute, extra_time, description } = req.body;
    if (!player_id || !team_id || !event_type)
      return res.status(400).json({ message: 'player_id, team_id, event_type required' });

    const [result] = await db.query(
      `INSERT INTO match_events (match_id, player_id, team_id, event_type, minute, extra_time, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, player_id, team_id, event_type,
       minute || 0, extra_time || false, description || null]
    );

    // Update score for goals
    if (event_type === 'goal' || event_type === 'penalty_scored') {
      const [match] = await db.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
      if (match.length) {
        const col = parseInt(team_id) === parseInt(match[0].home_team_id) ? 'home_score' : 'away_score';
        await db.query(`UPDATE matches SET ${col} = ${col} + 1 WHERE id = ?`, [req.params.id]);
      }
    }
    if (event_type === 'own_goal') {
      const [match] = await db.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
      if (match.length) {
        const col = parseInt(team_id) === parseInt(match[0].home_team_id) ? 'away_score' : 'home_score';
        await db.query(`UPDATE matches SET ${col} = ${col} + 1 WHERE id = ?`, [req.params.id]);
      }
    }

    const [rows]  = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    const [event] = await db.query(
      `SELECT me.*, CONCAT(p.first_name,' ',p.last_name) AS player_name,
              p.jersey_number, t.name AS team_name
       FROM match_events me JOIN players p ON p.id=me.player_id JOIN teams t ON t.id=me.team_id
       WHERE me.id = ?`, [result.insertId]
    );

    const io = req.app.get('io');
    if (event_type === 'goal' || event_type === 'penalty_scored' || event_type === 'own_goal') {
      broadcastGoal(io, req.params.id, { event: event[0], match: rows[0] });
    } else if (event_type === 'yellow_card' || event_type === 'red_card') {
      broadcastCard(io, req.params.id, { event: event[0], match: rows[0] });
    }
    broadcastMatchUpdate(io, req.params.id, { type: 'event', event: event[0], match: rows[0] });

    res.status(201).json({ event: event[0], match: rows[0] });
  } catch (err) { next(err); }
}

async function deleteEvent(req, res, next) {
  try {
    const [evRows] = await db.query('SELECT * FROM match_events WHERE id = ?', [req.params.eventId]);
    if (!evRows.length) return res.status(404).json({ message: 'Event not found' });
    const ev = evRows[0];

    await db.query('DELETE FROM match_events WHERE id = ?', [ev.id]);

    // Reverse score for goals (trigger handles player stats on insert but not on delete)
    if (ev.event_type === 'goal' || ev.event_type === 'penalty_scored') {
      const [match] = await db.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
      if (match.length) {
        const col = parseInt(ev.team_id) === parseInt(match[0].home_team_id) ? 'home_score' : 'away_score';
        await db.query(`UPDATE matches SET ${col} = GREATEST(0, ${col} - 1) WHERE id = ?`, [req.params.id]);
        await db.query('UPDATE players SET goals = GREATEST(0, goals - 1) WHERE id = ?', [ev.player_id]);
      }
    }
    if (ev.event_type === 'own_goal') {
      const [match] = await db.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
      if (match.length) {
        const col = parseInt(ev.team_id) === parseInt(match[0].home_team_id) ? 'away_score' : 'home_score';
        await db.query(`UPDATE matches SET ${col} = GREATEST(0, ${col} - 1) WHERE id = ?`, [req.params.id]);
      }
    }
    if (ev.event_type === 'yellow_card')
      await db.query('UPDATE players SET yellow_cards = GREATEST(0, yellow_cards - 1) WHERE id = ?', [ev.player_id]);
    if (ev.event_type === 'red_card')
      await db.query('UPDATE players SET red_cards = GREATEST(0, red_cards - 1) WHERE id = ?', [ev.player_id]);

    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    const io = req.app.get('io');
    broadcastMatchUpdate(io, req.params.id, { type: 'event_deleted', eventId: ev.id, match: rows[0] });
    res.json({ message: 'Event deleted', match: rows[0] });
  } catch (err) { next(err); }
}

async function updateScore(req, res, next) {
  try {
    const { home_score, away_score } = req.body;
    await db.query(
      'UPDATE matches SET home_score=?, away_score=? WHERE id=?',
      [home_score, away_score, req.params.id]
    );
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    const io = req.app.get('io');
    broadcastMatchUpdate(io, req.params.id, { type: 'score', match: rows[0] });
    res.json({ match: rows[0] });
  } catch (err) { next(err); }
}

async function setMotm(req, res, next) {
  try {
    await db.query('UPDATE matches SET man_of_match_id=? WHERE id=?',
      [req.body.player_id, req.params.id]);
    const [rows] = await db.query(MATCH_SELECT + ' WHERE m.id = ?', [req.params.id]);
    res.json({ match: rows[0] });
  } catch (err) { next(err); }
}

module.exports = {
  getMatches, getTodayMatches, getLiveMatches, getMatch,
  createMatch, updateMatch, startMatch, endMatch,
  addEvent, deleteEvent, updateScore, setMotm,
};
