-- ============================================================
-- SHABKA FOOTBALL TOURNAMENT — DATABASE SCHEMA
-- MySQL 8.x | utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS football_tournament
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE football_tournament;

-- ============================================================
-- tournament — global tournament settings (single row)
-- ============================================================
CREATE TABLE tournament (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  name_ar       VARCHAR(150),
  name_fr       VARCHAR(150),
  season        VARCHAR(20),
  max_teams     ENUM('16','32') DEFAULT '16',
  team_fee      DECIMAL(10,2) DEFAULT 0,
  bank_details  TEXT,
  status        ENUM('registration','group_stage','knockout','finished') DEFAULT 'registration',
  current_phase ENUM('groups','round_of_16','quarter_final','semi_final','final') DEFAULT 'groups',
  terms_fr      LONGTEXT,
  terms_ar      LONGTEXT,
  terms_en      LONGTEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- users — captains and admins
-- ============================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('captain','admin') DEFAULT 'captain',
  phone         VARCHAR(30),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- teams
-- ============================================================
CREATE TABLE teams (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id  INT NOT NULL,
  captain_id     INT NOT NULL,
  name           VARCHAR(100) NOT NULL,
  logo_path      VARCHAR(255),
  coach_name     VARCHAR(100),
  coach_phone    VARCHAR(30),
  status         ENUM('pending','approved','rejected','disqualified') DEFAULT 'pending',
  group_letter   VARCHAR(2),
  payment_status ENUM('unpaid','pending_review','paid') DEFAULT 'unpaid',
  payment_proof  VARCHAR(255),
  payment_date   TIMESTAMP NULL,
  approved_at    TIMESTAMP NULL,
  approved_by    INT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id),
  FOREIGN KEY (captain_id)    REFERENCES users(id),
  FOREIGN KEY (approved_by)   REFERENCES users(id)
);

-- ============================================================
-- players
-- ============================================================
CREATE TABLE players (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  team_id       INT NOT NULL,
  invite_token  VARCHAR(64) UNIQUE,
  token_used    BOOLEAN DEFAULT FALSE,
  first_name    VARCHAR(80),
  last_name     VARCHAR(80),
  date_of_birth DATE,
  photo_path    VARCHAR(255),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  jersey_number TINYINT UNSIGNED,
  position      ENUM('GK','DEF','MID','FWD') DEFAULT 'MID',
  is_captain    BOOLEAN DEFAULT FALSE,
  is_validated  BOOLEAN DEFAULT FALSE,
  status        ENUM('active','suspended','disqualified') DEFAULT 'active',
  goals         INT DEFAULT 0,
  yellow_cards  INT DEFAULT 0,
  red_cards     INT DEFAULT 0,
  fines         DECIMAL(10,2) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- ============================================================
-- referees
-- ============================================================
CREATE TABLE referees (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(30),
  email         VARCHAR(150),
  photo_path    VARCHAR(255),
  is_active     BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- groups (poules)
-- ============================================================
CREATE TABLE `groups` (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  letter        VARCHAR(2) NOT NULL,
  UNIQUE KEY uq_tournament_letter (tournament_id, letter),
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- group_standings — live rankings
-- ============================================================
CREATE TABLE group_standings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  group_id       INT NOT NULL,
  team_id        INT NOT NULL,
  played         INT DEFAULT 0,
  won            INT DEFAULT 0,
  drawn          INT DEFAULT 0,
  lost           INT DEFAULT 0,
  goals_for      INT DEFAULT 0,
  goals_against  INT DEFAULT 0,
  goal_diff      INT GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points         INT GENERATED ALWAYS AS (won * 3 + drawn) STORED,
  FOREIGN KEY (group_id) REFERENCES `groups`(id),
  FOREIGN KEY (team_id)  REFERENCES teams(id),
  UNIQUE KEY uq_group_team (group_id, team_id)
);

-- ============================================================
-- matches
-- ============================================================
CREATE TABLE matches (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT NOT NULL,
  phase           ENUM('group','round_of_16','quarter_final','semi_final','final') NOT NULL,
  group_id        INT NULL,
  match_number    INT,
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
  home_score_ht   INT DEFAULT 0,
  away_score_ht   INT DEFAULT 0,
  winner_id       INT NULL,
  man_of_match_id INT NULL,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id)   REFERENCES tournament(id),
  FOREIGN KEY (group_id)        REFERENCES `groups`(id),
  FOREIGN KEY (home_team_id)    REFERENCES teams(id),
  FOREIGN KEY (away_team_id)    REFERENCES teams(id),
  FOREIGN KEY (referee_id)      REFERENCES referees(id),
  FOREIGN KEY (winner_id)       REFERENCES teams(id),
  FOREIGN KEY (man_of_match_id) REFERENCES players(id)
);

-- ============================================================
-- match_events — goals, cards, substitutions
-- ============================================================
CREATE TABLE match_events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  match_id    INT NOT NULL,
  player_id   INT NOT NULL,
  team_id     INT NOT NULL,
  event_type  ENUM('goal','own_goal','yellow_card','red_card','substitution_in','substitution_out','penalty_scored','penalty_missed') NOT NULL,
  minute      TINYINT UNSIGNED,
  extra_time  BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id)  REFERENCES matches(id),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (team_id)   REFERENCES teams(id)
);

-- ============================================================
-- fines
-- ============================================================
CREATE TABLE fines (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  player_id  INT NOT NULL,
  match_id   INT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  reason     VARCHAR(255),
  issued_by  INT NOT NULL,
  paid       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (match_id)  REFERENCES matches(id),
  FOREIGN KEY (issued_by) REFERENCES users(id)
);

-- ============================================================
-- sponsors
-- ============================================================
CREATE TABLE sponsors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  name          VARCHAR(100),
  logo_path     VARCHAR(255),
  website_url   VARCHAR(255),
  display_order INT DEFAULT 0,
  tier          ENUM('gold','silver','bronze') NOT NULL DEFAULT 'bronze',
  is_active     BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- association_images — home page carousel
-- ============================================================
CREATE TABLE association_images (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id  INT NOT NULL,
  image_path     VARCHAR(255) NOT NULL,
  title_fr       VARCHAR(150),
  title_ar       VARCHAR(150),
  title_en       VARCHAR(150),
  description_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  display_order  INT DEFAULT 0,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER $$

-- Update player stats after a match event is inserted
CREATE TRIGGER after_match_event_insert
AFTER INSERT ON match_events
FOR EACH ROW
BEGIN
  IF NEW.event_type = 'goal' OR NEW.event_type = 'penalty_scored' THEN
    UPDATE players SET goals = goals + 1 WHERE id = NEW.player_id;
  ELSEIF NEW.event_type = 'yellow_card' THEN
    UPDATE players SET yellow_cards = yellow_cards + 1 WHERE id = NEW.player_id;
  ELSEIF NEW.event_type = 'red_card' THEN
    UPDATE players SET red_cards = red_cards + 1 WHERE id = NEW.player_id;
  END IF;
END$$

-- Update group standings when a group match is finished
CREATE TRIGGER after_match_finish
AFTER UPDATE ON matches
FOR EACH ROW
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' AND NEW.phase = 'group' THEN
    -- Home team
    UPDATE group_standings SET
      played        = played + 1,
      goals_for     = goals_for + NEW.home_score,
      goals_against = goals_against + NEW.away_score,
      won           = won  + IF(NEW.home_score > NEW.away_score, 1, 0),
      drawn         = drawn + IF(NEW.home_score = NEW.away_score, 1, 0),
      lost          = lost  + IF(NEW.home_score < NEW.away_score, 1, 0)
    WHERE team_id = NEW.home_team_id AND group_id = NEW.group_id;
    -- Away team
    UPDATE group_standings SET
      played        = played + 1,
      goals_for     = goals_for + NEW.away_score,
      goals_against = goals_against + NEW.home_score,
      won           = won  + IF(NEW.away_score > NEW.home_score, 1, 0),
      drawn         = drawn + IF(NEW.away_score = NEW.home_score, 1, 0),
      lost          = lost  + IF(NEW.away_score < NEW.home_score, 1, 0)
    WHERE team_id = NEW.away_team_id AND group_id = NEW.group_id;
  END IF;
END$$

DELIMITER ;
