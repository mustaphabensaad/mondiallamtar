const db = require('../config/db');

async function getGroups(req, res, next) {
  try {
    const [groups] = await db.query(
      `SELECT g.id, g.letter,
              gs.team_id, gs.played, gs.won, gs.drawn, gs.lost,
              gs.goals_for, gs.goals_against, gs.goal_diff, gs.points,
              t.name AS team_name, t.logo_path AS team_logo
       FROM \`groups\` g
       JOIN group_standings gs ON gs.group_id = g.id
       JOIN teams t ON t.id = gs.team_id
       ORDER BY g.letter, gs.points DESC, gs.goal_diff DESC, gs.goals_for DESC`
    );

    // Group by letter
    const result = {};
    for (const row of groups) {
      if (!result[row.letter]) result[row.letter] = { id: row.id, letter: row.letter, teams: [] };
      result[row.letter].teams.push(row);
    }

    res.json({ groups: Object.values(result) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGroups };
