// src/app/quiz/page.tsx
import { loadQuestionsQA } from "@/lib/loadQuestionsQA";
import QuizEnduranceClient from "./QuizEnduranceClient";

export default function QuizEndurancePage() {
  const questions = loadQuestionsQA(); // lecture via fs
  return <QuizEnduranceClient questions={questions} />;
}