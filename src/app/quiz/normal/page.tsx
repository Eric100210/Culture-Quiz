"use client";

import { useRouter } from "next/navigation";

const modes = [
  {
    id: "qa",
    icon: "❓",
    title: "Questions / Réponses",
    desc: "Réponds à des questions à choix multiples sur des sujets variés",
    path: "/quiz/normal/qa",
  },
  {
    id: "thematic",
    icon: "📚",
    title: "Quiz Thématique",
    desc: "Découvre des explications détaillées sur de grands sujets de culture générale",
    path: "/quiz/normal/thematique",
  },
];

export default function QuizNormal() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="page-content">
        <button className="back-btn" onClick={() => router.push("/quiz")}>
          ← Retour
        </button>

        <div className="section-header">
          <h1>Quiz Classique</h1>
          <p>Choisis le type de questions</p>
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
