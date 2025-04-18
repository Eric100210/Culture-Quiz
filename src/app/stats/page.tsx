'use client';

import { useEffect, useState } from 'react';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);  // Pour stocker les statistiques
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('/api/stats', {
          method:'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          setError('Erreur lors du chargement des statistiques');
        }
      } catch (error) {
        setError('Erreur de connexion au serveur');
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="profile-container">
      {error && <p className="error-message">{error}</p>}
      {stats ? (
        <div className="stats">
          <h2>Mes Statistiques</h2>
          <p>Meilleur score en quiz rapide : {stats.best_quick_quiz_score}</p>
          <p>Meilleur score en quiz endurance : {stats.best_endurance_quiz_score}</p>
          <p>Bonnes réponses : {stats.correct_answers}</p>
          <p>Mauvaises réponses : {stats.wrong_answers}</p>
        </div>
      ) : (
        <p>Chargement des statistiques...</p>
      )}
    </div>
  );
}
