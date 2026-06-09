const db = require('../config/db');

const GROUP_LETTERS  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TEAMS_PER_GROUP = 4;

// ── GET /api/draw ─────────────────────────────────────────────────────────────
const getDrawState = async (req, res) => {
  try {
    const [[tournament]] = await db.query(
      'SELECT * FROM tournament ORDER BY id DESC LIMIT 1'
    );
    if (!tournament) return res.status(404).json({ message: 'No tournament found' });

    const numGroups = tournament.max_teams === '32' ? 8 : 4;

    const [teams] = await db.query(
      `SELECT id, name, logo_path, group_letter, coach_name
       FROM teams WHERE tournament_id = ? AND status = 'approved'
       ORDER BY name`,
      [tournament.id]
    );

    const [groups] = await db.query(
      'SELECT id, letter FROM `groups` WHERE tournament_id = ? ORDER BY letter',
      [tournament.id]
    );

    const groupsWithTeams = groups.map(g => ({
      ...g,
      teams: teams.filter(t => t.group_letter === g.letter),
    }));

    res.json({
      tournament,
      numGroups,
      teamsPerGroup: TEAMS_PER_GROUP,
      initialized: groups.length > 0,
      finalized: tournament.status !== 'registration',
      groups: groupsWithTeams,
      unassigned: teams.filter(t => !t.group_letter),
      totalTeams: teams.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/draw/init ───────────────────────────────────────────────────────
const initDraw = async (req, res) => {
  try {
    const [[tournament]] = await db.query(
      'SELECT * FROM tournament ORDER BY id DESC LIMIT 1'
    );
    if (!tournament) return res.status(404).json({ message: 'No tournament found' });

    const [existing] = await db.query(
      'SELECT id FROM `groups` WHERE tournament_id = ?',
      [tournament.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Draw already initialized. Reset first.' });
    }

    const numGroups = tournament.max_teams === '32' ? 8 : 4;
    for (const letter of GROUP_LETTERS.slice(0, numGroups)) {
      await db.query(
        'INSERT INTO `groups` (tournament_id, letter) VALUES (?, ?)',
        [tournament.id, letter]
      );
    }

    const [groups] = await db.query(
      'SELECT id, letter FROM `groups` WHERE tournament_id = ? ORDER BY letter',
      [tournament.id]
    );

    req.app.get('io').emit('draw:init', { groups });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/draw/assign ──────────────────────────────────────────────────────
const assignTeam = async (req, res) => {
  try {
    const { teamId, groupLetter } = req.body; // groupLetter = null → unassign

    const [[team]] = await db.query(
      `SELECT id, name, logo_path, tournament_id
       FROM teams WHERE id = ? AND status = 'approved'`,
      [teamId]
    );
    if (!team) return res.status(404).json({ message: 'Team not found or not approved' });

    if (groupLetter) {
      const [[{ count }]] = await db.query(
        `SELECT COUNT(*) as count FROM teams
         WHERE tournament_id = ? AND group_letter = ? AND status = 'approved' AND id != ?`,
        [team.tournament_id, groupLetter, teamId]
      );
      if (count >= TEAMS_PER_GROUP) {
        return res.status(400).json({ message: `Group ${groupLetter} is full` });
      }
    }

    await db.query('UPDATE teams SET group_letter = ? WHERE id = ?', [groupLetter || null, teamId]);

    req.app.get('io').emit('draw:assign', {
      teamId,
      groupLetter: groupLetter || null,
      team: { id: team.id, name: team.name, logo_path: team.logo_path },
    });

    res.json({ success: true, teamId, groupLetter: groupLetter || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/draw/finalize ───────────────────────────────────────────────────
const finalizeDraw = async (req, res) => {
  try {
    const [[tournament]] = await db.query(
      'SELECT * FROM tournament ORDER BY id DESC LIMIT 1'
    );
    if (!tournament) return res.status(404).json({ message: 'No tournament found' });

    // All approved teams must be assigned
    const [[{ unassigned }]] = await db.query(
      `SELECT COUNT(*) as unassigned FROM teams
       WHERE tournament_id = ? AND status = 'approved' AND group_letter IS NULL`,
      [tournament.id]
    );
    if (unassigned > 0) {
      return res.status(400).json({ message: `${unassigned} approved team(s) still unassigned` });
    }

    const [groups] = await db.query(
      'SELECT id, letter FROM `groups` WHERE tournament_id = ? ORDER BY letter',
      [tournament.id]
    );

    // Clear any previous group matches & standings
    await db.query(`DELETE FROM matches WHERE tournament_id = ? AND phase = 'group'`, [tournament.id]);
    await db.query(
      `DELETE gs FROM group_standings gs
       JOIN \`groups\` g ON gs.group_id = g.id
       WHERE g.tournament_id = ?`,
      [tournament.id]
    );

    let matchNumber = 1;
    let matchCount  = 0;

    for (const group of groups) {
      const [teamRows] = await db.query(
        `SELECT id FROM teams
         WHERE tournament_id = ? AND group_letter = ? AND status = 'approved'
         ORDER BY name`,
        [tournament.id, group.letter]
      );
      const teamIds = teamRows.map(r => r.id);

      // group_standings rows
      for (const teamId of teamIds) {
        await db.query(
          'INSERT IGNORE INTO group_standings (group_id, team_id) VALUES (?, ?)',
          [group.id, teamId]
        );
      }

      // Round-robin: all pairs (time + referee set later by admin)
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          await db.query(
            `INSERT INTO matches
               (tournament_id, phase, group_id, match_number, home_team_id, away_team_id, status)
             VALUES (?, 'group', ?, ?, ?, ?, 'scheduled')`,
            [tournament.id, group.id, matchNumber++, teamIds[i], teamIds[j]]
          );
          matchCount++;
        }
      }
    }

    await db.query(`UPDATE tournament SET status = 'group_stage' WHERE id = ?`, [tournament.id]);

    req.app.get('io').emit('draw:finalized', { matchCount });
    res.json({ success: true, matchCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/draw/reset ──────────────────────────────────────────────────────
const resetDraw = async (req, res) => {
  try {
    const [[tournament]] = await db.query(
      'SELECT * FROM tournament ORDER BY id DESC LIMIT 1'
    );
    if (!tournament) return res.status(404).json({ message: 'No tournament found' });

    await db.query(`UPDATE teams SET group_letter = NULL WHERE tournament_id = ?`, [tournament.id]);
    await db.query(`DELETE FROM matches WHERE tournament_id = ? AND phase = 'group'`, [tournament.id]);
    await db.query(
      `DELETE gs FROM group_standings gs
       JOIN \`groups\` g ON gs.group_id = g.id
       WHERE g.tournament_id = ?`,
      [tournament.id]
    );
    await db.query(`DELETE FROM \`groups\` WHERE tournament_id = ?`, [tournament.id]);
    await db.query(`UPDATE tournament SET status = 'registration' WHERE id = ?`, [tournament.id]);

    req.app.get('io').emit('draw:reset', {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDrawState, initDraw, assignTeam, finalizeDraw, resetDraw };
