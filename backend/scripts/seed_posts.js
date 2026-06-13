require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

const POSTS = [
  {
    title: '🏆 Lancement officiel du Mundial Lamtar 2026',
    body: `Le coup d'envoi du Mundial Lamtar 2026 est officiellement donné ! Cette édition spéciale, baptisée "Édition Wafaa", rend hommage à la mémoire de Bennadja Youcef et Boudjemaa Selimane. 16 équipes s'affronteront dans une compétition de haut niveau au Stade Municipal de Lamtar. Les inscriptions sont ouvertes — 8 000 DZD par équipe, 6 joueurs titulaires + 4 remplaçants. Que le meilleur gagne !`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '📋 Règlement complet disponible sur la plateforme',
    body: `Le règlement officiel du tournoi (26 articles) est désormais disponible en ligne. Chaque capitaine est tenu de le lire et d'y adhérer avant le début des matchs. Le règlement couvre les règles de jeu, les sanctions disciplinaires, la procédure d'appel, et les conditions de participation. Rendez-vous sur la page "Règlement" pour en prendre connaissance.`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '📅 Programme des matchs de la phase de groupes',
    body: `Le tirage au sort de la phase de groupes a été effectué ! Les équipes sont réparties en groupes de 4 équipes chacun. Chaque équipe affrontera les 3 autres équipes de son groupe. Les 2 premiers de chaque groupe se qualifient pour le tour suivant. Consultez le tableau complet des matchs sur la page "Matchs" de la plateforme.`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '⚽ Résumé J1 — Des débuts explosifs !',
    body: `La première journée de la phase de groupes a tenu toutes ses promesses. On a assisté à des matchs serrés, des retournements de situation et quelques belles surprises. Le meilleur buteur de la journée a inscrit un triplé. Les supporters étaient nombreux au bord du terrain pour encourager leurs équipes. Retrouvez tous les résultats et les statistiques sur la plateforme.`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '🦅 Édition Wafaa — Un hommage fort et sincère',
    body: `Le Mundial Lamtar 2026 est dédié à la mémoire de deux figures regrettées de notre communauté : Bennadja Slimane Youcef, martyr pilote, et Boudjemaa Selimane. Cette édition "Wafaa" (الوفاء) est un acte de fidélité et de reconnaissance envers ceux qui ont marqué nos vies. Leur esprit accompagne chaque match, chaque but, chaque moment de cette belle compétition.`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '🔴 Attention — Zéro tolérance pour les comportements antisportifs',
    body: `Le comité organisateur rappelle que tout comportement antisportif sera sanctionné avec la plus grande sévérité. Insultes envers les arbitres, bagarres, ou tout acte de violence entraîneront une exclusion immédiate et définitive du tournoi. Le fair-play est la valeur fondamentale de cette compétition. Jouez dans l'esprit du sport !`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '📸 Photos de la cérémonie d\'ouverture',
    body: `La cérémonie d'ouverture du Mundial Lamtar 2026 s'est déroulée dans une ambiance festive et émouvante. Une minute de silence a été observée en hommage à Bennadja Youcef et Boudjemaa Selimane. Les capitaines des 16 équipes participantes ont défilé sous les applaudissements du public. Une soirée mémorable qui restera gravée dans les mémoires.`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '💰 Rappel — Paiement des droits d\'inscription',
    body: `Nous rappelons à tous les capitaines que le paiement des droits d'inscription (8 000 DZD) est obligatoire pour finaliser la participation de leur équipe. Le paiement doit être effectué et la preuve uploadée sur la plateforme. Toute équipe dont le paiement n'est pas confirmé avant la date limite ne pourra pas participer. Contactez l'organisation pour plus d'informations.`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '🏅 Présentation des récompenses du tournoi',
    body: `Les récompenses de cette édition ont été dévoilées ! Au programme : trophée du vainqueur, médailles pour les finalistes, trophée du meilleur buteur, trophée du meilleur gardien, trophée du fair-play, et le titre très convoité d'Homme du Match pour chaque rencontre. Les trophées ont été fabriqués spécialement pour cette édition "Wafaa". À vous de les décrocher !`,
    image_path: null,
    external_link: null,
    published: 1,
  },
  {
    title: '📞 Contacts de l\'organisation — Mundial Lamtar 2026',
    body: `Pour toute question concernant le tournoi, vous pouvez contacter l'organisation via :\n\n📧 Email : mundiallamtar.contact@gmail.com\n📱 Téléphone : 0670 062 056\n\nComité organisateur : Hammani Ayoub & Abada Mohamed\n\nNous restons disponibles pour répondre à toutes vos questions concernant les inscriptions, le règlement, ou tout autre sujet lié à la compétition.`,
    image_path: null,
    external_link: 'mailto:mundiallamtar.contact@gmail.com',
    published: 1,
  },
];

async function seedPosts() {
  try {
    console.log('🌱 Seeding posts...');

    // Clear existing posts
    await db.query('DELETE FROM posts');
    await db.query('ALTER TABLE posts AUTO_INCREMENT = 1');

    for (const post of POSTS) {
      await db.query(
        `INSERT INTO posts (title, body, image_path, external_link, published)
         VALUES (?, ?, ?, ?, ?)`,
        [post.title, post.body, post.image_path, post.external_link, post.published]
      );
      console.log(`  ✅ "${post.title.slice(0, 50)}..."`);
    }

    console.log(`\n✨ ${POSTS.length} articles insérés avec succès !`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

seedPosts();
