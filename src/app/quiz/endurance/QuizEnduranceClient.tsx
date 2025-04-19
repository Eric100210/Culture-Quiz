"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer: string;
};

export default function QuizEnduranceClient({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [index, setIndex] = useState(Math.floor(Math.random() * questions.length));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>(shuffleAnswers(index));
  const [gameOver, setGameOver] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    if (!gameOver) return;
  
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
            mode: "endurance",
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
  }, [gameOver, score]);

  function shuffleAnswers(idx: number): string[] {
    const answers = [
      questions[idx].answer1,
      questions[idx].answer2,
      questions[idx].answer3,
      questions[idx].answer4,
    ];
    return answers.sort(() => Math.random() - 0.5);
  }

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[index].answer;
    if (answer === questions[index].answer) {
      setScore((s) => s + 1);
    } else {
      setWrongCount((w) => w + 1);
    }

    if (correct) {
      setTimeout(() => {
        setScore(score + 1);
        const newIndex = Math.floor(Math.random() * questions.length);
        setIndex(newIndex);
        setShuffledAnswers(shuffleAnswers(newIndex));
        setSelectedAnswer(null);
      }, 1000); // petite pause pour voir si c'était juste
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    const newIndex = Math.floor(Math.random() * questions.length);
    setIndex(newIndex);
    setShuffledAnswers(shuffleAnswers(newIndex));
    setSelectedAnswer(null);
    setGameOver(false);
  };

  const isCorrect = (answer: string) => answer === questions[index].answer;

  return (
    <main style={{ padding: "2rem" }}>
      <div className="header">
        <h1>Quiz endurance :</h1>
        <p className="score">Score : {score}</p>
      </div>
        <div className="back-quiz">
      {gameOver ? (
        <div className="quiz-container">
          <h2>💀 Mauvaise réponse !</h2>
          <p>Ton score final est de <strong>{score}</strong></p>
          <button className="quiz-buttons" onClick={resetGame}>Recommencer</button>
        </div>
      ) : (
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
      )}
        </div>
        <div>
        <button className="retour" onClick={() => router.push("/quiz")}>
          Retour
        </button>
      </div>
    </main>
  );
}
