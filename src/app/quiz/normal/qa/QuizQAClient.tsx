"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer: string;
  explanation?: string;
};

const LETTERS = ["A", "B", "C", "D"];

export default function QuizQAClient({
  questions,
}: {
  questions: Question[];
}) {
  const router = useRouter();
  const initialIndex = useRef(Math.floor(Math.random() * questions.length));
  const [index, setIndex] = useState(initialIndex.current);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>(() =>
    shuffleAnswers(initialIndex.current)
  );
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const prevScoreRef = useRef<number>(0);
  const prevWrongRef = useRef<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const deltaGood = score - prevScoreRef.current;
    const deltaBad = wrongCount - prevWrongRef.current;
    if (deltaGood === 0 && deltaBad === 0) return;

    const update = async () => {
      try {
        await fetch("/api/stats", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ goodAnswers: deltaGood, badAnswers: deltaBad }),
        });
        prevScoreRef.current = score;
        prevWrongRef.current = wrongCount;
      } catch (err) {
        console.error("Erreur stats :", err);
      }
    };
    update();
  }, [score, wrongCount]);

  function shuffleAnswers(idx: number): string[] {
    return [
      questions[idx].answer1,
      questions[idx].answer2,
      questions[idx].answer3,
      questions[idx].answer4,
    ].sort(() => Math.random() - 0.5);
  }

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === questions[index].answer) {
      setScore((s) => s + 1);
    } else {
      setWrongCount((w) => w + 1);
    }
  };

  const next = () => {
    const idx = Math.floor(Math.random() * questions.length);
    setIndex(idx);
    setSelectedAnswer(null);
    setShuffledAnswers(shuffleAnswers(idx));
  };

  const isCorrect = (ans: string) => ans === questions[index].answer;

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
          <span className="quiz-mode-badge">🎯 Quiz Classique</span>
          <div className="quiz-score-group">
            <span className="score-pill good">✓ {score}</span>
            <span className="score-pill bad">✗ {wrongCount}</span>
          </div>
        </div>

        <div className="quiz-card animate-in">
          <p className="quiz-question-text">{questions[index].question}</p>

          <div className="answer-grid">
            {shuffledAnswers.map((ans, i) => (
              <button
                key={i}
                className={`answer-btn${
                  selectedAnswer
                    ? isCorrect(ans)
                      ? " correct"
                      : ans === selectedAnswer
                      ? " incorrect"
                      : ""
                    : ""
                }`}
                onClick={() => handleAnswer(ans)}
                disabled={selectedAnswer !== null}
              >
                <span className="answer-letter">{LETTERS[i]}</span>
                {ans}
              </button>
            ))}
          </div>

          {selectedAnswer && questions[index].explanation && (
            <p className="quiz-explanation">{questions[index].explanation}</p>
          )}

          <div className="quiz-actions">
            <button
              className="btn btn-primary"
              onClick={next}
              disabled={selectedAnswer === null}
            >
              Question suivante →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
