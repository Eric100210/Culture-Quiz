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
};

const LETTERS = ["A", "B", "C", "D"];
const TOTAL_TIME = 60;
const CIRCUMFERENCE = 2 * Math.PI * 30; // radius = 30

export default function QuizRapideClient({
  questions,
}: {
  questions: Question[];
}) {
  const router = useRouter();

  if (!questions || questions.length === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Chargement des questions…</p>
      </div>
    );
  }

  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * questions.length)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const prevScoreRef = useRef<number>(0);
  const prevWrongRef = useRef<number>(0);

  useEffect(() => {
    setShuffledAnswers(shuffleAnswers(index));
  }, [index]);

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft === 0) { setIsFinished(true); return; }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, isFinished]);

  useEffect(() => {
    if (!isFinished) return;
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
  }, [isFinished, score]);

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
    setTimeout(() => {
      const next = Math.floor(Math.random() * questions.length);
      setIndex(next);
      setSelectedAnswer(null);
    }, 500);
  };

  const isCorrect = (ans: string) => ans === questions[index].answer;

  const dashOffset =
    CIRCUMFERENCE * (1 - timeLeft / TOTAL_TIME);
  const isUrgent = timeLeft <= 10;

  if (isFinished) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="gameover-card">
            <div className="gameover-emoji">⏱️</div>
            <h2 className="gameover-title">Temps écoulé !</h2>
            <div className="gameover-score-value">{score}</div>
            <p className="gameover-score-label">bonnes réponses</p>
            <div className="gameover-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setScore(0);
                  setWrongCount(0);
                  setTimeLeft(TOTAL_TIME);
                  setIsFinished(false);
                  setSelectedAnswer(null);
                  const idx = Math.floor(Math.random() * questions.length);
                  setIndex(idx);
                  setShuffledAnswers(shuffleAnswers(idx));
                  prevScoreRef.current = 0;
                  prevWrongRef.current = 0;
                }}
              >
                Rejouer
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
          <span className="quiz-mode-badge">⚡ Quiz Rapide</span>
          <div className="quiz-score-group">
            <span className="score-pill good">✓ {score}</span>
            <span className="score-pill bad">✗ {wrongCount}</span>
            <div className="timer-wrap">
              <svg className="timer-svg" viewBox="0 0 68 68">
                <circle
                  className="timer-track"
                  cx="34"
                  cy="34"
                  r="30"
                />
                <circle
                  className={`timer-ring${isUrgent ? " urgent" : ""}`}
                  cx="34"
                  cy="34"
                  r="30"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className={`timer-label${isUrgent ? " urgent" : ""}`}>
                {timeLeft}
              </div>
            </div>
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
