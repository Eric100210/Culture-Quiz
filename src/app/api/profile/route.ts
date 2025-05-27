// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      username: string;
      age: number;
      country: string;
      bio: string;
    };

    return NextResponse.json({
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      age: decoded.age,
      country: decoded.country,
      bio: decoded.bio,
    });
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return NextResponse.json({ message: 'Token invalide ou expiré' }, { status: 403 });
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
    const { username, age, country, bio } = await req.json();
    console.log("Reçu dans PATCH:", username, age, country, bio);

    await pool.query(
        `UPDATE users SET username = $1, age = $2, country = $3, bio = $4 WHERE id = $5`,
        [username, age, country, bio, userId]
    );

    return NextResponse.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil :', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}