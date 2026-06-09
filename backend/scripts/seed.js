require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db     = require('../src/config/db');
const { generateInviteToken } = require('../src/utils/helpers');

// ─── Placeholder image helpers ────────────────────────────────────────────────
const teamColors = [
  ['16a34a','ffffff'], ['1e40af','ffffff'], ['dc2626','ffffff'], ['d97706','000000'],
  ['7c3aed','ffffff'], ['0891b2','ffffff'], ['be185d','ffffff'], ['059669','ffffff'],
  ['ea580c','ffffff'], ['4f46e5','ffffff'], ['b91c1c','ffffff'], ['0284c7','ffffff'],
  ['c026d3','ffffff'], ['65a30d','ffffff'], ['0d9488','ffffff'], ['9333ea','ffffff'],
];

function teamLogo(name, idx) {
  const [bg, fg] = teamColors[idx % teamColors.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return `https://placehold.co/80x80/${bg}/${fg}?text=${encodeURIComponent(initials)}`;
}

function playerPhoto(initials, idx) {
  const [bg, fg] = teamColors[(idx + 3) % teamColors.length];
  return `https://placehold.co/80x80/${bg}/${fg}?text=${encodeURIComponent(initials)}`;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAMS = [
  // Group A
  { name: 'FC Alger Stars',     coach: 'Youcef Belaïd',   group: 'A' },
  { name: 'El Djazair United',  coach: 'Karim Amrani',    group: 'A' },
  { name: 'Atlas Lions FC',     coach: 'Mourad Sadji',    group: 'A' },
  { name: 'Fennec Warriors',    coach: 'Salim Haddad',    group: 'A' },
  // Group B
  { name: 'Oran Eagles',        coach: 'Bilal Merabet',   group: 'B' },
  { name: 'Constantine FC',     coach: 'Hamza Gherbi',    group: 'B' },
  { name: 'Tlemcen Raiders',    coach: 'Nassim Boucif',   group: 'B' },
  { name: 'Annaba United',      coach: 'Ramzi Ouled',     group: 'B' },
  // Group C
  { name: 'Batna Thunder',      coach: 'Omar Bensalem',   group: 'C' },
  { name: 'Sétif Hawks',        coach: 'Farid Charef',    group: 'C' },
  { name: 'Biskra Desert FC',   coach: 'Tarek Guendouz',  group: 'C' },
  { name: 'Béjaïa Lions',       coach: 'Lyes Oukaci',     group: 'C' },
  // Group D
  { name: 'Blida City',         coach: 'Raouf Meziane',   group: 'D' },
  { name: 'Médéa Stars',        coach: 'Yacine Chekkal',  group: 'D' },
  { name: 'Djelfa Nomads',      coach: 'Anis Benabid',    group: 'D' },
  { name: 'Tiaret FC',          coach: 'Sofiane Khaldi',  group: 'D' },
];

const PLAYERS_PER_TEAM = [
  { first: 'Mohamed',  last: 'Benali',   jersey: 1,  pos: 'GK'  },
  { first: 'Karim',    last: 'Touati',   jersey: 2,  pos: 'DEF' },
  { first: 'Yacine',   last: 'Hamdi',    jersey: 3,  pos: 'DEF' },
  { first: 'Bilal',    last: 'Saâdi',    jersey: 4,  pos: 'DEF' },
  { first: 'Nassim',   last: 'Oukaci',   jersey: 5,  pos: 'DEF' },
  { first: 'Omar',     last: 'Ferhat',   jersey: 6,  pos: 'MID' },
  { first: 'Anis',     last: 'Ramdane',  jersey: 7,  pos: 'MID' },
  { first: 'Sofiane',  last: 'Meziane',  jersey: 8,  pos: 'MID' },
  { first: 'Riyad',    last: 'Ghoul',    jersey: 9,  pos: 'FWD' },
  { first: 'Islam',    last: 'Boudali',  jersey: 10, pos: 'FWD' },
  { first: 'Hamza',    last: 'Larbi',    jersey: 11, pos: 'FWD' },
];

const ASSOCIATION_IMAGES = [
  {
    title_fr: 'مونديال لمطار 2026',
    title_ar: 'مونديال لمطار 2026',
    title_en: 'Mundial Lamtar 2026',
    desc_fr:  'From us to all – Creativity sans limite',
    desc_ar:  'من عندنا للكل — إبداع بلا حدود',
    desc_en:  'From us to all – Creativity sans limite',
    image:    'https://placehold.co/1200x500/0f172a/22c55e?text=Mundial+Lamtar+2026',
    order:    1,
  },
  {
    title_fr: 'طبعة الوفاء 🦅',
    title_ar: 'طبعة الوفاء 🦅',
    title_en: 'Wafaa Edition 🦅',
    desc_fr:  'تُهدى هذه النسخة إلى روح الشهيد الطيار بن نجة يوسف',
    desc_ar:  'تُهدى هذه النسخة إلى روح الشهيد الطيار بن نجة يوسف',
    desc_en:  'Dedicated to the memory of martyr pilot Ben Naja Youssef',
    image:    'https://placehold.co/1200x500/1e293b/d97706?text=Edition+Wafaa',
    order:    2,
  },
  {
    title_fr: 'تابع المباريات مباشرة',
    title_ar: 'تابع المباريات مباشرة',
    title_en: 'Watch Matches Live',
    desc_fr:  'النتائج والأهداف والبطاقات في الوقت الفعلي — الملعب البلدي لمطار',
    desc_ar:  'النتائج والأهداف والبطاقات في الوقت الفعلي — الملعب البلدي لمطار',
    desc_en:  'Scores, goals and cards in real time — Municipal Stadium of Lamtar',
    image:    'https://placehold.co/1200x500/16a34a/ffffff?text=Live+Scores',
    order:    3,
  },
  {
    title_fr: 'سجّل فريقك الآن',
    title_ar: 'سجّل فريقك الآن',
    title_en: 'Register Your Team Now',
    desc_fr:  '8 000 DZD / فريق · 6 لاعبين + 4 احتياط · لباس موحد إجباري',
    desc_ar:  '8 000 دج / فريق · 6 لاعبين + 4 احتياط · لباس موحد إجباري',
    desc_en:  '8,000 DZD / team · 6 players + 4 subs · uniform required',
    image:    'https://placehold.co/1200x500/1e40af/ffffff?text=Register+Now',
    order:    4,
  },
  {
    title_fr: 'الكابتن 🦊 — شابكة ⚽',
    title_ar: 'الكابتن 🦊 — شابكة ⚽',
    title_en: 'El Capitan 🦊 — Chabka ⚽',
    desc_fr:  'التميمة الرسمية #الكابتن · الكرة الرسمية #شابكة',
    desc_ar:  'التميمة الرسمية #الكابتن · الكرة الرسمية #شابكة',
    desc_en:  'Official mascot #ElCapitan · Official ball #Chabka',
    image:    'https://placehold.co/1200x500/7c3aed/ffffff?text=El+Capitan+x+Chabka',
    order:    5,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  console.log('Seeding database...\n');

  // ── Tournament ──────────────────────────────────────────────────────────────
  await db.query('DELETE FROM fines');
  await db.query('DELETE FROM match_events');
  await db.query('DELETE FROM matches');
  await db.query('DELETE FROM group_standings');
  await db.query('DELETE FROM `groups`');
  await db.query('DELETE FROM players');
  await db.query('DELETE FROM teams');
  await db.query('DELETE FROM referees');
  await db.query('DELETE FROM sponsors');
  await db.query('DELETE FROM association_images');
  await db.query('DELETE FROM users WHERE role = "captain"');
  await db.query('DELETE FROM tournament');
  console.log('Cleared existing seed data');

  const [t] = await db.query(
    `INSERT INTO tournament (name, name_ar, name_fr, season, max_teams, team_fee, bank_details, status, current_phase)
     VALUES (?, ?, ?, ?, '16', 2000.00,
       'CPA — RIB: 007 00016 4000000126 18\nBénéficiaire: Association Shabka',
       'group_stage', 'groups')`,
    ['Shabka Tournament 2025', 'بطولة شبكة 2025', 'Tournoi Shabka 2025', '2025']
  );
  const tournamentId = t.insertId;
  console.log(`Tournament id=${tournamentId}`);

  // ── Admin user ──────────────────────────────────────────────────────────────
  const [existAdmin] = await db.query('SELECT id FROM users WHERE email = "admin@shabka.dz"');
  let adminId;
  if (existAdmin.length > 0) {
    adminId = existAdmin[0].id;
  } else {
    const hash = await bcrypt.hash('admin123', 12);
    const [a] = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, "admin")',
      ['admin@shabka.dz', hash]
    );
    adminId = a.insertId;
    console.log(`Admin created: admin@shabka.dz / admin123`);
  }

  // ── Captain users ───────────────────────────────────────────────────────────
  const captainHash = await bcrypt.hash('captain123', 12);
  const captainIds  = [];
  for (let i = 1; i <= 4; i++) {
    const email = `captain${i}@shabka.dz`;
    const [r] = await db.query(
      'INSERT INTO users (email, password_hash, role, phone) VALUES (?, ?, "captain", ?)',
      [email, captainHash, `055000000${i}`]
    );
    captainIds.push(r.insertId);
  }
  console.log(`4 captains created (captain1@shabka.dz ... captain4@shabka.dz / captain123)`);

  // ── Referees ────────────────────────────────────────────────────────────────
  const refereeData = [
    ['Karim Ziani',       '0661100001'],
    ['Mourad Aouadi',     '0661100002'],
    ['Farid Chebbah',     '0661100003'],
    ['Hichem Benmansour', '0661100004'],
  ];
  const refereeIds = [];
  for (const [name, phone] of refereeData) {
    const [r] = await db.query(
      'INSERT INTO referees (tournament_id, name, phone) VALUES (?, ?, ?)',
      [tournamentId, name, phone]
    );
    refereeIds.push(r.insertId);
  }

  // ── Teams ───────────────────────────────────────────────────────────────────
  const teamIds = [];
  for (let i = 0; i < TEAMS.length; i++) {
    const { name, coach, group } = TEAMS[i];
    const captainId = captainIds[Math.floor(i / 4)];
    const logo = teamLogo(name, i);
    const [r] = await db.query(
      `INSERT INTO teams (tournament_id, captain_id, name, logo_path, coach_name, status, group_letter, payment_status)
       VALUES (?, ?, ?, ?, ?, 'approved', ?, 'paid')`,
      [tournamentId, captainId, name, logo, coach, group]
    );
    teamIds.push(r.insertId);
  }
  console.log(`${TEAMS.length} teams created`);

  // ── Players ─────────────────────────────────────────────────────────────────
  const playerIdsByTeam = {};
  let playerCounter = 0;
  for (let ti = 0; ti < teamIds.length; ti++) {
    const tid = teamIds[ti];
    playerIdsByTeam[tid] = [];
    for (let pi = 0; pi < PLAYERS_PER_TEAM.length; pi++) {
      const p     = PLAYERS_PER_TEAM[pi];
      const first = p.first;
      const last  = `${p.last} ${TEAMS[ti].name.split(' ')[0]}`;
      const token = generateInviteToken();
      const photo = playerPhoto(
        `${first[0]}${p.last[0]}`.toUpperCase(),
        playerCounter
      );
      const [r] = await db.query(
        `INSERT INTO players
          (team_id, invite_token, token_used, first_name, last_name, jersey_number, position, is_validated, photo_path, is_captain)
         VALUES (?, ?, TRUE, ?, ?, ?, ?, TRUE, ?, ?)`,
        [tid, token, first, last, p.jersey, p.pos, photo, pi === 9]
      );
      playerIdsByTeam[tid].push(r.insertId);
      playerCounter++;
    }
  }
  console.log(`${playerCounter} players created`);

  // ── Groups ──────────────────────────────────────────────────────────────────
  const groupIds = {};
  for (const letter of ['A', 'B', 'C', 'D']) {
    const [r] = await db.query(
      'INSERT INTO `groups` (tournament_id, letter) VALUES (?, ?)',
      [tournamentId, letter]
    );
    groupIds[letter] = r.insertId;
  }

  // ── Group standings (initial rows) ──────────────────────────────────────────
  for (let i = 0; i < TEAMS.length; i++) {
    const gid = groupIds[TEAMS[i].group];
    await db.query(
      'INSERT INTO group_standings (group_id, team_id) VALUES (?, ?)',
      [gid, teamIds[i]]
    );
  }
  console.log('Groups + standings rows created');

  // ── Helper: create a finished match with events ────────────────────────────
  async function createFinishedMatch(homeIdx, awayIdx, homeGoals, awayGoals, refereeIdx, daysAgo, groupLetter) {
    const homeId   = teamIds[homeIdx];
    const awayId   = teamIds[awayIdx];
    const gid      = groupIds[groupLetter];
    const refId    = refereeIds[refereeIdx % refereeIds.length];
    const scheduledAt = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
    const startedAt   = new Date(scheduledAt.getTime() + 30 * 60 * 1000);
    const endedAt     = new Date(startedAt.getTime()   + 90 * 60 * 1000);

    const [m] = await db.query(
      `INSERT INTO matches
        (tournament_id, phase, group_id, home_team_id, away_team_id, referee_id,
         venue, scheduled_at, started_at, ended_at, status, home_score, away_score,
         home_score_ht, away_score_ht, winner_id)
       VALUES (?, 'group', ?, ?, ?, ?, 'Stade Municipal Alger', ?, ?, ?, 'finished', ?, ?, ?, ?, ?)`,
      [
        tournamentId, gid, homeId, awayId, refId,
        scheduledAt, startedAt, endedAt,
        homeGoals, awayGoals,
        Math.floor(homeGoals / 2), Math.floor(awayGoals / 2),
        homeGoals > awayGoals ? homeId : awayGoals > homeGoals ? awayId : null,
      ]
    );
    const matchId = m.insertId;

    // Insert goal events
    const homePlayers = playerIdsByTeam[homeId];
    const awayPlayers = playerIdsByTeam[awayId];

    for (let g = 0; g < homeGoals; g++) {
      const scorerId = homePlayers[(g * 3 + 9) % homePlayers.length]; // FWD/MID
      await db.query(
        `INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
         VALUES (?, ?, ?, 'goal', ?)`,
        [matchId, scorerId, homeId, 10 + g * 15]
      );
    }
    for (let g = 0; g < awayGoals; g++) {
      const scorerId = awayPlayers[(g * 3 + 10) % awayPlayers.length];
      await db.query(
        `INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
         VALUES (?, ?, ?, 'goal', ?)`,
        [matchId, scorerId, awayId, 20 + g * 15]
      );
    }

    // One yellow card per match
    const yellowPlayer = homePlayers[3];
    await db.query(
      `INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
       VALUES (?, ?, ?, 'yellow_card', ?)`,
      [matchId, yellowPlayer, homeId, 45]
    );

    // Set MOTM to top scorer of home team if they won
    if (homeGoals > awayGoals && homeGoals > 0) {
      const motm = homePlayers[9];
      await db.query('UPDATE matches SET man_of_match_id = ? WHERE id = ?', [motm, matchId]);
    }

    return matchId;
  }

  // ── Finished matches (round-robin, 2 played per group) ─────────────────────
  // Group A: teams 0,1,2,3
  await createFinishedMatch(0, 1, 3, 1, 0, 7, 'A');
  await createFinishedMatch(2, 3, 2, 2, 1, 7, 'A');
  await createFinishedMatch(0, 2, 1, 0, 2, 4, 'A');
  await createFinishedMatch(1, 3, 2, 0, 3, 4, 'A');

  // Group B: teams 4,5,6,7
  await createFinishedMatch(4, 5, 0, 2, 0, 6, 'B');
  await createFinishedMatch(6, 7, 1, 1, 1, 6, 'B');
  await createFinishedMatch(4, 6, 3, 0, 2, 3, 'B');
  await createFinishedMatch(5, 7, 1, 2, 3, 3, 'B');

  // Group C: teams 8,9,10,11
  await createFinishedMatch(8, 9,  2, 1, 0, 5, 'C');
  await createFinishedMatch(10, 11, 0, 3, 1, 5, 'C');
  await createFinishedMatch(8, 10, 1, 1, 2, 2, 'C');
  await createFinishedMatch(9, 11, 2, 0, 3, 2, 'C');

  // Group D: teams 12,13,14,15
  await createFinishedMatch(12, 13, 1, 3, 0, 6, 'D');
  await createFinishedMatch(14, 15, 2, 1, 1, 6, 'D');
  await createFinishedMatch(12, 14, 0, 1, 2, 3, 'D');
  await createFinishedMatch(13, 15, 3, 2, 3, 3, 'D');

  console.log('Finished matches + events created');

  // ── Recalculate group standings from finished matches ───────────────────────
  await db.query('UPDATE group_standings SET played=0,won=0,drawn=0,lost=0,goals_for=0,goals_against=0');
  const [finishedMatches] = await db.query("SELECT * FROM matches WHERE status='finished' AND phase='group'");
  for (const m of finishedMatches) {
    const hs = m.home_score, as_ = m.away_score;
    await db.query(
      'UPDATE group_standings SET played=played+1,goals_for=goals_for+?,goals_against=goals_against+?,won=won+?,drawn=drawn+?,lost=lost+? WHERE team_id=? AND group_id=?',
      [hs,as_,hs>as_?1:0,hs===as_?1:0,hs<as_?1:0,m.home_team_id,m.group_id]);
    await db.query(
      'UPDATE group_standings SET played=played+1,goals_for=goals_for+?,goals_against=goals_against+?,won=won+?,drawn=drawn+?,lost=lost+? WHERE team_id=? AND group_id=?',
      [as_,hs,as_>hs?1:0,as_===hs?1:0,as_<hs?1:0,m.away_team_id,m.group_id]);
  }
  console.log('Group standings recalculated');

  // ── Live match (A vs B first teams) ─────────────────────────────────────────
  const liveHome = teamIds[0];
  const liveAway = teamIds[4];
  const [lm] = await db.query(
    `INSERT INTO matches
      (tournament_id, phase, group_id, home_team_id, away_team_id, referee_id,
       venue, scheduled_at, started_at, status, home_score, away_score)
     VALUES (?, 'group', ?, ?, ?, ?, 'Stade du 5 Juillet', NOW() - INTERVAL 55 MINUTE,
             NOW() - INTERVAL 55 MINUTE, 'live', 1, 0)`,
    [tournamentId, groupIds['A'], liveHome, liveAway, refereeIds[0]]
  );
  const liveMatchId = lm.insertId;
  // Add a live goal event
  await db.query(
    `INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
     VALUES (?, ?, ?, 'goal', 23)`,
    [liveMatchId, playerIdsByTeam[liveHome][9], liveHome]
  );
  console.log(`Live match id=${liveMatchId}`);

  // ── Scheduled matches (today and tomorrow) ──────────────────────────────────
  const schedules = [
    [2, 5, groupIds['A'], '15:00:00'],
    [6, 9, groupIds['B'], '17:00:00'],
    [10, 13, groupIds['C'], '19:00:00'],
    [14, 1, groupIds['D'], '21:00:00'],
  ];
  for (const [hi, ai, gid, time] of schedules) {
    await db.query(
      `INSERT INTO matches (tournament_id, phase, group_id, home_team_id, away_team_id, referee_id, venue, scheduled_at, status)
       VALUES (?, 'group', ?, ?, ?, ?, 'Stade Municipal Alger', CONCAT(CURDATE(), ' ', ?), 'scheduled')`,
      [tournamentId, gid, teamIds[hi % 16], teamIds[ai % 16], refereeIds[1], time]
    );
  }
  console.log('Scheduled matches created');

  // ── Sponsors ─────────────────────────────────────────────────────────────────
  const sponsors = [
    ['Mobilis',   'https://placehold.co/160x60/16a34a/ffffff?text=Mobilis',   'https://mobilis.dz',   1],
    ['Ooredoo',   'https://placehold.co/160x60/dc2626/ffffff?text=Ooredoo',   'https://ooredoo.dz',   2],
    ['Djezzy',    'https://placehold.co/160x60/d97706/000000?text=Djezzy',    'https://djezzy.dz',    3],
  ];
  for (const [name, logo, url, order] of sponsors) {
    await db.query(
      'INSERT INTO sponsors (tournament_id, name, logo_path, website_url, display_order) VALUES (?, ?, ?, ?, ?)',
      [tournamentId, name, logo, url, order]
    );
  }

  // ── Association images ──────────────────────────────────────────────────────
  for (const img of ASSOCIATION_IMAGES) {
    await db.query(
      `INSERT INTO association_images
        (tournament_id, image_path, title_fr, title_ar, title_en, description_fr, description_ar, description_en, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tournamentId, img.image, img.title_fr, img.title_ar, img.title_en,
       img.desc_fr, img.desc_ar, img.desc_en, img.order]
    );
  }

  console.log('\nSeed complete.');
  console.log('────────────────────────────────────');
  console.log('Admin:   admin@shabka.dz    / admin123');
  console.log('Captain: captain1@shabka.dz / captain123  (teams in groups A & B)');
  console.log('Captain: captain2@shabka.dz / captain123  (teams in groups A & B)');
  console.log('Captain: captain3@shabka.dz / captain123  (teams in groups C & D)');
  console.log('Captain: captain4@shabka.dz / captain123  (teams in groups C & D)');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
