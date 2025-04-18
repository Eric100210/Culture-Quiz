import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function getUserIdFromToken(req: NextRequest): number | null {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET – Récupérer les stats de l'utilisateur
export async function GET(req: NextRequest) {
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const result = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Aucune statistique trouvée' }, { status: 404 });
    }

    return NextResponse.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH – Mettre à jour les statistiques après un quiz
export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { mode, score, goodAnswers, badAnswers } = await req.json();

    const current = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);

    // Si aucune ligne n'existe, on en crée une
    if (current.rows.length === 0) {
      await pool.query(
        `INSERT INTO user_stats (user_id, best_score_quick, best_score_endurance, good_answers, bad_answers)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          mode === 'quick' ? score : 0,
          mode === 'endurance' ? score : 0,
          goodAnswers,
          badAnswers,
        ]
      );
    } else {
      const stats = current.rows[0];

      let newBestQuick = stats.best_score_quick;
      let newBestEndurance = stats.best_score_endurance;

      if (mode === 'quick' && score > stats.best_score_quick) newBestQuick = score;
      if (mode === 'endurance' && score > stats.best_score_endurance) newBestEndurance = score;

      await pool.query(
        `UPDATE user_stats SET
          best_score_quick = $1,
          best_score_endurance = $2,
          good_answers = good_answers + $3,
          bad_answers = bad_answers + $4,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [newBestQuick, newBestEndurance, goodAnswers, badAnswers, userId]
      );
    }

    return NextResponse.json({ message: 'Statistiques mises à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

