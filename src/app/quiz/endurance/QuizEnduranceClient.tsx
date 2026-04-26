"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer: string;
};

const LETTERS = ["A", "B", "C", "D"];

function shuffleAnswers(questions: Question[], idx: number): string[] {
  return [
    questions[idx].answer1,
    questions[idx].answer2,
    questions[idx].answer3,
    questions[idx].answer4,
  ].sort(() => Math.random() - 0.5);
}

export default function QuizEnduranceClient({
  questions,
}: {
  questions: Question[];
}) {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * questions.length)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>(() =>
    shuffleAnswers(questions, Math.floor(Math.random() * questions.length))
  );
  const [gameOver, setGameOver] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const prevScoreRef = useRef<number>(0);
  const prevWrongRef = useRef<number>(0);

  useEffect(() => {
    if (!gameOver) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const deltaGood = score - prevScoreRef.current;
    const deltaBad = wrongCount - prevWrongRef.current;
    if (deltaGood === 0 && deltaBad === 0) return;
    fetch("/api/stats", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ goodAnswers: deltaGood, badAnswers: deltaBad }),
    })
      .then(() => {
        prevScoreRef.current = score;
        prevWrongRef.current = wrongCount;
      })
      .catch((e) => console.error("Erreur stats :", e));
  }, [gameOver, score]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === questions[index].answer;
    if (correct) {
      setScore((s) => s + 1);
      setTimeout(() => {
        const newIdx = Math.floor(Math.random() * questions.length);
        setIndex(newIdx);
        setShuffledAnswers(shuffleAnswers(questions, newIdx));
        setSelectedAnswer(null);
      }, 900);
    } else {
      setWrongCount((w) => w + 1);
      setTimeout(() => setGameOver(true), 1800);
    }
  };

  const reset = () => {
    const newIdx = Math.floor(Math.random() * questions.length);
    setScore(0);
    setWrongCount(0);
    setIndex(newIdx);
    setShuffledAnswers(shuffleAnswers(questions, newIdx));
    setSelectedAnswer(null);
    setGameOver(false);
    prevScoreRef.current = 0;
    prevWrongRef.current = 0;
  };

  const isCorrect = (ans: string) => ans === questions[index].answer;

  if (gameOver) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="gameover-card">
            <div className="gameover-emoji">💀</div>
            <h2 className="gameover-title">Mauvaise réponse !</h2>
            <div className="gameover-score-value">{score}</div>
            <p className="gameover-score-label">bonnes réponses consécutives</p>
            <div className="gameover-actions">
              <button className="btn btn-primary" onClick={reset}>
                Recommencer
              </button>
              <button
                className="btn btn-outline"
                onClick={() => router.push("/quiz")}
              >
                Autres modes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <button className="back-btn" onClick={() => router.push("/quiz")}>
          ← Retour
        </button>

        <div className="quiz-header">
          <span className="quiz-mode-badge">🔥 Quiz Endurance</span>
          <div className="quiz-score-group">
            <span className="score-pill good">🔥 {score}</span>
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
                      : selectedAnswer === ans
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
        </div>
      </div>
    </div>
  );
}
