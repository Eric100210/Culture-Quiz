import { loadQuestionsQA } from "@/lib/loadQuestionsQA";
import QuizRapidClient from "./QuizRapidClient";

export default function QuizRapidPage() {
  const questions = loadQuestionsQA(); // lecture via fs
  return <QuizRapidClient questions={questions} />;
}