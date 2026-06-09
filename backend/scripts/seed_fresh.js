/**
 * seed_fresh.js
 * Clean slate: tournament + 16 captains + 16 teams + 4 referees + sponsors + images.
 * No matches, no groups, no standings, no players, no events.
 * Teams are approved & paid — ready for tirage au sort.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db     = require('../src/config/db');

// ─── Team colors ──────────────────────────────────────────────────────────────
const COLORS = [
  ['16a34a','ffffff'], ['1e40af','ffffff'], ['dc2626','ffffff'], ['d97706','000000'],
  ['7c3aed','ffffff'], ['0891b2','ffffff'], ['be185d','ffffff'], ['059669','ffffff'],
  ['ea580c','ffffff'], ['4f46e5','ffffff'], ['b91c1c','ffffff'], ['0284c7','ffffff'],
  ['c026d3','ffffff'], ['65a30d','ffffff'], ['0d9488','ffffff'], ['9333ea','ffffff'],
];

function logo(name, idx) {
  const [bg, fg] = COLORS[idx % COLORS.length];
  const initials  = name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return `https://placehold.co/80x80/${bg}/${fg}?text=${encodeURIComponent(initials)}`;
}

// ─── 16 Teams (no group assigned) ────────────────────────────────────────────
const TEAMS = [
  { name: 'FC Alger Stars',     coach: 'Youcef Belaïd'    },
  { name: 'El Djazair United',  coach: 'Karim Amrani'     },
  { name: 'Atlas Lions FC',     coach: 'Mourad Sadji'     },
  { name: 'Fennec Warriors',    coach: 'Salim Haddad'     },
  { name: 'Oran Eagles',        coach: 'Bilal Merabet'    },
  { name: 'Constantine FC',     coach: 'Hamza Gherbi'     },
  { name: 'Tlemcen Raiders',    coach: 'Nassim Boucif'    },
  { name: 'Annaba United',      coach: 'Ramzi Ouled'      },
  { name: 'Batna Thunder',      coach: 'Omar Bensalem'    },
  { name: 'Sétif Hawks',        coach: 'Farid Charef'     },
  { name: 'Biskra Desert FC',   coach: 'Tarek Guendouz'   },
  { name: 'Béjaïa Lions',       coach: 'Lyes Oukaci'      },
  { name: 'Blida City',         coach: 'Raouf Meziane'    },
  { name: 'Médéa Stars',        coach: 'Yacine Chekkal'   },
  { name: 'Djelfa Nomads',      coach: 'Anis Benabid'     },
  { name: 'Tiaret FC',          coach: 'Sofiane Khaldi'   },
];

const REFEREES = [
  { name: 'Karim Ziani',       phone: '0661100001' },
  { name: 'Mourad Aouadi',     phone: '0661100002' },
  { name: 'Farid Chebbah',     phone: '0661100003' },
  { name: 'Hichem Benmansour', phone: '0661100004' },
];

const SPONSORS = [
  { name: 'Mobilis', logo: 'https://placehold.co/160x60/16a34a/ffffff?text=Mobilis', url: 'https://mobilis.dz',  tier: 'gold',   order: 1 },
  { name: 'Ooredoo', logo: 'https://placehold.co/160x60/dc2626/ffffff?text=Ooredoo', url: 'https://ooredoo.dz', tier: 'silver', order: 2 },
  { name: 'Djezzy',  logo: 'https://placehold.co/160x60/d97706/000000?text=Djezzy',  url: 'https://djezzy.dz',  tier: 'bronze', order: 3 },
];

const IMAGES = [
  {
    image: 'https://placehold.co/1200x500/0f172a/22c55e?text=Mundial+Lamtar+2026',
    title_fr: 'مونديال لمطار 2026', title_ar: 'مونديال لمطار 2026', title_en: 'Mundial Lamtar 2026',
    desc_fr:  'From us to all – Creativity sans limite',
    desc_ar:  'من عندنا للكل — إبداع بلا حدود',
    desc_en:  'From us to all – Creativity sans limite', order: 1,
  },
  {
    image: 'https://placehold.co/1200x500/1e293b/d97706?text=Edition+Wafaa',
    title_fr: 'طبعة الوفاء 🦅', title_ar: 'طبعة الوفاء 🦅', title_en: 'Wafaa Edition 🦅',
    desc_fr:  'تُهدى هذه النسخة إلى روح الشهيد الطيار بن نجة يوسف',
    desc_ar:  'تُهدى هذه النسخة إلى روح الشهيد الطيار بن نجة يوسف',
    desc_en:  'Dedicated to the memory of martyr pilot Ben Naja Youssef', order: 2,
  },
  {
    image: 'https://placehold.co/1200x500/1e40af/ffffff?text=Register+Now',
    title_fr: 'سجّل فريقك الآن', title_ar: 'سجّل فريقك الآن', title_en: 'Register Your Team Now',
    desc_fr:  '8 000 DZD · 6 لاعبين + 4 احتياط · لباس موحد إجباري',
    desc_ar:  '8 000 دج · 6 لاعبين + 4 احتياط · لباس موحد إجباري',
    desc_en:  '8,000 DZD · 6 players + 4 subs · uniform required', order: 3,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('Wiping database...');

  // Delete in FK-safe order
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

  // Reset auto-increment counters
  for (const t of ['fines','match_events','matches','group_standings','groups',
                    'players','teams','referees','sponsors','association_images','tournament']) {
    await db.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
  }

  console.log('All tables cleared.\n');

  // ── Tournament ──────────────────────────────────────────────────────────────
  const [tr] = await db.query(
    `INSERT INTO tournament
       (name, name_ar, name_fr, season, max_teams, team_fee, bank_details, status, current_phase,
        terms_fr, terms_ar, terms_en)
     VALUES (?, ?, ?, '2026', '16', 8000.00, ?, 'registration', 'groups', ?, ?, ?)`,
    [
      'Mundial Lamtar 2026',
      'مونديال لمطار 2026',
      'Mundial Lamtar 2026',
      'حماني أيوب: 0670062056\nعبادة محمد: 0665181513\nحمودة حليش (فرق): 0698748579\nEmail: mundiallamtar.contact@gmail.com',
      'Tournoi de football de proximité. 6 joueurs + 4 remplaçants. Tenue uniforme obligatoire. Arbitrage fédéral. Droit inscription: 8000 DZD.',
      'بطولة كرة قدم جوارية. 6 لاعبين + 4 احتياط. لباس موحد إجباري. تحكيم فيدرالي. رسوم التسجيل: 8000 دج.',
      'Neighbourhood football tournament. 6 players + 4 subs. Matching kit mandatory. Federal referees. Registration: 8000 DZD.',
    ]
  );
  const tournamentId = tr.insertId;
  console.log(`✓ Tournament created  (id=${tournamentId}, status=registration)`);

  // ── Admin ────────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const [existAdmin] = await db.query('SELECT id FROM users WHERE email = "admin@shabka.dz"');
  if (existAdmin.length === 0) {
    await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, "admin")',
      ['admin@shabka.dz', adminHash]
    );
    console.log('✓ Admin created        admin@shabka.dz / admin123');
  } else {
    console.log('✓ Admin already exists admin@shabka.dz');
  }

  // ── 16 Captains (one per team) ───────────────────────────────────────────────
  const captainHash = await bcrypt.hash('captain123', 12);
  const captainIds  = [];
  for (let i = 1; i <= 16; i++) {
    const email = `captain${i}@shabka.dz`;
    const [r] = await db.query(
      'INSERT INTO users (email, password_hash, role, phone) VALUES (?, ?, "captain", ?)',
      [email, captainHash, `0550000${String(i).padStart(3, '0')}`]
    );
    captainIds.push(r.insertId);
  }
  console.log('✓ 16 captains created  captain1@shabka.dz … captain16@shabka.dz / captain123');

  // ── 4 Referees ───────────────────────────────────────────────────────────────
  for (const ref of REFEREES) {
    await db.query(
      'INSERT INTO referees (tournament_id, name, phone) VALUES (?, ?, ?)',
      [tournamentId, ref.name, ref.phone]
    );
  }
  console.log(`✓ ${REFEREES.length} referees created`);

  // ── 16 Teams (approved + paid, NO group assigned) ────────────────────────────
  for (let i = 0; i < TEAMS.length; i++) {
    const { name, coach } = TEAMS[i];
    await db.query(
      `INSERT INTO teams
         (tournament_id, captain_id, name, logo_path, coach_name, status, group_letter, payment_status)
       VALUES (?, ?, ?, ?, ?, 'approved', NULL, 'paid')`,
      [tournamentId, captainIds[i], name, logo(name, i), coach]
    );
  }
  console.log(`✓ ${TEAMS.length} teams created   (approved, paid, no group assigned)`);

  // ── 2 extra test teams ───────────────────────────────────────────────────────
  // Team 17 — fully valid (approved + paid)
  const [c17] = await db.query(
    'INSERT INTO users (email, password_hash, role, phone) VALUES (?, ?, "captain", ?)',
    ['captain17@shabka.dz', captainHash, '0550000017']
  );
  await db.query(
    `INSERT INTO teams
       (tournament_id, captain_id, name, logo_path, coach_name, status, group_letter, payment_status)
     VALUES (?, ?, ?, ?, ?, 'approved', NULL, 'paid')`,
    [tournamentId, c17.insertId, 'Sahara FC', logo('Sahara FC', 16), 'Khaled Boudiaf']
  );
  console.log('✓ Team 17 created      Sahara FC (approved + paid)  captain17@shabka.dz');

  // Team 18 — registered but no payment proof (pending + unpaid)
  const [c18] = await db.query(
    'INSERT INTO users (email, password_hash, role, phone) VALUES (?, ?, "captain", ?)',
    ['captain18@shabka.dz', captainHash, '0550000018']
  );
  await db.query(
    `INSERT INTO teams
       (tournament_id, captain_id, name, logo_path, coach_name, status, group_letter, payment_status, payment_proof)
     VALUES (?, ?, ?, ?, ?, 'pending', NULL, 'unpaid', NULL)`,
    [tournamentId, c18.insertId, 'Oasis United', logo('Oasis United', 17), 'Rachid Maamar']
  );
  console.log('✓ Team 18 created      Oasis United (pending, no payment proof)  captain18@shabka.dz');

  // ── Sponsors ─────────────────────────────────────────────────────────────────
  for (const s of SPONSORS) {
    await db.query(
      'INSERT INTO sponsors (tournament_id, name, logo_path, website_url, tier, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [tournamentId, s.name, s.logo, s.url, s.tier, s.order]
    );
  }
  console.log(`✓ ${SPONSORS.length} sponsors created`);

  // ── Association images ───────────────────────────────────────────────────────
  for (const img of IMAGES) {
    await db.query(
      `INSERT INTO association_images
         (tournament_id, image_path, title_fr, title_ar, title_en,
          description_fr, description_ar, description_en, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tournamentId, img.image, img.title_fr, img.title_ar, img.title_en,
       img.desc_fr, img.desc_ar, img.desc_en, img.order]
    );
  }
  console.log(`✓ ${IMAGES.length} carousel images created`);

  console.log('\n────────────────────────────────────────────────────');
  console.log('Seed complete. Ready for tirage au sort.');
  console.log('────────────────────────────────────────────────────');
  console.log('Admin    : admin@shabka.dz           / admin123');
  console.log('Captains : captain1@shabka.dz …      / captain123');
  console.log('           captain16@shabka.dz');
  console.log('           captain17@shabka.dz (Sahara FC — approved+paid)');
  console.log('           captain18@shabka.dz (Oasis United — pending, no proof)');
  console.log('────────────────────────────────────────────────────');
  console.log('Next step: Admin → /admin/draw → Démarrer le tirage');

  process.exit(0);
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
