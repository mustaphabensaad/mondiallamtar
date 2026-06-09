require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

async function seedBracket() {
  const [tours] = await db.query('SELECT id FROM tournament ORDER BY id DESC LIMIT 1');
  const tid = tours[0].id;

  await db.query("DELETE FROM match_events WHERE match_id IN (SELECT id FROM matches WHERE phase != 'group')");
  await db.query("DELETE FROM matches WHERE phase != 'group'");

  const [standings] = await db.query(`
    SELECT gs.team_id, g.letter, t.name AS team_name
    FROM group_standings gs
    JOIN \`groups\` g ON g.id = gs.group_id
    JOIN teams t ON t.id = gs.team_id
    ORDER BY g.letter, gs.points DESC, gs.goal_diff DESC
  `);
  const byGroup = {};
  for (const r of standings) {
    if (!byGroup[r.letter]) byGroup[r.letter] = [];
    byGroup[r.letter].push(r);
  }
  const A = byGroup['A'], B = byGroup['B'], C = byGroup['C'], D = byGroup['D'];
  const [refs] = await db.query('SELECT id FROM referees LIMIT 4');
  const rids = refs.map(r => r.id);

  async function ins(phase, num, homeId, awayId, hs, as_, status, daysOff, ref) {
    const sat = new Date(Date.now() + daysOff * 86400000);
    const win = hs > as_ ? homeId : as_ > hs ? awayId : null;
    const [m] = await db.query(
      `INSERT INTO matches (tournament_id,phase,match_number,home_team_id,away_team_id,referee_id,
         venue,scheduled_at,started_at,ended_at,status,home_score,away_score,winner_id)
       VALUES (?,?,?,?,?,?,'Grand Stade Alger',?,?,?,?,?,?,?)`,
      [tid, phase, num, homeId, awayId, rids[ref % rids.length], sat,
       status !== 'scheduled' ? sat : null,
       status === 'finished'  ? new Date(sat.getTime() + 5400000) : null,
       status, hs, as_, win]
    );
    return { id: m.insertId, homeId, awayId, hs, as_, win };
  }

  async function goals(matchId, teamId, count, min0) {
    const [ps] = await db.query('SELECT id FROM players WHERE team_id=? ORDER BY id LIMIT 11', [teamId]);
    for (let i = 0; i < count; i++)
      await db.query("INSERT INTO match_events(match_id,player_id,team_id,event_type,minute) VALUES(?,?,?,'goal',?)",
        [matchId, ps[(i*3+9) % ps.length].id, teamId, min0 + i*12]);
  }

  // Quarter Finals (finished)
  const qf1 = await ins('quarter_final', 1, A[0].team_id, D[1].team_id, 3, 1, 'finished', -6, 0);
  const qf2 = await ins('quarter_final', 2, B[0].team_id, C[1].team_id, 2, 0, 'finished', -6, 1);
  const qf3 = await ins('quarter_final', 3, C[0].team_id, B[1].team_id, 1, 2, 'finished', -5, 2);
  const qf4 = await ins('quarter_final', 4, D[0].team_id, A[1].team_id, 2, 1, 'finished', -5, 3);
  await goals(qf1.id, qf1.homeId, 3, 15); await goals(qf1.id, qf1.awayId, 1, 35);
  await goals(qf2.id, qf2.homeId, 2, 22);
  await goals(qf3.id, qf3.awayId, 2, 18);
  await goals(qf4.id, qf4.homeId, 2, 20); await goals(qf4.id, qf4.awayId, 1, 55);
  console.log('Quarter finals done');

  // Semi Finals (finished)
  const sf1 = await ins('semi_final', 1, qf1.win, qf4.win, 2, 1, 'finished', -2, 0);
  const sf2 = await ins('semi_final', 2, qf2.win, qf3.win, 1, 0, 'finished', -2, 1);
  await goals(sf1.id, sf1.homeId, 2, 25); await goals(sf1.id, sf1.awayId, 1, 60);
  await goals(sf2.id, sf2.homeId, 1, 44);
  const [sfp1] = await db.query('SELECT id FROM players WHERE team_id=? LIMIT 11',[sf1.homeId]);
  if (sfp1.length) await db.query('UPDATE matches SET man_of_match_id=? WHERE id=?',[sfp1[9].id, sf1.id]);
  const [sfp2] = await db.query('SELECT id FROM players WHERE team_id=? LIMIT 11',[sf2.homeId]);
  if (sfp2.length) await db.query('UPDATE matches SET man_of_match_id=? WHERE id=?',[sfp2[9].id, sf2.id]);
  console.log('Semi finals done');

  // Final (live)
  const [fm] = await db.query(
    `INSERT INTO matches (tournament_id,phase,match_number,home_team_id,away_team_id,referee_id,
       venue,scheduled_at,started_at,status,home_score,away_score)
     VALUES (?,'final',1,?,?,?,'Grand Stade d\'Alger',NOW()-INTERVAL 62 MINUTE,NOW()-INTERVAL 62 MINUTE,'live',1,0)`,
    [tid, sf1.win, sf2.win, rids[0]]
  );
  const [fp] = await db.query('SELECT id FROM players WHERE team_id=? LIMIT 11',[sf1.win]);
  if (fp.length) await db.query("INSERT INTO match_events(match_id,player_id,team_id,event_type,minute) VALUES(?,?,?,'goal',27)",
    [fm.insertId, fp[9].id, sf1.win]);
  console.log('Final done (LIVE)');

  await db.query("UPDATE tournament SET status='knockout', current_phase='final'");

  // Print summary
  const allIds = [...new Set([A[0].team_id,D[1].team_id,B[0].team_id,C[1].team_id,C[0].team_id,B[1].team_id,D[0].team_id,A[1].team_id,qf1.win,qf4.win,qf2.win,qf3.win,sf1.win,sf2.win])];
  const [ns] = await db.query('SELECT id,name FROM teams WHERE id IN (?)',[allIds]);
  const nm = Object.fromEntries(ns.map(t=>[t.id,t.name]));
  console.log('\n── Bracket ──────────────────────────────');
  console.log(`QF: ${A[0].team_name} 3-1 ${D[1].team_name} | ${B[0].team_name} 2-0 ${C[1].team_name}`);
  console.log(`QF: ${C[0].team_name} 1-2 ${B[1].team_name} | ${D[0].team_name} 2-1 ${A[1].team_name}`);
  console.log(`SF: ${nm[sf1.homeId]} 2-1 ${nm[sf1.awayId]} | ${nm[sf2.homeId]} 1-0 ${nm[sf2.awayId]}`);
  console.log(`FINAL: ${nm[sf1.win]} 1-0 ${nm[sf2.win]} [LIVE]`);
  process.exit(0);
}
seedBracket().catch(e=>{ console.error(e.message); process.exit(1); });
