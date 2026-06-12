const db = require('../config/db');
const { sortStandings, selectBestThird } = require('../utils/standings.utils');

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
    const [tours] = await db.query('SELECT * FROM tournament ORDER BY id DESC LIMIT 1');
    if (!tours.length) return res.status(400).json({ message: 'No tournament' });
    const tournamentId = tours[0].id;

    // ── 1. Fetch standings ─────────────────────────────────────────────────────
    const [rows] = await db.query(`
      SELECT gs.team_id, gs.played, gs.won, gs.drawn, gs.lost,
             gs.goals_for, gs.goals_against, gs.goal_diff, gs.points,
             g.id AS group_id, g.letter
      FROM group_standings gs
      JOIN \`groups\` g ON g.id = gs.group_id
      WHERE g.tournament_id = ?
    `, [tournamentId]);

    // ── 2. Finished group matches (for H2H tiebreaker) ────────────────────────
    const [groupMatches] = await db.query(`
      SELECT id, group_id, home_team_id, away_team_id, home_score, away_score, status
      FROM matches
      WHERE phase = 'group' AND status = 'finished' AND tournament_id = ?
    `, [tournamentId]);

    // ── 3. Fair play map ──────────────────────────────────────────────────────
    const [cards] = await db.query(`
      SELECT me.team_id,
             SUM(IF(me.event_type = 'yellow_card', 1, 0)) AS yellows,
             SUM(IF(me.event_type = 'red_card',    3, 0)) AS reds
      FROM match_events me
      JOIN matches m ON m.id = me.match_id
      WHERE m.phase = 'group' AND m.tournament_id = ?
      GROUP BY me.team_id
    `, [tournamentId]);

    const fairPlayMap = {};
    for (const c of cards) {
      fairPlayMap[c.team_id] = (Number(c.yellows) || 0) + (Number(c.reds) || 0);
    }

    // ── 4. Sort each group with official tiebreakers ──────────────────────────
    const byGroup = {};
    for (const row of rows) {
      if (!byGroup[row.letter]) byGroup[row.letter] = { groupId: row.group_id, teams: [] };
      byGroup[row.letter].teams.push({ ...row, fair_play_points: fairPlayMap[row.team_id] ?? 0 });
    }

    for (const letter of Object.keys(byGroup)) {
      const gm = groupMatches.filter(m => m.group_id === byGroup[letter].groupId);
      byGroup[letter].teams = sortStandings(byGroup[letter].teams, gm, fairPlayMap);
    }

    const letters = Object.keys(byGroup).sort();
    const groupCount = letters.length;

    // ── 5. Delete existing knockout matches ───────────────────────────────────
    await db.query(
      "DELETE FROM matches WHERE tournament_id = ? AND phase != 'group'",
      [tournamentId]
    );

    const created = [];

    // ── 6. Determine format ───────────────────────────────────────────────────
    //  ≤4 groups  → quarter-finals (8 teams: 1st+2nd × 4 groups)
    //  5-6 groups → round of 16   (16 teams: 1st+2nd × 6 groups + best 4 thirds)
    //  8 groups   → round of 16   (16 teams: 1st+2nd × 8 groups)

    const phase = groupCount <= 4 ? 'quarter_final' : 'round_of_16';
    let matchNum = 1;

    if (groupCount === 5 || groupCount === 6) {
      // ── 24-team format: add best 4 third-place teams ────────────────────────
      const thirds = letters.map(l => ({ ...byGroup[l].teams[2], groupLetter: l }))
                            .filter(Boolean);
      const bestThirds = selectBestThird(thirds, fairPlayMap, 4);
      const bestThirdIds = new Set(bestThirds.map(t => t.team_id));

      // Collect qualifiers: 1st & 2nd from every group
      const qualifiers = {};
      for (const l of letters) {
        const [first, second] = byGroup[l].teams;
        qualifiers[l] = { first: first?.team_id, second: second?.team_id };
      }

      // Standard cross-pairing: 1st(A) vs 2nd(B), 1st(B) vs 2nd(A), …
      for (let i = 0; i < letters.length; i += 2) {
        const lA = letters[i], lB = letters[i + 1];
        if (!lA || !lB) break;
        await insertMatch(db, tournamentId, phase, matchNum++, qualifiers[lA].first,  qualifiers[lB].second, created);
        await insertMatch(db, tournamentId, phase, matchNum++, qualifiers[lB].first,  qualifiers[lA].second, created);
      }

      // Slot the best 3rd-place teams into remaining round-of-16 spots
      for (const t3 of bestThirds) {
        await insertMatch(db, tournamentId, phase, matchNum++, t3.team_id, null, created);
      }

    } else {
      // ── Standard format: 1st vs 2nd cross-pairing ───────────────────────────
      for (let i = 0; i < letters.length; i += 2) {
        const lA = letters[i], lB = letters[i + 1];
        if (!lA || !lB) continue;
        const [fA, sA] = byGroup[lA].teams;
        const [fB, sB] = byGroup[lB].teams;

        // 1st of A vs 2nd of B
        await insertMatch(db, tournamentId, phase, matchNum++, fA?.team_id, sB?.team_id, created);
        // 1st of B vs 2nd of A
        await insertMatch(db, tournamentId, phase, matchNum++, fB?.team_id, sA?.team_id, created);
      }
    }

    await db.query(
      "UPDATE tournament SET status='knockout', current_phase=? WHERE id=?",
      [phase, tournamentId]
    );

    res.json({ message: `Generated ${created.length} knockout matches`, phase, count: created.length });
  } catch (err) { next(err); }
}

async function insertMatch(db, tournamentId, phase, matchNum, homeId, awayId, created) {
  const [r] = await db.query(
    `INSERT INTO matches (tournament_id, phase, match_number, home_team_id, away_team_id, status)
     VALUES (?, ?, ?, ?, ?, 'scheduled')`,
    [tournamentId, phase, matchNum, homeId || null, awayId || null]
  );
  created.push(r.insertId);
}

module.exports = { getBracket, generateKnockout };
