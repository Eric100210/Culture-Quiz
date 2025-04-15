// src/app/quiz/page.tsx
import { loadQuestions } from "@/lib/loadQuestions";
import QuizEnduranceClient from "./QuizEnduranceClient";

export default function QuizEndurancePage() {
  const questions = loadQuestions(); // lecture via fs
  return <QuizEnduranceClient questions={questions} />;
}