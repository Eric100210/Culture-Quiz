// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
    };

    return NextResponse.json({
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    });
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return NextResponse.json({ message: 'Token invalide ou expiré' }, { status: 403 });
  }
}
