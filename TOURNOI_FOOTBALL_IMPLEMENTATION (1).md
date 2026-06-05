# 🏆 Plateforme Tournoi de Football — Guide d'Implémentation Complet

> Stack : **React.js** (frontend) · **Node.js / Express** (backend) · **MySQL** (base de données) · **Socket.io** (temps réel) · **JWT** (auth)

---

## 📋 Table des Matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Structure du dépôt](#3-structure-du-dépôt)
4. [Base de données — Schéma complet](#4-base-de-données--schéma-complet)
5. [Backend — API REST complète](#5-backend--api-rest-complète)
6. [Authentification & Rôles](#6-authentification--rôles)
7. [WebSockets — Live Match](#7-websockets--live-match)
8. [Frontend — Pages & Composants](#8-frontend--pages--composants)
9. [Système de tournoi (phases)](#9-système-de-tournoi-phases)
10. [Upload fichiers & paiements](#10-upload-fichiers--paiements)
11. [Internationalisation (AR/FR/EN)](#11-internationalisation-arfren)
12. [Dark / Light Mode](#12-dark--light-mode)
13. [Design System & UI](#13-design-system--ui)
14. [Variables d'environnement](#14-variables-denvironnement)
15. [Installation pas-à-pas](#15-installation-pas-à-pas)
16. [Déploiement](#16-déploiement)
17. [Améliorations futures](#17-améliorations-futures)

---

## 1. Vue d'ensemble du projet

### Objectif
Plateforme web complète pour gérer un tournoi de football associatif avec :
- Phase de groupes (Poule) → Phase éliminatoire directe
- 16 ou 32 équipes (configurable par l'admin)
- Inscription des équipes par le capitaine uniquement
- Paiement par virement bancaire avec upload de preuve
- Live match en temps réel via WebSockets
- Interface multilingue AR / FR / EN
- Dark mode / Light mode
- 100% responsive (mobile-first)

### Rôles utilisateurs
| Rôle | Accès |
|------|-------|
| **Visiteur** | Home, matchs, classements, équipes (lecture) |
| **Capitaine** | Inscription équipe, gestion joueurs, paiement, profil équipe |
| **Joueur** | Remplir son profil via lien d'invitation |
| **Admin** | Tout gérer : scores, cartons, arbitres, planning, amendes, approbation |

---

## 2. Architecture technique

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (React)                     │
│  React 18 · Vite · TailwindCSS · i18next · Socket.io│
│  React Query · React Router v6 · Zustand (store)    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST + WebSocket
┌──────────────────────▼──────────────────────────────┐
│               BACKEND (Node.js / Express)            │
│  Express · Socket.io · JWT · Multer · Sharp         │
│  Nodemailer · bcrypt · Joi (validation)             │
└──────────────────────┬──────────────────────────────┘
                       │ MySQL2 (pool de connexions)
┌──────────────────────▼──────────────────────────────┐
│                  BASE DE DONNÉES                     │
│                MySQL 8.x                            │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  FICHIERS STATIQUES                  │
│  /uploads (preuves paiement, logos, photos joueurs) │
│  Recommandé en prod : Cloudinary ou AWS S3          │
└─────────────────────────────────────────────────────┘
```

---

## 3. Structure du dépôt

```
football-tournament/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # Pool MySQL
│   │   │   └── socket.js              # Init Socket.io
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── team.controller.js
│   │   │   ├── player.controller.js
│   │   │   ├── match.controller.js
│   │   │   ├── group.controller.js
│   │   │   ├── knockout.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── referee.controller.js
│   │   │   ├── sponsor.controller.js
│   │   │   └── tournament.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # Vérif JWT
│   │   │   ├── role.middleware.js     # Admin / Captain guard
│   │   │   ├── upload.middleware.js   # Multer config
│   │   │   └── validate.middleware.js # Joi validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── team.routes.js
│   │   │   ├── player.routes.js
│   │   │   ├── match.routes.js
│   │   │   ├── group.routes.js
│   │   │   ├── knockout.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── referee.routes.js
│   │   │   └── tournament.routes.js
│   │   ├── services/
│   │   │   ├── tournament.service.js  # Logique phases / groupes
│   │   │   ├── bracket.service.js     # Génération tableau élim.
│   │   │   ├── email.service.js       # Envoi emails / liens joueurs
│   │   │   └── socket.service.js      # Événements WS live match
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   └── app.js                     # Entry point Express
│   ├── uploads/                       # Fichiers uploadés (dev)
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   ├── logos/                     # Logos équipes disponibles
│   │   ├── locales/
│   │   │   ├── ar/translation.json
│   │   │   ├── fr/translation.json
│   │   │   └── en/translation.json
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx        # Sponsor (gauche) + MOTM (droite)
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── home/
│   │   │   │   ├── HeroCarousel.jsx   # Photos associations avec description
│   │   │   │   ├── TodayMatches.jsx
│   │   │   │   ├── TopScorers.jsx
│   │   │   │   ├── PastMatches.jsx
│   │   │   │   └── WorldCupSection.jsx
│   │   │   ├── match/
│   │   │   │   ├── MatchCard.jsx
│   │   │   │   ├── LiveMatchScreen.jsx
│   │   │   │   ├── MatchTimer.jsx
│   │   │   │   └── ScoreBoard.jsx
│   │   │   ├── team/
│   │   │   │   ├── TeamCard.jsx
│   │   │   │   ├── TeamList.jsx
│   │   │   │   └── TeamProfile.jsx
│   │   │   ├── player/
│   │   │   │   ├── PlayerCard.jsx
│   │   │   │   ├── PlayerForm.jsx     # Formulaire invitation joueur
│   │   │   │   └── PlayerList.jsx
│   │   │   ├── tournament/
│   │   │   │   ├── GroupStage.jsx
│   │   │   │   ├── KnockoutBracket.jsx
│   │   │   │   └── Standings.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── MatchManager.jsx
│   │   │   │   ├── TeamApproval.jsx
│   │   │   │   ├── CardManager.jsx
│   │   │   │   ├── FineManager.jsx
│   │   │   │   └── RefereeManager.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Spinner.jsx
│   │   │       ├── LanguageSwitcher.jsx
│   │   │       └── ThemeToggle.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── Matches.jsx
│   │   │   ├── Standings.jsx
│   │   │   ├── TournamentBracket.jsx
│   │   │   ├── LiveMatch.jsx
│   │   │   ├── Terms.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx       # Capitaine seulement
│   │   │   ├── captain/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── TeamSetup.jsx
│   │   │   │   ├── PlayerInvites.jsx
│   │   │   │   ├── Payment.jsx
│   │   │   │   └── MyTeam.jsx
│   │   │   ├── player/
│   │   │   │   └── InviteForm.jsx     # Page publique via token
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── TeamsAdmin.jsx
│   │   │       ├── MatchesAdmin.jsx
│   │   │       ├── PlayersAdmin.jsx
│   │   │       ├── RefereesAdmin.jsx
│   │   │       ├── TournamentAdmin.jsx
│   │   │       └── ReportsAdmin.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   ├── useTournament.js
│   │   │   └── useTheme.js
│   │   ├── store/
│   │   │   ├── auth.store.js          # Zustand
│   │   │   ├── match.store.js
│   │   │   └── theme.store.js
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + interceptors
│   │   ├── i18n/
│   │   │   └── index.js               # Config i18next
│   │   ├── router/
│   │   │   └── index.jsx              # React Router routes
│   │   ├── styles/
│   │   │   └── globals.css            # TailwindCSS + variables CSS
│   │   └── main.jsx
│   ├── .env
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 4. Base de données — Schéma complet

```sql
-- ============================================================
-- CRÉATION BASE DE DONNÉES
-- ============================================================
CREATE DATABASE IF NOT EXISTS football_tournament
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE football_tournament;

-- ============================================================
-- TABLE : tournament (paramètres globaux)
-- ============================================================
CREATE TABLE tournament (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  name_ar         VARCHAR(150),
  name_fr         VARCHAR(150),
  season          VARCHAR(20),
  max_teams       ENUM('16','32') DEFAULT '16',
  team_fee        DECIMAL(10,2) DEFAULT 0,
  bank_details    TEXT,           -- RIB / IBAN affiché aux capitaines
  status          ENUM('registration','group_stage','knockout','finished') DEFAULT 'registration',
  current_phase   ENUM('groups','round_of_16','quarter_final','semi_final','final') DEFAULT 'groups',
  terms_fr        LONGTEXT,
  terms_ar        LONGTEXT,
  terms_en        LONGTEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : users (capitaines + admins)
-- ============================================================
CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('captain','admin') DEFAULT 'captain',
  phone           VARCHAR(30),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : teams
-- ============================================================
CREATE TABLE teams (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  captain_id      INT NOT NULL,
  name            VARCHAR(100) NOT NULL,
  logo_path       VARCHAR(255),       -- logo choisi parmi les logos disponibles
  coach_name      VARCHAR(100),
  coach_phone     VARCHAR(30),
  status          ENUM('pending','approved','rejected','disqualified') DEFAULT 'pending',
  group_letter    VARCHAR(2),         -- A, B, C, D... (assigné par admin)
  payment_status  ENUM('unpaid','pending_review','paid') DEFAULT 'unpaid',
  payment_proof   VARCHAR(255),       -- chemin fichier upload
  payment_date    TIMESTAMP NULL,
  approved_at     TIMESTAMP NULL,
  approved_by     INT NULL,           -- FK users.id (admin)
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id),
  FOREIGN KEY (captain_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================================
-- TABLE : players
-- ============================================================
CREATE TABLE players (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  team_id         INT NOT NULL,
  invite_token    VARCHAR(64) UNIQUE,  -- token lien d'invitation
  token_used      BOOLEAN DEFAULT FALSE,
  first_name      VARCHAR(80),
  last_name       VARCHAR(80),
  date_of_birth   DATE,
  photo_path      VARCHAR(255),
  phone           VARCHAR(30),
  email           VARCHAR(150),
  jersey_number   TINYINT UNSIGNED,
  position        ENUM('GK','DEF','MID','FWD') DEFAULT 'MID',
  is_captain      BOOLEAN DEFAULT FALSE,
  is_validated    BOOLEAN DEFAULT FALSE,  -- validé par admin
  status          ENUM('active','suspended','disqualified') DEFAULT 'active',
  goals           INT DEFAULT 0,
  yellow_cards    INT DEFAULT 0,
  red_cards       INT DEFAULT 0,
  fines           DECIMAL(10,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- ============================================================
-- TABLE : referees (arbitres)
-- ============================================================
CREATE TABLE referees (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  name            VARCHAR(100) NOT NULL,
  phone           VARCHAR(30),
  email           VARCHAR(150),
  photo_path      VARCHAR(255),
  is_active       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- TABLE : groups (poules)
-- ============================================================
CREATE TABLE groups (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  letter          VARCHAR(2) NOT NULL,  -- A, B, C...
  UNIQUE KEY (tournament_id, letter),
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- TABLE : group_standings (classement en temps réel)
-- ============================================================
CREATE TABLE group_standings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  group_id        INT NOT NULL,
  team_id         INT NOT NULL,
  played          INT DEFAULT 0,
  won             INT DEFAULT 0,
  drawn           INT DEFAULT 0,
  lost            INT DEFAULT 0,
  goals_for       INT DEFAULT 0,
  goals_against   INT DEFAULT 0,
  goal_diff       INT GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points          INT GENERATED ALWAYS AS (won*3 + drawn) STORED,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  UNIQUE KEY (group_id, team_id)
);

-- ============================================================
-- TABLE : matches
-- ============================================================
CREATE TABLE matches (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  phase           ENUM('group','round_of_16','quarter_final','semi_final','final') NOT NULL,
  group_id        INT NULL,           -- NULL si phase éliminatoire
  match_number    INT,                -- numéro de match dans la phase
  home_team_id    INT,
  away_team_id    INT,
  referee_id      INT,
  venue           VARCHAR(150),
  scheduled_at    DATETIME,
  started_at      DATETIME NULL,
  ended_at        DATETIME NULL,
  status          ENUM('scheduled','live','finished','cancelled') DEFAULT 'scheduled',
  home_score      INT DEFAULT 0,
  away_score      INT DEFAULT 0,
  home_score_ht   INT DEFAULT 0,      -- mi-temps
  away_score_ht   INT DEFAULT 0,
  winner_id       INT NULL,           -- pour phases éliminatoires
  man_of_match_id INT NULL,           -- FK players.id
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id),
  FOREIGN KEY (referee_id) REFERENCES referees(id),
  FOREIGN KEY (winner_id) REFERENCES teams(id),
  FOREIGN KEY (man_of_match_id) REFERENCES players(id)
);

-- ============================================================
-- TABLE : match_events (buts, cartons, remplacements)
-- ============================================================
CREATE TABLE match_events (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  match_id        INT NOT NULL,
  player_id       INT NOT NULL,
  team_id         INT NOT NULL,
  event_type      ENUM('goal','own_goal','yellow_card','red_card','substitution_in','substitution_out','penalty_scored','penalty_missed') NOT NULL,
  minute          TINYINT UNSIGNED,
  extra_time      BOOLEAN DEFAULT FALSE,
  description     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- ============================================================
-- TABLE : fines (amendes)
-- ============================================================
CREATE TABLE fines (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  player_id       INT NOT NULL,
  match_id        INT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  reason          VARCHAR(255),
  issued_by       INT NOT NULL,       -- admin id
  paid            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (issued_by) REFERENCES users(id)
);

-- ============================================================
-- TABLE : sponsors
-- ============================================================
CREATE TABLE sponsors (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  name            VARCHAR(100),
  logo_path       VARCHAR(255),
  website_url     VARCHAR(255),
  display_order   INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- TABLE : association_images (carousel home page)
-- ============================================================
CREATE TABLE association_images (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  image_path      VARCHAR(255) NOT NULL,
  title_fr        VARCHAR(150),
  title_ar        VARCHAR(150),
  title_en        VARCHAR(150),
  description_fr  TEXT,
  description_ar  TEXT,
  description_en  TEXT,
  display_order   INT DEFAULT 0,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- TRIGGERS — mise à jour automatique des stats
-- ============================================================

DELIMITER $$

-- Mettre à jour les stats après insertion d'un événement
CREATE TRIGGER after_match_event_insert
AFTER INSERT ON match_events
FOR EACH ROW
BEGIN
  IF NEW.event_type = 'goal' THEN
    UPDATE players SET goals = goals + 1 WHERE id = NEW.player_id;
  ELSEIF NEW.event_type = 'yellow_card' THEN
    UPDATE players SET yellow_cards = yellow_cards + 1 WHERE id = NEW.player_id;
  ELSEIF NEW.event_type = 'red_card' THEN
    UPDATE players SET red_cards = red_cards + 1 WHERE id = NEW.player_id;
  END IF;
END$$

-- Mettre à jour classement poule après fin de match
CREATE TRIGGER after_match_finish
AFTER UPDATE ON matches
FOR EACH ROW
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' AND NEW.phase = 'group' THEN
    -- Home team stats
    UPDATE group_standings SET
      played = played + 1,
      goals_for = goals_for + NEW.home_score,
      goals_against = goals_against + NEW.away_score,
      won  = won  + IF(NEW.home_score > NEW.away_score, 1, 0),
      drawn = drawn + IF(NEW.home_score = NEW.away_score, 1, 0),
      lost = lost + IF(NEW.home_score < NEW.away_score, 1, 0)
    WHERE team_id = NEW.home_team_id AND group_id = NEW.group_id;
    -- Away team stats
    UPDATE group_standings SET
      played = played + 1,
      goals_for = goals_for + NEW.away_score,
      goals_against = goals_against + NEW.home_score,
      won  = won  + IF(NEW.away_score > NEW.home_score, 1, 0),
      drawn = drawn + IF(NEW.away_score = NEW.home_score, 1, 0),
      lost = lost + IF(NEW.away_score < NEW.home_score, 1, 0)
    WHERE team_id = NEW.away_team_id AND group_id = NEW.group_id;
  END IF;
END$$

DELIMITER ;
```

---

## 5. Backend — API REST complète

### 5.1 Installation dépendances

```bash
cd backend
npm init -y
npm install express mysql2 dotenv cors helmet morgan bcryptjs jsonwebtoken
npm install multer sharp nodemailer joi uuid socket.io
npm install -D nodemon
```

### 5.2 `src/config/db.js`

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

module.exports = pool;
```

### 5.3 `src/app.js`

```javascript
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET','POST'] }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.io (live match)
require('./config/socket')(io);
app.set('io', io);

// Routes
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/tournament',  require('./routes/tournament.routes'));
app.use('/api/teams',       require('./routes/team.routes'));
app.use('/api/players',     require('./routes/player.routes'));
app.use('/api/matches',     require('./routes/match.routes'));
app.use('/api/groups',      require('./routes/group.routes'));
app.use('/api/knockout',    require('./routes/knockout.routes'));
app.use('/api/referees',    require('./routes/referee.routes'));
app.use('/api/payment',     require('./routes/payment.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

### 5.4 Toutes les routes API

#### Auth (`/api/auth`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/register` | Inscription capitaine | Public |
| POST | `/login` | Connexion | Public |
| GET | `/me` | Profil connecté | JWT |
| POST | `/logout` | Déconnexion | JWT |

#### Équipes (`/api/teams`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste toutes les équipes | Public |
| GET | `/:id` | Détail équipe | Public |
| POST | `/` | Créer équipe | Captain |
| PUT | `/:id` | Modifier équipe | Captain (own) |
| GET | `/:id/players` | Joueurs de l'équipe | Public |
| GET | `/:id/matches` | Matchs de l'équipe | Public |
| GET | `/:id/stats` | Stats équipe (cartons, buts...) | Public |

#### Joueurs (`/api/players`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/invite/:token` | Vérifier token invitation | Public |
| POST | `/invite/:token` | Remplir formulaire joueur | Public |
| PUT | `/:id` | Modifier joueur | Admin |
| DELETE | `/:id` | Supprimer joueur | Admin |
| GET | `/top-scorers` | Meilleurs buteurs | Public |

#### Matchs (`/api/matches`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Tous les matchs | Public |
| GET | `/today` | Matchs du jour | Public |
| GET | `/live` | Match en cours | Public |
| GET | `/:id` | Détail match + événements | Public |
| POST | `/:id/start` | Démarrer match | Admin |
| POST | `/:id/end` | Terminer match | Admin |
| POST | `/:id/events` | Ajouter événement (but/carton) | Admin |
| DELETE | `/:id/events/:eventId` | Supprimer événement | Admin |
| PUT | `/:id/score` | Mettre à jour score | Admin |
| PUT | `/:id/motm` | Définir homme du match | Admin |
| PUT | `/:id/schedule` | Modifier planning | Admin |

#### Groupes (`/api/groups`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Tous les groupes + classements | Public |
| GET | `/:letter` | Groupe spécifique | Public |
| POST | `/generate` | Générer groupes (tirage) | Admin |

#### Phase éliminatoire (`/api/knockout`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/bracket` | Tableau complet | Public |
| POST | `/generate` | Générer tableau depuis groupes | Admin |

#### Paiement (`/api/payment`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/upload-proof` | Upload preuve virement | Captain |
| GET | `/status` | Statut paiement équipe | Captain |

#### Admin (`/api/admin`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/teams/pending` | Équipes en attente | Admin |
| PUT | `/teams/:id/approve` | Approuver équipe | Admin |
| PUT | `/teams/:id/reject` | Rejeter équipe | Admin |
| POST | `/fines` | Ajouter amende | Admin |
| GET | `/reports/cards` | Rapport cartons | Admin |
| PUT | `/tournament/settings` | Paramètres tournoi | Admin |
| GET | `/dashboard` | Stats globales | Admin |

---

## 6. Authentification & Rôles

### `src/middleware/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### `src/middleware/role.middleware.js`

```javascript
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
```

### Génération de token d'invitation joueur

```javascript
const { v4: uuidv4 } = require('uuid');

// Dans team.controller.js — générer 13 tokens
async function generatePlayerInvites(req, res) {
  const { team_id } = req.params;
  const tokens = [];
  for (let i = 0; i < 13; i++) {
    const token = uuidv4();
    await db.query(
      'INSERT INTO players (team_id, invite_token) VALUES (?, ?)',
      [team_id, token]
    );
    tokens.push(`${process.env.FRONTEND_URL}/join/${token}`);
  }
  res.json({ links: tokens });
}
```

---

## 7. WebSockets — Live Match

### `src/config/socket.js`

```javascript
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Rejoindre la salle d'un match
    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
```

### `src/services/socket.service.js`

```javascript
// Appelé depuis match.controller.js après chaque action admin
function broadcastMatchUpdate(io, matchId, data) {
  io.to(`match_${matchId}`).emit('match_update', data);
}

function broadcastGoal(io, matchId, eventData) {
  io.to(`match_${matchId}`).emit('goal', eventData);
}

function broadcastCard(io, matchId, eventData) {
  io.to(`match_${matchId}`).emit('card', eventData);
}

function broadcastMatchStart(io, matchId) {
  io.to(`match_${matchId}`).emit('match_started', { matchId, time: new Date() });
}

function broadcastMatchEnd(io, matchId, finalScore) {
  io.to(`match_${matchId}`).emit('match_ended', { matchId, finalScore });
}

module.exports = { broadcastMatchUpdate, broadcastGoal, broadcastCard, broadcastMatchStart, broadcastMatchEnd };
```

### Frontend — `hooks/useSocket.js`

```javascript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL);

export function useSocket(matchId, handlers) {
  useEffect(() => {
    socket.emit('join_match', matchId);
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    return () => {
      Object.keys(handlers).forEach(event => socket.off(event));
    };
  }, [matchId]);

  return socket;
}
```

---

## 8. Frontend — Pages & Composants

### 8.1 Installation

```bash
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom axios zustand @tanstack/react-query
npm install socket.io-client i18next react-i18next i18next-http-backend
npm install react-hook-form @hookform/resolvers zod
npm install react-hot-toast framer-motion
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 8.2 Structure des routes (`router/index.jsx`)

```jsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// Pages publiques
import Home from '../pages/Home';
import Teams from '../pages/Teams';
import Matches from '../pages/Matches';
import Standings from '../pages/Standings';
import TournamentBracket from '../pages/TournamentBracket';
import LiveMatch from '../pages/LiveMatch';
import Terms from '../pages/Terms';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Capitaine
import CaptainDashboard from '../pages/captain/Dashboard';
import TeamSetup from '../pages/captain/TeamSetup';
import PlayerInvites from '../pages/captain/PlayerInvites';
import Payment from '../pages/captain/Payment';
import MyTeam from '../pages/captain/MyTeam';

// Joueur
import InviteForm from '../pages/player/InviteForm';

// Admin
import AdminDashboard from '../pages/admin/Dashboard';
// ... autres pages admin

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'teams', element: <Teams /> },
      { path: 'matches', element: <Matches /> },
      { path: 'standings', element: <Standings /> },
      { path: 'bracket', element: <TournamentBracket /> },
      { path: 'live', element: <LiveMatch /> },
      { path: 'terms', element: <Terms /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'join/:token', element: <InviteForm /> },
      // Routes protégées capitaine
      { path: 'captain/dashboard', element: <CaptainDashboard /> },
      { path: 'captain/team', element: <TeamSetup /> },
      { path: 'captain/invites', element: <PlayerInvites /> },
      { path: 'captain/payment', element: <Payment /> },
      { path: 'captain/my-team', element: <MyTeam /> },
      // Routes admin
      { path: 'admin', element: <AdminDashboard /> },
    ]
  }
]);
```

### 8.3 Page Home — layout en 3 colonnes

```
┌─────────────────────────────────────────────────┐
│                   NAVBAR                         │
├──────────┬──────────────────────────┬────────────┤
│  SPONSOR │    CONTENU PRINCIPAL     │    MOTM    │
│  LOGOS   │                          │  (Man of   │
│  (Left   │  [Carousel associations] │  the match │
│  Sidebar)│  [Matchs du jour]        │  Last game)│
│          │  [Top Buteurs]           │            │
│          │  [Matchs passés]         │            │
│          │  [World Cup 2026]        │            │
└──────────┴──────────────────────────┴────────────┘
│                    FOOTER                        │
└─────────────────────────────────────────────────┘
```

Sur mobile : colonnes latérales passent en bas de page.

---

## 9. Système de tournoi (phases)

### 9.1 Logique de génération des groupes (`tournament.service.js`)

```javascript
// Pour 16 équipes : 4 groupes de 4 (A, B, C, D)
// Pour 32 équipes : 8 groupes de 4 (A, B, C, D, E, F, G, H)

async function generateGroups(tournamentId, approvedTeams) {
  const shuffled = approvedTeams.sort(() => Math.random() - 0.5);
  const groupCount = shuffled.length === 16 ? 4 : 8;
  const letters = 'ABCDEFGH'.slice(0, groupCount).split('');

  for (const letter of letters) {
    const [group] = await db.query(
      'INSERT INTO groups (tournament_id, letter) VALUES (?, ?)',
      [tournamentId, letter]
    );
    // Assigner les équipes au groupe
    const teamsInGroup = shuffled.splice(0, 4);
    for (const team of teamsInGroup) {
      await db.query('UPDATE teams SET group_letter = ? WHERE id = ?', [letter, team.id]);
      await db.query(
        'INSERT INTO group_standings (group_id, team_id) VALUES (?, ?)',
        [group.insertId, team.id]
      );
    }
  }
}
```

### 9.2 Qualification et génération tableau éliminatoire (`bracket.service.js`)

```javascript
// Les 2 premiers de chaque groupe se qualifient
// Pour 4 groupes (16 équipes) : 8 matchs en 1/8 (round_of_16)
// Règle standard FIFA : 1er groupe A vs 2ème groupe B, etc.

async function generateKnockout(tournamentId) {
  const groups = await db.query(
    `SELECT gs.*, t.name as team_name FROM group_standings gs
     JOIN teams t ON gs.team_id = t.id
     ORDER BY gs.group_id, gs.points DESC, gs.goal_diff DESC, gs.goals_for DESC`
  );

  // Regrouper par lettre
  const byGroup = {};
  groups.forEach(row => {
    if (!byGroup[row.group_id]) byGroup[row.group_id] = [];
    byGroup[row.group_id].push(row);
  });

  // Créer les matchs éliminatoires
  const groupIds = Object.keys(byGroup);
  const phase = groupIds.length === 4 ? 'quarter_final' : 'round_of_16';

  for (let i = 0; i < groupIds.length; i += 2) {
    const winner_i  = byGroup[groupIds[i]][0];
    const runner_j  = byGroup[groupIds[i+1]][1];
    const winner_j  = byGroup[groupIds[i+1]][0];
    const runner_i  = byGroup[groupIds[i]][1];

    await db.query(
      `INSERT INTO matches (tournament_id, phase, home_team_id, away_team_id, status)
       VALUES (?, ?, ?, ?, 'scheduled')`,
      [tournamentId, phase, winner_i.team_id, runner_j.team_id]
    );
    await db.query(
      `INSERT INTO matches (tournament_id, phase, home_team_id, away_team_id, status)
       VALUES (?, ?, ?, ?, 'scheduled')`,
      [tournamentId, phase, winner_j.team_id, runner_i.team_id]
    );
  }
}
```

---

## 10. Upload fichiers & paiements

### `src/middleware/upload.middleware.js`

```javascript
const multer  = require('multer');
const path    = require('path');
const sharp   = require('sharp');
const fs      = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./uploads/${req.uploadType || 'misc'}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
```

### Route paiement (`payment.routes.js`)

```javascript
router.post('/upload-proof',
  authMiddleware,
  roleMiddleware('captain'),
  (req, res, next) => { req.uploadType = 'payments'; next(); },
  upload.single('proof'),
  async (req, res) => {
    await db.query(
      `UPDATE teams SET payment_proof = ?, payment_status = 'pending_review'
       WHERE captain_id = ?`,
      [req.file.path, req.user.id]
    );
    res.json({ message: 'Preuve envoyée, en attente de validation' });
  }
);
```

---

## 11. Internationalisation (AR/FR/EN)

### `frontend/src/i18n/index.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('lang') || 'fr',
    fallbackLng: 'fr',
    supportedLngs: ['ar', 'fr', 'en'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    interpolation: { escapeValue: false }
  });

// Gérer la direction RTL pour l'arabe
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  localStorage.setItem('lang', lng);
});

export default i18n;
```

### Structure traductions (`public/locales/fr/translation.json`)

```json
{
  "nav": {
    "home": "Accueil",
    "teams": "Équipes",
    "matches": "Matchs",
    "standings": "Classement",
    "bracket": "Tableau",
    "live": "En direct",
    "login": "Connexion",
    "register": "Inscription"
  },
  "home": {
    "today_matches": "Matchs du jour",
    "top_scorers": "Meilleurs buteurs",
    "past_matches": "Matchs passés",
    "world_cup": "Coupe du Monde 2026"
  },
  "team": {
    "name": "Nom de l'équipe",
    "coach": "Entraîneur",
    "captain": "Capitaine",
    "players": "Joueurs",
    "status": {
      "pending": "En attente",
      "approved": "Approuvée",
      "rejected": "Rejetée"
    }
  },
  "payment": {
    "title": "Paiement de l'inscription",
    "instructions": "Effectuez un virement bancaire puis uploadez la preuve",
    "upload": "Uploader la preuve",
    "status": {
      "unpaid": "Non payé",
      "pending_review": "En cours de vérification",
      "paid": "Payé ✓"
    }
  }
}
```

---

## 12. Dark / Light Mode

### `tailwind.config.js`

```javascript
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#16a34a', dark: '#15803d' },
        secondary: { DEFAULT: '#1e40af', dark: '#1d4ed8' },
        surface:   { light: '#ffffff', dark: '#0f172a' },
        card:      { light: '#f8fafc', dark: '#1e293b' },
      }
    }
  }
};
```

### `store/theme.store.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(persist(
  (set) => ({
    theme: 'dark',
    toggle: () => set(state => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),
    init: (theme) => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }),
  { name: 'theme' }
));
```

---

## 13. Design System & UI

### Palette de couleurs

```css
/* globals.css */
:root {
  --color-green:    #16a34a;   /* vert football */
  --color-gold:     #d97706;   /* or accent */
  --color-white:    #f8fafc;
  --color-dark-bg:  #0f172a;
  --color-dark-card:#1e293b;
  --font-display:   'Cairo', sans-serif;    /* Supporte l'arabe */
  --font-body:      'Tajawal', sans-serif;  /* Supporte l'arabe */
}
```

### Fonts recommandées (Google Fonts)
- **Cairo** — titres, supports arabe + latin
- **Tajawal** — corps de texte, supports arabe + latin

```html
<!-- Dans index.html -->
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
```

### Composants UI clés

**Badge statut équipe**
```jsx
const statusColors = {
  pending:    'bg-yellow-100 text-yellow-800',
  approved:   'bg-green-100 text-green-800',
  rejected:   'bg-red-100 text-red-800',
  disqualified: 'bg-gray-100 text-gray-800',
};

export function StatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {t(`team.status.${status}`)}
    </span>
  );
}
```

**Card match**
```jsx
export function MatchCard({ match }) {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-lg
                    border border-gray-100 dark:border-gray-700
                    hover:scale-[1.01] transition-transform">
      <div className="flex items-center justify-between">
        <TeamBadge team={match.home_team} />
        <div className="text-center px-4">
          <span className="text-2xl font-bold text-green-600">
            {match.home_score} – {match.away_score}
          </span>
          {match.status === 'live' && (
            <span className="block text-xs text-red-500 animate-pulse font-bold">
              🔴 LIVE
            </span>
          )}
        </div>
        <TeamBadge team={match.away_team} />
      </div>
    </div>
  );
}
```

---

## 14. Variables d'environnement

### `backend/.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=football_tournament

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
EMAIL_FROM="Tournoi Football <no-reply@tournoi.com>"

# Uploads
MAX_FILE_SIZE=5242880
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME="Tournoi Football"
```

---

## 15. Installation pas-à-pas

### Étape 1 — Prérequis

```bash
# Vérifier les versions
node --version    # >= 18.x
npm --version     # >= 9.x
mysql --version   # >= 8.x
```

### Étape 2 — Cloner et installer

```bash
git clone https://github.com/votre-repo/football-tournament.git
cd football-tournament

# Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### Étape 3 — Créer la base de données

```bash
mysql -u root -p
# Puis dans MySQL :
source /chemin/vers/le/schema.sql
```

### Étape 4 — Créer le premier admin

```bash
# Dans backend/
node scripts/create-admin.js
# Ce script demande email + mot de passe et insère un admin en BDD
```

Le script `scripts/create-admin.js` :
```javascript
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Email admin: ', (email) => {
  rl.question('Mot de passe: ', async (password) => {
    const hash = await bcrypt.hash(password, 12);
    await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, "admin")',
      [email, hash]
    );
    console.log('✅ Admin créé !');
    process.exit(0);
  });
});
```

### Étape 5 — Lancer en développement

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Étape 6 — Créer le dossier uploads

```bash
mkdir -p backend/uploads/{payments,logos,players,associations}
```

---

## 16. Déploiement

### Option recommandée (VPS Linux)

```
Frontend : Vercel ou Nginx (build React)
Backend  : PM2 + Nginx (reverse proxy)
DB       : MySQL sur le même VPS ou PlanetScale (managed)
Files    : Cloudinary (upload images/PDF en prod)
```

### `backend/ecosystem.config.js` (PM2)

```javascript
module.exports = {
  apps: [{
    name: 'football-api',
    script: 'src/app.js',
    env: { NODE_ENV: 'production' },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
  }]
};
```

### Config Nginx

```nginx
server {
  listen 80;
  server_name votre-domaine.com;

  # Frontend (build React)
  location / {
    root /var/www/football/frontend/dist;
    try_files $uri $uri/ /index.html;
  }

  # API Backend
  location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
  }

  # WebSocket
  location /socket.io/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
  }

  # Fichiers uploadés
  location /uploads/ {
    alias /var/www/football/backend/uploads/;
    expires 7d;
  }
}
```

---

## 17. Améliorations futures

| Priorité | Feature |
|----------|---------|
| 🔴 Haute | Notifications push (quand admin approuve l'équipe) |
| 🔴 Haute | Minuteur live automatique côté serveur |
| 🟡 Moyenne | QR Code pour chaque équipe (accès rapide profil) |
| 🟡 Moyenne | Export PDF du tableau des matchs |
| 🟡 Moyenne | World Cup 2026 via API-Football (intégration ultérieure) |
| 🟢 Basse | Application mobile (React Native) |
| 🟢 Basse | Système de vote MOTM par le public |
| 🟢 Basse | Diffusion live commentaires (chat temps réel) |
| 🟢 Basse | Historique des tournois précédents |

---

## ✅ Checklist de développement

### Phase 1 — Fondations (Semaine 1-2)
- [ ] Init dépôt Git, structure dossiers
- [ ] Schéma MySQL + migrations
- [ ] Auth backend (register, login, JWT)
- [ ] Config Socket.io
- [ ] Vite + React + Tailwind + i18n setup

### Phase 2 — Équipes & Joueurs (Semaine 3-4)
- [ ] CRUD équipes (backend + frontend)
- [ ] Système token invitation joueur
- [ ] Formulaire joueur (page publique)
- [ ] Upload preuve paiement
- [ ] Dashboard capitaine

### Phase 3 — Tournoi (Semaine 5-6)
- [ ] Génération groupes (tirage)
- [ ] Classements en temps réel
- [ ] Génération tableau éliminatoire
- [ ] Gestion matchs complets

### Phase 4 — Live & Admin (Semaine 7-8)
- [ ] Écran live match (WebSocket)
- [ ] Interface admin complète
- [ ] Système cartons + amendes
- [ ] Rapports

### Phase 5 — UX & Polish (Semaine 9-10)
- [ ] Dark/light mode parfait
- [ ] RTL arabe complet
- [ ] Responsive mobile total
- [ ] Optimisation perfs (lazy loading, React Query cache)
- [ ] Tests et déploiement

---

*Document généré pour le projet Tournoi de Football — Stack : Node.js / MySQL / React.js*
