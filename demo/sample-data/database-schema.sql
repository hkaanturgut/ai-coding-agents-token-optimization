-- Current production schema (needs refactoring)

CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id INT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
  id INT PRIMARY KEY,
  post_id INT,
  comment_id INT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issues with this schema:
-- 1. No indexes on foreign keys (posts.user_id, comments.user_id, etc.)
-- 2. No UUID support for distributed systems
-- 3. Missing updated_at columns
-- 4. No soft deletes
-- 5. VARCHAR(255) too long for emails
-- 6. INT ids limit to 2.1B rows
-- 7. No constraints on foreign keys
-- 8. No composite indexes for common queries
