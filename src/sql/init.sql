-- remarque : ce fichier ne fonctionne pas : il faut créer les tables directement dans psql

-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  score_total INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  age INTEGER DEFAULT NULL,
  country TEXT DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Référence à l'utilisateur
  best_score_quick INTEGER DEFAULT 0,  -- Meilleur score en quiz rapide
  best_score_endurance INTEGER DEFAULT 0,  -- Meilleur score en quiz endurance
  good_answers INTEGER DEFAULT 0,  -- Nombre de bonnes réponses
  wrong_answers INTEGER DEFAULT 0,  -- Nombre de mauvaises réponses
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date de la dernière mise à jour
);
