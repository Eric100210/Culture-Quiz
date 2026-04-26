"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answer: string;
};

export default function QuizThematiqueClient({
  questions,
}: {
  questions: Question[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * questions.length)
  );
  const [showAnswer, setShowAnswer] = useState(false);

  const next = () => {
    setIndex(Math.floor(Math.random() * questions.length));
    setShowAnswer(false);
  };

  return (
    <div className="page">
      <div className="page-content">
        <button
          className="back-btn"
          onClick={() => router.push("/quiz/normal")}
        >
          ← Retour
        </button>

        <div className="quiz-header">
          <span className="quiz-mode-badge">📚 Quiz Thématique</span>
        </div>

        <div className="quiz-card animate-in">
          <p className="quiz-question-text">{questions[index].question}</p>

          {showAnswer ? (
            <div className="reveal-block">{questions[index].answer}</div>
          ) : (
            <div className="answer-grid">
              <button
                className="btn btn-primary btn-full"
                onClick={() => setShowAnswer(true)}
              >
                Afficher la réponse
              </button>
            </div>
          )}

          <div className="quiz-actions">
            <button className="btn btn-outline" onClick={next}>
              Question suivante →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
