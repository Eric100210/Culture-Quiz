import { loadQuestions } from "@/lib/loadQuestions";
import QuizQAClient from "./QuizQAClient";

export default function QuizThematiquePage() {
  const questions = loadQuestions(); // lecture via fs
  return <QuizQAClient questions={questions} />;
}