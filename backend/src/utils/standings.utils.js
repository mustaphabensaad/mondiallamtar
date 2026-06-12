/**
 * Official tiebreaker logic for مونديال لمطار 2026
 *
 * Priority (descending):
 *  1. Points
 *  2. Head-to-head (among tied teams only): H2H pts → H2H GD → H2H GF
 *  3. Overall goal difference (all group matches)
 *  4. Overall goals scored
 *  5. Fair play: yellow=1pt, red=3pts  (lower = better)
 *  6. Lottery (flagged with needs_lottery=true)
 */

/**
 * Build head-to-head mini-standings for a subset of teamIds
 * using only the finished matches between those teams.
 */
function buildH2H(teamIds, groupMatches) {
  const h2h = {};
  for (const id of teamIds) h2h[id] = { points: 0, gd: 0, gf: 0 };

  for (const m of groupMatches) {
    if (m.status !== 'finished') continue;
    const homeIn = teamIds.includes(m.home_team_id);
    const awayIn = teamIds.includes(m.away_team_id);
    if (!homeIn || !awayIn) continue;

    const hg = m.home_score ?? 0;
    const ag = m.away_score ?? 0;

    h2h[m.home_team_id].gf += hg;
    h2h[m.home_team_id].gd += hg - ag;
    h2h[m.away_team_id].gf += ag;
    h2h[m.away_team_id].gd += ag - hg;

    if (hg > ag)      { h2h[m.home_team_id].points += 3; }
    else if (hg < ag) { h2h[m.away_team_id].points += 3; }
    else              { h2h[m.home_team_id].points += 1; h2h[m.away_team_id].points += 1; }
  }
  return h2h;
}

/**
 * Sort a list of team-standing objects using the official tiebreaker.
 *
 * @param {Array}  teams        — standing rows (must have: team_id, points, goal_diff, goals_for)
 * @param {Array}  groupMatches — finished matches in the same group
 * @param {Object} fairPlayMap  — { [team_id]: fair_play_penalty_points }
 * @returns sorted array (descending rank)
 */
function sortStandings(teams, groupMatches, fairPlayMap) {
  // Deep-sort by breaking ties recursively
  const sorted = [...teams].sort((a, b) => b.points - a.points);

  const result = [];
  let i = 0;

  while (i < sorted.length) {
    // Collect all teams with the same points as sorted[i]
    let j = i + 1;
    while (j < sorted.length && sorted[j].points === sorted[i].points) j++;

    const tied = sorted.slice(i, j);

    if (tied.length === 1) {
      result.push(...tied);
    } else {
      result.push(...resolveTie(tied, groupMatches, fairPlayMap));
    }

    i = j;
  }

  // Attach rank position
  result.forEach((t, idx) => { t.position = idx + 1; });
  return result;
}

function resolveTie(tied, groupMatches, fairPlayMap) {
  const teamIds = tied.map(t => t.team_id);
  const h2h = buildH2H(teamIds, groupMatches);

  tied.sort((a, b) => {
    const ha = h2h[a.team_id];
    const hb = h2h[b.team_id];

    // 2. Head-to-head points
    if (hb.points !== ha.points) return hb.points - ha.points;
    // 2b. Head-to-head goal difference
    if (hb.gd !== ha.gd) return hb.gd - ha.gd;
    // 2c. Head-to-head goals scored
    if (hb.gf !== ha.gf) return hb.gf - ha.gf;

    // 3. Overall goal difference
    if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;

    // 4. Overall goals scored
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;

    // 5. Fair play (lower is better)
    const fpA = fairPlayMap[a.team_id] ?? 0;
    const fpB = fairPlayMap[b.team_id] ?? 0;
    if (fpA !== fpB) return fpA - fpB;

    // 6. Lottery
    a.needs_lottery = true;
    b.needs_lottery = true;
    return 0;
  });

  return tied;
}

/**
 * Select the best N third-place teams across groups.
 * Used in 24-team format to fill 4 spots in the round of 16.
 *
 * Comparison criteria (no H2H between groups):
 *  1. Points
 *  2. Overall goal difference
 *  3. Fair play (lower = better)
 *  4. Lottery
 */
function selectBestThird(thirdPlaceTeams, fairPlayMap, count = 4) {
  const sorted = [...thirdPlaceTeams].sort((a, b) => {
    if (b.points !== a.points)      return b.points - a.points;
    if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
    const fpA = fairPlayMap[a.team_id] ?? 0;
    const fpB = fairPlayMap[b.team_id] ?? 0;
    if (fpA !== fpB) return fpA - fpB;
    a.needs_lottery = true;
    b.needs_lottery = true;
    return 0;
  });
  return sorted.slice(0, count);
}

module.exports = { sortStandings, selectBestThird };
