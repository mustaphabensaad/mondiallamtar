const db = require('../config/db');
const { sortStandings } = require('../utils/standings.utils');

// ── GET /api/groups ────────────────────────────────────────────────────────────
async function getGroups(req, res, next) {
  try {
    // 1. Standings
    const [rows] = await db.query(`
      SELECT g.id AS group_id, g.letter,
             gs.team_id, gs.played, gs.won, gs.drawn, gs.lost,
             gs.goals_for, gs.goals_against, gs.goal_diff, gs.points,
             t.name AS team_name, t.logo_path AS team_logo
      FROM \`groups\` g
      JOIN group_standings gs ON gs.group_id = g.id
      JOIN teams t ON t.id = gs.team_id
      ORDER BY g.letter
    `);

    // 2. All finished group matches (for H2H)
    const [matches] = await db.query(`
      SELECT id, group_id, home_team_id, away_team_id,
             home_score, away_score, status
      FROM matches
      WHERE phase = 'group' AND status = 'finished'
    `);

    // 3. Fair play per team (yellow=1, red=3)
    const [cards] = await db.query(`
      SELECT me.team_id,
             SUM(IF(me.event_type = 'yellow_card', 1, 0)) AS yellows,
             SUM(IF(me.event_type = 'red_card',    3, 0)) AS reds
      FROM match_events me
      JOIN matches m ON m.id = me.match_id
      WHERE m.phase = 'group'
      GROUP BY me.team_id
    `);

    const fairPlayMap = {};
    for (const c of cards) {
      fairPlayMap[c.team_id] = (Number(c.yellows) || 0) + (Number(c.reds) || 0);
    }

    // 4. Group by letter, apply tiebreakers
    const byLetter = {};
    for (const row of rows) {
      if (!byLetter[row.letter]) {
        byLetter[row.letter] = { id: row.group_id, letter: row.letter, teams: [] };
      }
      byLetter[row.letter].teams.push({
        ...row,
        fair_play_points: fairPlayMap[row.team_id] ?? 0,
      });
    }

    for (const letter of Object.keys(byLetter)) {
      const groupMatches = matches.filter(m => m.group_id === byLetter[letter].id);
      byLetter[letter].teams = sortStandings(
        byLetter[letter].teams,
        groupMatches,
        fairPlayMap
      );
    }

    res.json({ groups: Object.values(byLetter) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/groups/generate-schedules
 *
 * Generates the round-robin fixture list for every group using the
 * official fair-rotation format (4 teams per group):
 *
 *   Round 1 : 1 vs 3  |  2 vs 4
 *   Round 2 : 1 vs 4  |  2 vs 3
 *   Round 3 : 1 vs 2  |  3 vs 4
 *
 * Existing *scheduled* group matches for each group are replaced.
 * Already live/finished matches are left untouched.
 */
async function generateGroupSchedules(req, res, next) {
  try {
    const [tours] = await db.query(
      'SELECT id FROM tournament ORDER BY id DESC LIMIT 1'
    );
    if (!tours.length) return res.status(400).json({ message: 'No tournament found' });
    const tournamentId = tours[0].id;

    const [groups] = await db.query(
      'SELECT id, letter FROM `groups` WHERE tournament_id = ? ORDER BY letter',
      [tournamentId]
    );
    if (!groups.length) return res.status(400).json({ message: 'No groups found' });

    // Pairing indices (0-based) per round
    const ROUNDS = [
      [[0, 2], [1, 3]],  // Round 1: 1v3, 2v4
      [[0, 3], [1, 2]],  // Round 2: 1v4, 2v3
      [[0, 1], [2, 3]],  // Round 3: 1v2, 3v4
    ];

    let created = 0;
    const skipped = [];

    for (const group of groups) {
      const [teamRows] = await db.query(
        'SELECT team_id FROM group_standings WHERE group_id = ? ORDER BY team_id ASC',
        [group.id]
      );

      if (teamRows.length !== 4) {
        skipped.push(`Group ${group.letter} (${teamRows.length} teams)`);
        continue;
      }

      const teams = teamRows.map(r => r.team_id);

      // Only delete still-scheduled matches (don't touch live/finished)
      await db.query(
        "DELETE FROM matches WHERE group_id = ? AND phase = 'group' AND status = 'scheduled'",
        [group.id]
      );

      for (let roundIdx = 0; roundIdx < ROUNDS.length; roundIdx++) {
        for (const [iA, iB] of ROUNDS[roundIdx]) {
          await db.query(
            `INSERT INTO matches
               (tournament_id, phase, group_id, home_team_id, away_team_id, status)
             VALUES (?, 'group', ?, ?, ?, 'scheduled')`,
            [tournamentId, group.id, teams[iA], teams[iB]]
          );
          created++;
        }
      }
    }

    res.json({
      message: `${created} group matches generated`,
      created,
      ...(skipped.length ? { skipped } : {}),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGroups, generateGroupSchedules };
