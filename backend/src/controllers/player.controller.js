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
    const photo_path = req.file ? `/uploads/players/${req.file.filename}` : null;

    // Build SET clause dynamically so missing optional columns don't cause SQL errors
    const setClauses = [
      'first_name = ?', 'last_name = ?', 'date_of_birth = ?', 'phone = ?',
      'jersey_number = ?', 'position = ?', 'token_used = TRUE', 'is_validated = TRUE',
    ];
    const updateParams = [first_name, last_name, date_of_birth || null, phone, jersey_number, position];
    if (photo_path) { setClauses.push('photo_path = ?'); updateParams.push(photo_path); }
    updateParams.push(player.id);

    await db.query(`UPDATE players SET ${setClauses.join(', ')} WHERE id = ?`, updateParams);

    // Bio update is separate: the column may not exist on older installs
    if (bio) {
      try {
        await db.query('UPDATE players SET bio = ? WHERE id = ?', [bio, player.id]);
      } catch (_) { /* bio column not yet added — ignore */ }
    }
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
      `SELECT p.*,
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

async function toggleSuspend(req, res, next) {
  try {
    const playerId = parseInt(req.params.playerId);
    const teamId   = parseInt(req.params.teamId);

    // Verify team ownership
    const [teams] = await db.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (!teams.length) return res.status(404).json({ message: 'Team not found' });
    if (teams[0].captain_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    // Verify player belongs to team
    const [players] = await db.query('SELECT * FROM players WHERE id = ? AND team_id = ?', [playerId, teamId]);
    if (!players.length) return res.status(404).json({ message: 'Player not found in this team' });

    const newStatus = players[0].status === 'suspended' ? 'active' : 'suspended';
    await db.query('UPDATE players SET status = ? WHERE id = ?', [newStatus, playerId]);
    res.json({ message: `Player ${newStatus}`, status: newStatus });
  } catch (err) { next(err); }
}

async function setCaptain(req, res, next) {
  try {
    const teamId   = parseInt(req.params.teamId);
    const playerId = parseInt(req.params.playerId);

    // Verify team ownership (captain or admin)
    const [teams] = await db.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (!teams.length) return res.status(404).json({ message: 'Team not found' });
    if (teams[0].captain_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    // Verify player belongs to team
    const [players] = await db.query(
      'SELECT * FROM players WHERE id = ? AND team_id = ?', [playerId, teamId]
    );
    if (!players.length) return res.status(404).json({ message: 'Player not found in this team' });

    const player = players[0];
    if (!player.first_name) return res.status(400).json({ message: 'Player has not completed their profile yet' });

    // Clear previous captain flag for the team
    await db.query('UPDATE players SET is_captain = FALSE WHERE team_id = ?', [teamId]);
    // Set new captain
    await db.query('UPDATE players SET is_captain = TRUE WHERE id = ?', [playerId]);
    // Sync captain_name on team
    const captainName = `${player.first_name} ${player.last_name}`.trim();
    await db.query('UPDATE teams SET captain_name = ? WHERE id = ?', [captainName, teamId]);

    res.json({ message: 'Captain updated', captain_name: captainName });
  } catch (err) { next(err); }
}

module.exports = { getTopScorers, getInviteInfo, submitInviteForm, getAllPlayers, getPlayerById, setCaptain, toggleSuspend };
