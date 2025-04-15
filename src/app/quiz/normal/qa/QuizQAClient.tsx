"use client";

import { useState } from "react";
import Link from "next/link";

type Question = {
  question: string;
  answer: string;
};

export default function QuizQAClient({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const next = () => {
    setIndex(i => (i + 1 < questions.length ? i + 1 : 0));
    setShowAnswer(false);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h2>{questions[index].question}</h2>

      {showAnswer ? (
        <p><strong>{questions[index].answer}</strong></p>
      ) : (
        <button onClick={() => setShowAnswer(true)}>Afficher la réponse</button>
      )}

      <button onClick={next}>Question suivante</button>
      <Link href="/quiz/normal">Retour</Link>
    </main>
  );
}
