import { loadQuestionsLibre } from "@/lib/loadQuestionsLibre";
import QuizThematiqueClient from "./QuizThematiqueClient";

export default function QuizThematiquePage() {
  const questions = loadQuestionsLibre();
  return <QuizThematiqueClient questions={questions} />;
}
