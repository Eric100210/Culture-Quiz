import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Récupérer les données de la requête (email et password)
    const { email, password } = await req.json();

    // Vérifier si l'utilisateur existe
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Comparer les mots de passe
    const user = userCheck.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }  // Le token expire dans 1 heure
    );

    // Retourner le token
    return NextResponse.json({
      message: 'Connexion réussie',
      token,  // Renvoie le token à l'utilisateur
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json({ message: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
