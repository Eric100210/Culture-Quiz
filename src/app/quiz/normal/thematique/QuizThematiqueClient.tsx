"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answer: string;
};

export default function QuizThematiqueClient({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(Math.floor(Math.random() * questions.length));
  const [showAnswer, setShowAnswer] = useState(false);

  const next = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setIndex(randomIndex);
    setShowAnswer(false);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <div className="header">
        <h1>Quiz thématique</h1>
      </div>
      <div className="back-quiz">
        <div className="quiz-container">
          <h2>{questions[index].question}</h2>

          {showAnswer ? (
            <p><strong>{questions[index].answer}</strong></p>
          ) : (
            
            <button className="quiz-buttons" onClick={() => setShowAnswer(true)}>Afficher la réponse</button>
            
          )}
          
          <button className="quiz-buttons" onClick={next}>Question suivante</button>
          
        </div>
      </div>
      <div>
        <button className="retour" onClick={() => router.push("/quiz/normal")}> Retour </button>
      </div>
    </main>
  );
}
