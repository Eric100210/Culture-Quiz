"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  user_id: number;
  best_score_quick: number;
  best_score_endurance: number;
  good_answers: number;
  wrong_answers: number;
  updated_at: string;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) { router.push("/login"); return; }
      try {
        const res = await fetch("/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("authToken");
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStats(data.stats);
      } catch {
        // keep the token — server error, not an auth failure
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Chargement des statistiques…</p>
      </div>
    );
  }

  if (!stats) return null;

  const total = stats.good_answers + stats.wrong_answers;
  const accuracy =
    total > 0 ? Math.round((stats.good_answers / total) * 100) : 0;

  const statCards = [
    {
      icon: "✅",
      value: stats.good_answers,
      label: "Bonnes réponses",
      type: "success",
    },
    {
      icon: "❌",
      value: stats.wrong_answers,
      label: "Mauvaises réponses",
      type: "danger",
    },
    {
      icon: "⚡",
      value: stats.best_score_quick,
      label: "Meilleur score Rapide",
      type: "primary",
    },
    {
      icon: "🔥",
      value: stats.best_score_endurance,
      label: "Meilleur score Endurance",
      type: "warning",
    },
    {
      icon: "🎯",
      value: `${accuracy}%`,
      label: "Précision globale",
      type: "primary",
    },
  ];

  return (
    <div className="page">
      <div className="page-content">
        <button className="back-btn" onClick={() => router.push("/profile")}>
          ← Profil
        </button>

        <div className="section-header">
          <h1>Mes statistiques</h1>
          <p>Suis ta progression et bats tes records</p>
        </div>

        <div className="stats-grid animate-in">
          {statCards.map(({ icon, value, label, type }) => (
            <div key={label} className={`stat-card ${type}`}>
              <div className="stat-icon">{icon}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/quiz")}
          >
            Jouer maintenant
          </button>
          <button
            className="btn btn-outline"
            onClick={() => router.push("/profile")}
          >
            Retour au profil
          </button>
        </div>
      </div>
    </div>
  );
}
