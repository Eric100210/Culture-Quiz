"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer: string;
};

export default function QuizThematiqueClient({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(Math.floor(Math.random() * questions.length));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>(shuffleAnswers(index));

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
    if (selectedAnswer !== null) return; // Ne rien faire si une réponse a déjà été donnée
    setSelectedAnswer(answer);
  };

  const next = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setIndex(randomIndex);
    setSelectedAnswer(null);
    setShuffledAnswers(shuffleAnswers(randomIndex));
  };

  const isCorrect = (answer: string) => answer === questions[index].answer;

  return (
    <main style={{ padding: "2rem" }}>
      <div className="header">
        <h1>Quiz Classique</h1>
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
                    : ans === selectedAnswer
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

          <button
            className="quiz-buttons next"
            onClick={next}
            disabled={selectedAnswer === null}
          >
            Question suivante
          </button>
        </div>
      </div>
      <div>
        <button className="retour" onClick={() => router.push("/quiz/normal")}>
          Retour
        </button>
      </div>
    </main>
  );
}
