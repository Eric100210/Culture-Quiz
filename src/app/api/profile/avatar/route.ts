import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'avatars';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

function storageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/${path}`;
}

function publicUrl(userId: number) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${userId}`;
}

function authHeaders() {
  return { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` };
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { id: number };

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Fichier manquant' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Format non supporté (jpg, png, webp, gif)' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Fichier trop lourd (max 2 Mo)' }, { status: 400 });
    }

    const upload = await fetch(storageUrl(`${BUCKET}/${decoded.id}`), {
      method: 'PUT',
      headers: {
        ...authHeaders(),
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: await file.arrayBuffer(),
    });

    if (!upload.ok) {
      const err = await upload.text();
      console.error('Supabase Storage upload error:', err);
      return NextResponse.json({ message: 'Erreur lors du stockage' }, { status: 500 });
    }

    const avatarUrl = publicUrl(decoded.id);
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, decoded.id]);

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (error) {
    console.error('Erreur upload avatar:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { id: number };

    await fetch(storageUrl(`${BUCKET}/${decoded.id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });

    await pool.query('UPDATE users SET avatar_url = NULL WHERE id = $1', [decoded.id]);
    return NextResponse.json({ message: 'Photo supprimée' });
  } catch (error) {
    console.error('Erreur suppression avatar:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
