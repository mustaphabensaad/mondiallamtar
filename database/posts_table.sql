-- Run this in phpMyAdmin to add posts feature
CREATE TABLE IF NOT EXISTS posts (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  body          TEXT,
  image_path    VARCHAR(500)  DEFAULT NULL,
  external_link VARCHAR(500)  DEFAULT NULL,
  published     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
