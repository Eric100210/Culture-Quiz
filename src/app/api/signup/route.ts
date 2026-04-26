import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';  // Importe le pool de connexions
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  try {
    // Vérifie si l'utilisateur existe déjà
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      return NextResponse.json({ message: 'Utilisateur déjà existant' }, { status: 400 });
    }

    // Chiffre le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insère l'utilisateur dans la base de données avec le mot de passe chiffré
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    const userId = result.rows[0].id;

    // Initialise les stats de l'utilisateur dans la table user_stats
    await pool.query(
      'INSERT INTO user_stats (user_id, best_score_quick, best_score_endurance, good_answers, wrong_answers) VALUES ($1, 0, 0, 0, 0)',
      [userId]
    );

    // Crée un token JWT
    const token = jwt.sign({ id: userId, email, username }, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json(
      { message: 'Compte créé avec succès', token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
