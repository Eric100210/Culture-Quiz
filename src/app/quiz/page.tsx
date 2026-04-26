"use client";

import { useRouter } from "next/navigation";

const modes = [
  {
    id: "classic",
    icon: "🎯",
    title: "Quiz Classique",
    desc: "Réponds à autant de questions que tu veux, à ton propre rythme",
    path: "/quiz/normal",
  },
  {
    id: "rapid",
    icon: "⚡",
    title: "Quiz Rapide",
    desc: "60 secondes pour enchaîner le maximum de bonnes réponses",
    path: "/quiz/rapid",
  },
  {
    id: "endurance",
    icon: "🔥",
    title: "Quiz Endurance",
    desc: "Continue tant que tu réponds juste — une seule erreur et c'est terminé",
    path: "/quiz/endurance",
  },
];

export default function QuizModeSelector() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="page-content">
        <button className="back-btn" onClick={() => router.push("/")}>
          ← Retour
        </button>

        <div className="section-header">
          <h1>Choisis ton mode</h1>
          <p>Trois façons de tester ta culture générale</p>
        </div>

        <div className="mode-grid">
          {modes.map(({ id, icon, title, desc, path }) => (
            <div
              key={id}
              className={`mode-card ${id}`}
              onClick={() => router.push(path)}
            >
              <div className={`mode-icon ${id}`}>{icon}</div>
              <div className="mode-info">
                <h2>{title}</h2>
                <p>{desc}</p>
              </div>
              <span className="mode-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
