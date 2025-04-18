"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types

type Question = {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer: string;
};

export default function QuizRapideClient({ questions }: { questions: Question[] }) {
  const router = useRouter();
  if (!questions || questions.length === 0) {
    return <div>Chargement des questions échoué ou vide.</div>;
  }  

  const [index, setIndex] = useState(() => Math.floor(Math.random() * questions.length));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 secondes
  const [isFinished, setIsFinished] = useState(false);

  // Shuffle les réponses à chaque nouvelle question
  useEffect(() => {
    const shuffled = shuffleAnswers(index);
    setShuffledAnswers(shuffled);
  }, [index]);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    if (timeLeft === 0) {
      setIsFinished(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isFinished]);

  function shuffleAnswers(idx: number): string[] {
    const answers = [
      questions[idx].answer1,
      questions[idx].answer2,
      questions[idx].answer3,
      questions[idx].answer4,
    ];
    return answers.sort(() => Math.random() - 0.5);
  }

  const [wrongCount, setWrongCount] = useState(0);

const handleAnswerClick = (answer: string) => {
  if (selectedAnswer !== null) return;
  setSelectedAnswer(answer);
  if (answer === questions[index].answer) {
    setScore((s) => s + 1);
  } else {
    setWrongCount((w) => w + 1);
  }
  setTimeout(() => {
    const nextIndex = Math.floor(Math.random() * questions.length);
    setIndex(nextIndex);
    setSelectedAnswer(null);
  }, 500);
};


  const isCorrect = (answer: string) => answer === questions[index].answer;

  if (isFinished) {
    return (
      <main style={{ padding: "2rem" }}>
        <div className="header">
          <h1>Quiz rapide - Temps écoulé !</h1>
          <p>Score final : {score}</p>
        </div>
        <button className="retour" onClick={() => router.push("/quiz/normal")}>Retour</button>
      </main>
    );
  }

  useEffect(() => {
    if (!isFinished) return;
  
    const token = localStorage.getItem("authToken");
    if (!token) return;
  
    const updateStats = async () => {
      try {
        await fetch("/api/stats", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mode: "quick",
            score: score,
            goodAnswers: score,
            badAnswers: wrongCount,
          }),
          
        });
      } catch (error) {
        console.error("Erreur mise à jour stats :", error);
      }
    };
  
    updateStats();
  }, [isFinished, score]);
  

  return (
    <main style={{ padding: "2rem" }}>
      <div className="header">
        <h1>Quiz rapide</h1>
        <p>Temps restant : {timeLeft}s | Score : {score}</p>
      </div>
      <div className="back-quiz">
        <div className="quiz-container">
          <h2 className="quiz-question">{questions[index].question}</h2>

          {shuffledAnswers.map((ans, i) => (
            <button
              key={i}
              className={`quiz-answer-button ${
                selectedAnswer
                  ? isCorrect(ans)
                    ? "correct"
                    : selectedAnswer === ans
                    ? "incorrect"
                    : ""
                  : ""
              }`}
              onClick={() => handleAnswerClick(ans)}
              disabled={selectedAnswer !== null}
            >
              {ans}
            </button>
          ))}
        </div>
      </div>
      <div>
        <button className="retour" onClick={() => router.push("/quiz/normal")}>Retour</button>
      </div>
    </main>
  );
}