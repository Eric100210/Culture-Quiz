
// src/app/quiz/page.tsx
"use client"
import { useRouter } from "next/navigation";
import { loadQuestions } from "@/lib/loadQuestions";


export default function QuizModeSelector() {
  const router = useRouter();

  return (
    <main style={{ padding: "2rem" }}>
        <div className='header'>
      <h1>Choisis ton mode de quiz</h1>
      </div>
      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <div
          onClick={() => router.push("/quiz/normal")}
          className = 'quiz-button classic'
        >
          <h2>🎯 Quiz Classique</h2>
          <p>Réponds à autant de questions que tu veux</p>
        </div>

        <div
          onClick={() => router.push("/quiz/rapid")}
          className='quiz-button rapid'
        >
          <h2>⚡ Quiz Rapide</h2>
          <p>Tu as 60 secondes pour répondre à un max de questions</p>
        </div>

        <div
          onClick={() => router.push("/quiz/endurance")}
          className="quiz-button endurance"
        >
          <h2>🔥 Quiz Endurance</h2>
          <p>Continue tant que tu réponds juste</p>
        </div>
      </div>
      <div>
      <button className="retour" onClick={() => router.push("/")}> Retour </button>
      </div>
    </main>
  );
}


  