// src/app/quiz/page.tsx
import { loadQuestionsQA } from "@/lib/loadQuestionsQA";

export default function QuizQA() {
  const questions = loadQuestionsQA();
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
    </main>
  );
}