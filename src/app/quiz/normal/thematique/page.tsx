import { loadQuestions } from "@/lib/loadQuestions";
import QuizThematiqueClient from "./QuizThematiqueClient";

export default function QuizThematiquePage() {
  const questions = loadQuestions(); // lecture via fs
  return <QuizThematiqueClient questions={questions} />;
}
