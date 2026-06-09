const db = require('../config/db');

const MATCH_SELECT = `
  SELECT m.*,
    ht.name AS home_team_name, ht.logo_path AS home_team_logo,
    at.name AS away_team_name, at.logo_path AS away_team_logo
  FROM matches m
  LEFT JOIN teams ht ON ht.id = m.home_team_id
  LEFT JOIN teams at ON at.id = m.away_team_id
`;

async function getBracket(req, res, next) {
  try {
    const [rows] = await db.query(
      MATCH_SELECT + " WHERE m.phase != 'group' ORDER BY m.phase, m.match_number"
    );
    const phases = {};
    for (const m of rows) {
      if (!phases[m.phase]) phases[m.phase] = [];
      phases[m.phase].push(m);
    }
    res.json({ bracket: phases });
  } catch (err) { next(err); }
}

async function generateKnockout(req, res, next) {
  try {
    // Get tournament
    const [tours] = await db.query('SELECT * FROM tournament ORDER BY id DESC LIMIT 1');
    if (!tours.length) return res.status(400).json({ message: 'No tournament' });
    const tournamentId = tours[0].id;

    // Get group standings sorted
    const [standings] = await db.query(
      `SELECT gs.*, g.letter
       FROM group_standings gs
       JOIN \`groups\` g ON g.id = gs.group_id
       ORDER BY g.letter, gs.points DESC, gs.goal_diff DESC, gs.goals_for DESC`
    );

    // Group by letter
    const byGroup = {};
    for (const row of standings) {
      if (!byGroup[row.letter]) byGroup[row.letter] = [];
      byGroup[row.letter].push(row);
    }

    const letters    = Object.keys(byGroup).sort();
    const groupCount = letters.length;
    const phase      = groupCount <= 4 ? 'quarter_final' : 'round_of_16';

    // Delete existing knockout matches
    await db.query("DELETE FROM matches WHERE tournament_id=? AND phase != 'group'", [tournamentId]);

    const created = [];
    for (let i = 0; i < letters.length; i += 2) {
      const groupA = byGroup[letters[i]];
      const groupB = byGroup[letters[i + 1]];
      if (!groupA || !groupB) continue;
      const winner1  = groupA[0]?.team_id;
      const runner1  = groupA[1]?.team_id;
      const winner2  = groupB[0]?.team_id;
      const runner2  = groupB[1]?.team_id;

      // 1st of A vs 2nd of B
      const [m1] = await db.query(
        `INSERT INTO matches (tournament_id, phase, match_number, home_team_id, away_team_id, status)
         VALUES (?, ?, ?, ?, ?, 'scheduled')`,
        [tournamentId, phase, created.length + 1, winner1, runner2]
      );
      // 1st of B vs 2nd of A
      const [m2] = await db.query(
        `INSERT INTO matches (tournament_id, phase, match_number, home_team_id, away_team_id, status)
         VALUES (?, ?, ?, ?, ?, 'scheduled')`,
        [tournamentId, phase, created.length + 2, winner2, runner1]
      );
      created.push(m1.insertId, m2.insertId);
    }

    // Update tournament status
    await db.query(
      "UPDATE tournament SET status='knockout', current_phase=? WHERE id=?",
      [phase, tournamentId]
    );

    res.json({ message: `Generated ${created.length} knockout matches`, phase });
  } catch (err) { next(err); }
}

module.exports = { getBracket, generateKnockout };
