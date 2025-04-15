import { loadQuestionsQA } from "@/lib/loadQuestionsQA";
import QuizQAClient from "./QuizQAClient";

export default function QuizThematiquePage() {
  const questions = loadQuestionsQA(); // lecture via fs
  return <QuizQAClient questions={questions} />;
}