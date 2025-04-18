-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  score_total INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Référence à l'utilisateur
  best_quick_quiz_score INTEGER DEFAULT 0,  -- Meilleur score en quiz rapide
  best_endurance_quiz_score INTEGER DEFAULT 0,  -- Meilleur score en quiz endurance
  correct_answers INTEGER DEFAULT 0,  -- Nombre de bonnes réponses
  wrong_answers INTEGER DEFAULT 0,  -- Nombre de mauvaises réponses
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date de la dernière mise à jour
);
