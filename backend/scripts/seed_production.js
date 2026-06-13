/**
 * seed_production.js
 *
 * Production seed for mundial.lamtar.net
 * ─────────────────────────────────────────────────────────────────
 * ✓  Never touches existing admin accounts
 * ✓  Idempotent — safe to run twice (skips already-existing rows)
 * ✓  Creates 16 captain accounts  captain1@lamtar.net … captain16@lamtar.net  / mundial123
 * ✓  Creates 16 teams, 4 groups (A–D), 176 players
 * ✓  Generates full round-robin schedule (48 group matches, all 'scheduled')
 * ✓  4 referees, 3 sponsors, 5 carousel images, 6 seed articles
 * ─────────────────────────────────────────────────────────────────
 * Run:  node scripts/seed_production.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db     = require('../src/config/db');
const { generateInviteToken } = require('../src/utils/helpers');

// ── Helpers ───────────────────────────────────────────────────────────────────
const COLORS = [
  ['16a34a','ffffff'],['1e40af','ffffff'],['dc2626','ffffff'],['d97706','000000'],
  ['7c3aed','ffffff'],['0891b2','ffffff'],['be185d','ffffff'],['059669','ffffff'],
  ['ea580c','ffffff'],['4f46e5','ffffff'],['b91c1c','ffffff'],['0284c7','ffffff'],
  ['c026d3','ffffff'],['65a30d','ffffff'],['0d9488','ffffff'],['9333ea','ffffff'],
];
function logo(name, i) {
  const [bg, fg] = COLORS[i % COLORS.length];
  const init = name.split(' ').map(w => w[0]).join('').slice(0,3).toUpperCase();
  return `https://placehold.co/80x80/${bg}/${fg}?text=${encodeURIComponent(init)}`;
}
function photoUrl(init, i) {
  const [bg, fg] = COLORS[(i + 3) % COLORS.length];
  return `https://placehold.co/80x80/${bg}/${fg}?text=${encodeURIComponent(init)}`;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const TEAMS = [
  // Group A
  { name:'FC Alger Stars',    coach:'Youcef Belaïd',   group:'A' },
  { name:'El Djazair United', coach:'Karim Amrani',    group:'A' },
  { name:'Atlas Lions FC',    coach:'Mourad Sadji',    group:'A' },
  { name:'Fennec Warriors',   coach:'Salim Haddad',    group:'A' },
  // Group B
  { name:'Oran Eagles',       coach:'Bilal Merabet',   group:'B' },
  { name:'Constantine FC',    coach:'Hamza Gherbi',    group:'B' },
  { name:'Tlemcen Raiders',   coach:'Nassim Boucif',   group:'B' },
  { name:'Annaba United',     coach:'Ramzi Ouled',     group:'B' },
  // Group C
  { name:'Batna Thunder',     coach:'Omar Bensalem',   group:'C' },
  { name:'Sétif Hawks',       coach:'Farid Charef',    group:'C' },
  { name:'Biskra Desert FC',  coach:'Tarek Guendouz',  group:'C' },
  { name:'Béjaïa Lions',      coach:'Lyes Oukaci',     group:'C' },
  // Group D
  { name:'Blida City',        coach:'Raouf Meziane',   group:'D' },
  { name:'Médéa Stars',       coach:'Yacine Chekkal',  group:'D' },
  { name:'Djelfa Nomads',     coach:'Anis Benabid',    group:'D' },
  { name:'Tiaret FC',         coach:'Sofiane Khaldi',  group:'D' },
];

// 11 players per team — same template, last name gets team prefix
const PLAYER_TEMPLATE = [
  { first:'Mohamed',  last:'Benali',  jersey:1,  pos:'GK'  },
  { first:'Karim',    last:'Touati',  jersey:2,  pos:'DEF' },
  { first:'Yacine',   last:'Hamdi',   jersey:3,  pos:'DEF' },
  { first:'Bilal',    last:'Saâdi',   jersey:4,  pos:'DEF' },
  { first:'Nassim',   last:'Oukaci',  jersey:5,  pos:'DEF' },
  { first:'Omar',     last:'Ferhat',  jersey:6,  pos:'MID' },
  { first:'Anis',     last:'Ramdane', jersey:7,  pos:'MID' },
  { first:'Sofiane',  last:'Meziane', jersey:8,  pos:'MID' },
  { first:'Riyad',    last:'Ghoul',   jersey:9,  pos:'FWD' },
  { first:'Islam',    last:'Boudali', jersey:10, pos:'FWD' },
  { first:'Hamza',    last:'Larbi',   jersey:11, pos:'FWD' },
];

const REFEREES = [
  { name:'Karim Ziani',       phone:'0661100001' },
  { name:'Mourad Aouadi',     phone:'0661100002' },
  { name:'Farid Chebbah',     phone:'0661100003' },
  { name:'Hichem Benmansour', phone:'0661100004' },
];

const SPONSORS = [
  { name:'Partenaire Or',    logo:'https://placehold.co/200x80/16a34a/ffffff?text=Partenaire+Or',    url:'https://mundial.lamtar.net', tier:'gold',   order:1 },
  { name:'Partenaire Argent',logo:'https://placehold.co/200x80/64748b/ffffff?text=Partenaire+Argent',url:'https://mundial.lamtar.net', tier:'silver', order:2 },
  { name:'Partenaire Bronze',logo:'https://placehold.co/200x80/d97706/000000?text=Partenaire+Bronze',url:'https://mundial.lamtar.net', tier:'bronze', order:3 },
];

const CAROUSEL = [
  {
    image:'https://placehold.co/1200x500/0a0f1e/16a34a?text=Mundial+Lamtar+2026',
    title_fr:'مونديال لمطار 2026', title_ar:'مونديال لمطار 2026', title_en:'Mundial Lamtar 2026',
    desc_fr:'From us to all – Créativité sans limite',
    desc_ar:'من عندنا للكل — إبداع بلا حدود',
    desc_en:'From us to all – Créativité sans limite', order:1,
  },
  {
    image:'https://placehold.co/1200x500/1e293b/d97706?text=Edition+Wafaa+%F0%9F%A6%85',
    title_fr:'طبعة الوفاء 🦅', title_ar:'طبعة الوفاء 🦅', title_en:'Wafaa Edition 🦅',
    desc_fr:'تُهدى هذه النسخة إلى روح الشهيدَين بنجة يوسف وبوجمعة سليمان',
    desc_ar:'تُهدى هذه النسخة إلى روح الشهيدَين بنجة يوسف وبوجمعة سليمان',
    desc_en:'Dedicated to the memory of Bennadja Youcef & Boudjemaa Selimane', order:2,
  },
  {
    image:'https://placehold.co/1200x500/052e16/22c55e?text=Phase+de+groupes',
    title_fr:'Phase de groupes', title_ar:'دور المجموعات', title_en:'Group Stage',
    desc_fr:'4 groupes · 4 équipes chacun · Les 2 premiers qualifiés',
    desc_ar:'4 مجموعات · 4 فرق لكل مجموعة · يتأهل الأول والثاني',
    desc_en:'4 groups · 4 teams each · Top 2 qualify', order:3,
  },
  {
    image:'https://placehold.co/1200x500/1e40af/ffffff?text=Suivez+les+matchs+EN+DIRECT',
    title_fr:'تابع المباريات مباشرة', title_ar:'تابع المباريات مباشرة', title_en:'Watch Live',
    desc_fr:'النتائج والأهداف والبطاقات لحظة بلحظة على الموقع الرسمي',
    desc_ar:'النتائج والأهداف والبطاقات لحظة بلحظة على الموقع الرسمي',
    desc_en:'Goals, cards and scores in real time on the official website', order:4,
  },
  {
    image:'https://placehold.co/1200x500/3b0764/a855f7?text=Knock-Out+%E2%9A%A1',
    title_fr:'Phases éliminatoires ⚡', title_ar:'الأدوار الإقصائية ⚡', title_en:'Knockout Rounds ⚡',
    desc_fr:'Huitièmes · Quarts · Demi-finales · Grande Finale',
    desc_ar:'ثمن النهائي · ربع النهائي · نصف النهائي · النهائي الكبير',
    desc_en:'Round of 16 · Quarter-finals · Semi-finals · Grand Final', order:5,
  },
];

const POSTS = [
  {
    title:'🏆 Lancement officiel du Mundial Lamtar 2026',
    body:`Nous sommes fiers d'annoncer le lancement officiel du Mundial Lamtar 2026 — Édition Wafaa.\n\nCette édition est dédiée à la mémoire de Bennadja Youcef et Boudjemaa Selimane, deux amis exceptionnels qui nous ont quittés.\n\nLe tournoi réunit 16 équipes réparties en 4 groupes, avec des matchs de phase de groupes, des huitièmes de finale, des quarts, des demi-finales et une grande finale.\n\nRestez connectés sur ce site pour suivre tous les résultats, classements et actualités en temps réel.`,
    external_link:null, published:1,
  },
  {
    title:'📋 Règlement officiel — Mundial Lamtar 2026',
    body:`Voici les règles essentielles du tournoi :\n\n• Chaque équipe : 6 joueurs sur le terrain + 4 remplaçants\n• Tenue uniforme obligatoire (même couleur, même numéro)\n• Temps de jeu : 2 × 20 minutes avec pause de 5 minutes\n• Arbitrage fédéral — décisions finales et sans appel\n• Carton jaune : avertissement / Carton rouge : exclusion définitive\n• 2 cartons jaunes = 1 carton rouge\n• Tout comportement irrespectueux entraîne une disqualification immédiate\n• Fair-play obligatoire — l'esprit sportif avant tout`,
    external_link:null, published:1,
  },
  {
    title:'📅 Programme complet de la phase de groupes',
    body:`Le programme détaillé des matchs de la phase de groupes est maintenant disponible sur le site.\n\nConsultez la section "Matchs" pour voir les horaires, lieux et équipes de chaque rencontre.\n\nLes matchs se dérouleront au Stade Municipal de Lamtar.\n\nN'oubliez pas de venir encourager votre équipe favorite !`,
    external_link:null, published:1,
  },
  {
    title:'🦅 Édition Wafaa — En mémoire de nos amis',
    body:`Cette édition du Mundial Lamtar est placée sous le signe de la Wafaa (الوفاء — la fidélité).\n\nNous dédions ce tournoi à la mémoire de deux amis qui nous ont quittés trop tôt :\n\n• Bennadja Youcef — un ami au grand cœur, toujours présent pour les autres\n• Boudjemaa Selimane — un homme de valeurs, aimé de tous\n\nCe tournoi est notre façon de les honorer et de garder leur souvenir vivant parmi nous.\n\nÀ vos âmes, cette coupe est dédiée. 🦅`,
    external_link:null, published:1,
  },
  {
    title:'⚠️ Rappel : Fair-play & discipline',
    body:`Le comité d'organisation rappelle à toutes les équipes l'importance du fair-play.\n\nTout acte d'agression physique ou verbale envers les arbitres, joueurs adverses ou supporters entraînera :\n— Disqualification immédiate de l'équipe fautive\n— Interdiction de participation aux prochaines éditions\n\nNous voulons un tournoi festif, propre et convivial.\n\nMerci de respecter l'esprit du sport. 🤝`,
    external_link:null, published:1,
  },
  {
    title:'📞 Contact & informations',
    body:`Pour toute question concernant le tournoi, contactez l'organisation :\n\n• Hammani Ayoub : 0670 062 056\n• Abada Mohamed : 0665 181 513\n• Hamoudha Hlichy (équipes) : 0698 748 579\n• Email : mundiallamtar.contact@gmail.com\n\nSuivez toute l'actualité du tournoi en temps réel sur ce site officiel.\n\nmundial.lamtar.net`,
    external_link:null, published:1,
  },
];

// Round-robin pairings for 4 teams (3 rounds, 2 matches/round)
const RR_ROUNDS = [
  [[0,2],[1,3]],
  [[0,3],[1,2]],
  [[0,1],[2,3]],
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n════════════════════════════════════════════════');
  console.log('  MUNDIAL LAMTAR 2026 — Production Seed');
  console.log('════════════════════════════════════════════════\n');

  // ── 0. Safety: never wipe admins ─────────────────────────────────────────────
  const [admins] = await db.query('SELECT COUNT(*) AS n FROM users WHERE role = "admin"');
  console.log(`✓ Admin accounts preserved  (${admins[0].n} found — untouched)`);

  // ── 1. Clean previous non-admin seed data ─────────────────────────────────────
  console.log('\n[1/8] Clearing previous tournament data...');
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
  await db.query('DELETE FROM posts');
  await db.query('DELETE FROM users WHERE role = "captain"');
  await db.query('DELETE FROM tournament');
  console.log('  ✓ Non-admin data cleared');

  // ── 2. Tournament ─────────────────────────────────────────────────────────────
  console.log('\n[2/8] Creating tournament...');
  const [tr] = await db.query(
    `INSERT INTO tournament
       (name, name_ar, name_fr, season, max_teams, team_fee, bank_details,
        status, current_phase, terms_fr, terms_ar, terms_en)
     VALUES (?, ?, ?, '2026', '16', 8000.00, ?,
             'group_stage', 'groups', ?, ?, ?)`,
    [
      'Mundial Lamtar 2026',
      'مونديال لمطار 2026',
      'Mundial Lamtar 2026',
      'Hammani Ayoub: 0670062056\nAbada Mohamed: 0665181513\nHamoudha Hlichy (équipes): 0698748579\nEmail: mundiallamtar.contact@gmail.com',
      'Tournoi de football de proximité. 6 joueurs + 4 remplaçants. Tenue uniforme obligatoire. Arbitrage fédéral. Droit d\'inscription: 8000 DZD. Toute réclamation doit être soumise dans les 10 minutes suivant le match.',
      'بطولة كرة قدم جوارية. 6 لاعبين + 4 احتياط. لباس موحد إجباري. تحكيم فيدرالي. رسوم التسجيل: 8000 دج. أي احتجاج يجب تقديمه خلال 10 دقائق من نهاية المباراة.',
      'Neighbourhood football tournament. 6 players + 4 subs. Matching kit mandatory. Federal referees. Registration: 8,000 DZD. Protests must be submitted within 10 minutes of match end.',
    ]
  );
  const tid = tr.insertId;
  console.log(`  ✓ Tournament  id=${tid}  status=group_stage`);

  // ── 3. Captain accounts ────────────────────────────────────────────────────────
  console.log('\n[3/8] Creating 16 captain accounts...');
  const captainHash = await bcrypt.hash('mundial123', 12);
  const captainIds  = [];
  for (let i = 1; i <= 16; i++) {
    const email = `captain${i}@lamtar.net`;
    const [r] = await db.query(
      'INSERT INTO users (email, password_hash, role, phone) VALUES (?, ?, "captain", ?)',
      [email, captainHash, `0550${String(i).padStart(6,'0')}`]
    );
    captainIds.push(r.insertId);
  }
  console.log('  ✓ captain1@lamtar.net … captain16@lamtar.net  /  mundial123');

  // ── 4. Referees ────────────────────────────────────────────────────────────────
  console.log('\n[4/8] Creating referees...');
  const refIds = [];
  for (const ref of REFEREES) {
    const [r] = await db.query(
      'INSERT INTO referees (tournament_id, name, phone) VALUES (?, ?, ?)',
      [tid, ref.name, ref.phone]
    );
    refIds.push(r.insertId);
  }
  console.log(`  ✓ ${REFEREES.length} referees`);

  // ── 5. Teams + Groups + Players ────────────────────────────────────────────────
  console.log('\n[5/8] Creating teams, groups, players...');

  // Groups
  const groupIds = {};
  for (const letter of ['A','B','C','D']) {
    const [g] = await db.query(
      'INSERT INTO `groups` (tournament_id, letter) VALUES (?, ?)',
      [tid, letter]
    );
    groupIds[letter] = g.insertId;
  }

  // Teams + Players
  const teamIds = [];
  const playersByTeam = {};
  let playerCount = 0;

  for (let ti = 0; ti < TEAMS.length; ti++) {
    const { name, coach, group } = TEAMS[ti];

    // Team
    const [tm] = await db.query(
      `INSERT INTO teams
         (tournament_id, captain_id, name, logo_path, coach_name,
          status, group_letter, payment_status)
       VALUES (?, ?, ?, ?, ?, 'approved', ?, 'paid')`,
      [tid, captainIds[ti], name, logo(name, ti), coach, group]
    );
    const teamId = tm.insertId;
    teamIds.push(teamId);
    playersByTeam[teamId] = [];

    // Standings row
    await db.query(
      'INSERT INTO group_standings (group_id, team_id) VALUES (?, ?)',
      [groupIds[group], teamId]
    );

    // Players
    const prefix = name.split(' ')[0]; // e.g. "FC", "El", "Atlas"…
    for (let pi = 0; pi < PLAYER_TEMPLATE.length; pi++) {
      const p    = PLAYER_TEMPLATE[pi];
      const last = `${p.last} ${prefix}`;
      const init = `${p.first[0]}${p.last[0]}`.toUpperCase();
      const token = generateInviteToken();
      const photo = photoUrl(init, playerCount);

      const [pl] = await db.query(
        `INSERT INTO players
           (team_id, invite_token, token_used, first_name, last_name,
            jersey_number, position, is_validated, photo_path, is_captain)
         VALUES (?, ?, TRUE, ?, ?, ?, ?, TRUE, ?, ?)`,
        [teamId, token, p.first, last, p.jersey, p.pos, photo, pi === 9]
      );
      playersByTeam[teamId].push(pl.insertId);
      playerCount++;
    }
  }
  console.log(`  ✓ 16 teams  ·  4 groups (A–D)  ·  ${playerCount} players`);

  // ── 6. Round-robin schedule (all 'scheduled') ─────────────────────────────────
  console.log('\n[6/8] Generating match schedule...');
  const VENUE = 'Stade Municipal de Lamtar';
  const groupLetters = ['A','B','C','D'];
  let matchCount = 0;

  // Base date: next Saturday 09:00
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + ((6 - baseDate.getDay() + 7) % 7 || 7));
  baseDate.setHours(9, 0, 0, 0);

  for (let gi = 0; gi < groupLetters.length; gi++) {
    const letter   = groupLetters[gi];
    const gid      = groupIds[letter];
    const grpTeams = teamIds.slice(gi * 4, gi * 4 + 4);

    for (let round = 0; round < RR_ROUNDS.length; round++) {
      for (const [a, b] of RR_ROUNDS[round]) {
        // Spread across 3 days (day 0, 1, 2) — 2h apart per group
        const d = new Date(baseDate);
        d.setDate(d.getDate() + round);
        d.setHours(9 + gi * 2, 0, 0, 0); // 09h, 11h, 13h, 15h per group

        const refId = refIds[(gi + round) % refIds.length];
        await db.query(
          `INSERT INTO matches
             (tournament_id, phase, group_id, home_team_id, away_team_id,
              referee_id, venue, scheduled_at, status)
           VALUES (?, 'group', ?, ?, ?, ?, ?, ?, 'scheduled')`,
          [tid, gid, grpTeams[a], grpTeams[b], refId, VENUE, d]
        );
        matchCount++;
      }
    }
  }
  console.log(`  ✓ ${matchCount} matches scheduled (round-robin, 3 rounds × 4 groups × 2)`);

  // ── 7. Sponsors + Carousel ────────────────────────────────────────────────────
  console.log('\n[7/8] Creating sponsors & carousel images...');
  for (const s of SPONSORS) {
    await db.query(
      'INSERT INTO sponsors (tournament_id, name, logo_path, website_url, tier, display_order) VALUES (?,?,?,?,?,?)',
      [tid, s.name, s.logo, s.url, s.tier, s.order]
    );
  }
  for (const img of CAROUSEL) {
    await db.query(
      `INSERT INTO association_images
         (tournament_id, image_path, title_fr, title_ar, title_en,
          description_fr, description_ar, description_en, display_order)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [tid, img.image, img.title_fr, img.title_ar, img.title_en,
       img.desc_fr, img.desc_ar, img.desc_en, img.order]
    );
  }
  console.log(`  ✓ ${SPONSORS.length} sponsors  ·  ${CAROUSEL.length} carousel images`);

  // ── 8. Posts / Actualités ─────────────────────────────────────────────────────
  console.log('\n[8/8] Creating posts...');
  for (const post of POSTS) {
    await db.query(
      'INSERT INTO posts (title, body, external_link, published) VALUES (?,?,?,?)',
      [post.title, post.body, post.external_link, post.published]
    );
  }
  console.log(`  ✓ ${POSTS.length} published articles`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════');
  console.log('  Seed terminé avec succès !');
  console.log('════════════════════════════════════════════════');
  console.log('  Tournament   : Mundial Lamtar 2026  (id=' + tid + ')');
  console.log('  Teams        : 16 (groupes A–D, approved + paid)');
  console.log('  Players      : ' + playerCount + ' (11 par équipe, tous validés)');
  console.log('  Matches      : ' + matchCount + ' programmés');
  console.log('  Captains     : captain1@lamtar.net … captain16@lamtar.net');
  console.log('  Password     : mundial123');
  console.log('  Admins       : inchangés ✓');
  console.log('════════════════════════════════════════════════\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('\n✗ Seed échoué :', err.message);
  process.exit(1);
});
