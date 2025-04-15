// src/app/quiz/page.tsx
"use client"
import { loadQuestions } from "@/lib/loadQuestions";
import {useRouter} from "next/navigation";

export default function QuizTheme() {
  const router = useRouter();
  const questions = loadQuestions();
  const randomIndex = Math.floor(Math.random() * questions.length);
  const { question, answer } = questions[randomIndex];

  return (
    <main>
      <h1>Quiz de culture générale</h1>
      <p><strong>Mot-clé :</strong> {question}</p>
      <details>
        <summary>Voir la réponse</summary>
        <p>{answer}</p>
      </details>
      <div>
        <button className="retour" onClick={() => router.push("/quiz/normal")}> Retour </button>
      </div>
    </main>
  );
}