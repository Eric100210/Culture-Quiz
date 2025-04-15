import { loadQuestions } from "@/lib/loadQuestions";
import QuizRapidClient from "./QuizRapidClient";

export default function QuizRapidPage() {
  const questions = loadQuestions(); // lecture via fs
  return <QuizRapidClient questions={questions} />;
}