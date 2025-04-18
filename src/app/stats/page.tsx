'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Stats = {
  best_score_quick: number;
  best_score_endurance: number;
  good_answers: number;
  bad_answers: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Non autorisé');

        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        localStorage.removeItem('authToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) return <p>Chargement des statistiques...</p>;

  if (!stats) return <p>Erreur lors du chargement des statistiques.</p>;

  return (
    <main className="mainPage">
      <div className="header">
        <h1 className="welcome">Statistiques du joueur</h1>
      </div>

      <div className="login-container">
        <div className="login-box">
          <p><strong>✅ Bonnes réponses :</strong> {stats.good_answers}</p>
          <p><strong>❌ Mauvaises réponses :</strong> {stats.bad_answers}</p>
          <p><strong>🏃 Meilleur score (rapide) :</strong> {stats.best_score_quick}</p>
          <p><strong>🔥 Meilleur score (endurance) :</strong> {stats.best_score_endurance}</p>
        </div>
      </div>

      <div className="boutons-profile">
        <div>
          <button className="retour" onClick={() => router.push("/")}>
            Retour
          </button>
        </div>
        <div>
          <button className="stats-button" onClick={() => {
            router.push('/profile');
          }}>
            Profil
          </button>
        </div>
      </div>
    </main>
  );
}
