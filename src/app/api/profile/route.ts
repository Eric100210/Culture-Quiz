// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Ici, on récupère les données à jour depuis la base
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT id, email, username, age, country, bio FROM users WHERE id = $1', [decoded.id]);

      if (res.rows.length === 0) {
        return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const user = res.rows[0];

      return NextResponse.json(user);
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erreur dans GET /api/profile:', error);
    return NextResponse.json({ message: 'Token invalide ou erreur serveur' }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  console.log("Entrée dans PATCH");
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const userId = decoded.id;
    const { age, country, bio } = await req.json();
    const res = await pool.query(`SELECT age, country, bio FROM users WHERE id = $1`, [userId]);
    const current = res.rows[0];

    // Mettre à jour uniquement les champs qui ont une valeur non vide / définie dans la requête
    const newAge = age === undefined || age === "" ? current.age : parseInt(age, 10);
    const newCountry = country === undefined || country === "" ? current.country : country;
    const newBio = bio === undefined || bio === "" ? current.bio : bio;

    await pool.query(
        `UPDATE users SET age = $1, country = $2, bio = $3 WHERE id = $4`,
        [newAge, newCountry, newBio, userId]
    );

    return NextResponse.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil :', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}