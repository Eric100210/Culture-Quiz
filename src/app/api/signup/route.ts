import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';  // Importe le pool de connexions

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
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insère l'utilisateur dans la base de données avec le mot de passe chiffré
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    return NextResponse.json({ message: 'Compte créé avec succès', userId: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
