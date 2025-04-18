import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Fonction POST pour mettre à jour les statistiques
export async function POST(req: NextRequest) {
  try {
    const { userId, quickQuizScore, enduranceQuizScore, correctAnswers, wrongAnswers } = await req.json();

    // Vérifier si les statistiques existent déjà pour cet utilisateur
    const existingStats = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);

    if (existingStats.rows.length > 0) {
      const stats = existingStats.rows[0];

      // Comparer et mettre à jour les meilleurs scores
      const updatedQuickScore = Math.max(stats.best_quick_quiz_score, quickQuizScore);
      const updatedEnduranceScore = Math.max(stats.best_endurance_quiz_score, enduranceQuizScore);

      // Mettre à jour les bonnes et mauvaises réponses
      const updatedCorrectAnswers = stats.correct_answers + correctAnswers;
      const updatedWrongAnswers = stats.wrong_answers + wrongAnswers;

      // Mettre à jour les statistiques de l'utilisateur
      await pool.query(
        `UPDATE user_stats
         SET best_quick_quiz_score = $1, best_endurance_quiz_score = $2,
             correct_answers = $3, wrong_answers = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [updatedQuickScore, updatedEnduranceScore, updatedCorrectAnswers, updatedWrongAnswers, userId]
      );
    } else {
      // Si l'utilisateur n'a pas encore de stats, insérer les premières stats
      await pool.query(
        `INSERT INTO user_stats (user_id, best_quick_quiz_score, best_endurance_quiz_score, 
                                  correct_answers, wrong_answers)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, quickQuizScore, enduranceQuizScore, correctAnswers, wrongAnswers]
      );
    }

    return NextResponse.json({ message: 'Statistiques mises à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    return NextResponse.json({ message: 'Erreur lors de la mise à jour des statistiques' }, { status: 500 });
  }
}

// Fonction GET pour récupérer les statistiques
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];  // Récupérer le token du header

    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);  // Décoder le token
    const userId = decoded.id;

    const result = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Aucune statistique trouvée' }, { status: 404 });
    }

    const stats = result.rows[0];

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des statistiques' }, { status: 500 });
  }
}
