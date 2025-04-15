"use client"
import { useRouter } from "next/navigation";

export default function QuizNormal() {
    const router = useRouter();
  return (
    <main style={{ padding: "2rem" }}>
        <div className='header'>
      <h1>Quiz Classique : choisis ton type de questions</h1>
      </div>
      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <div
          onClick={() => router.push("/quiz/normal/thematique")}
          className="quiz-button thematique"
        >
          <h2>🎯 Quiz Thématique </h2>
          <p>Parle sur des sujets vastes</p>
        </div>

        <div
          onClick={() => router.push("/quiz/normal/qa")}
          className="quiz-button qa"
        >
          <h2>⚡ Quiz Questions/Réponses</h2>
          <p>Réponds spécifiquement aux questions posées</p>
        </div>
      </div>
    </main>
  );
}


