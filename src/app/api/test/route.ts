import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';  // Chemin relatif vers ton fichier db.ts

export async function GET(req: NextRequest) {
  try {
    // Tester la connexion à la base de données avec une requête sur la table users
    const result = await pool.query('SELECT id FROM users LIMIT 1');
    console.log(result.rows);  // Cela devrait retourner la première ligne de la table users

    // Vérifier si la requête a retourné un résultat
    if (result.rows.length > 0) {
      return NextResponse.json({
        message: 'Connexion à la base de données réussie',
        userId: result.rows[0].id,  // Utiliser la colonne id de la table users
      });
    } else {
      throw new Error('Aucune donnée retournée par la table users');
    }
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return NextResponse.json({ message: 'Erreur de connexion à la base de données' }, { status: 500 });
  }
}
