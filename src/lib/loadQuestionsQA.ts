// src/lib/loadQuestions.ts
import fs from "fs";
import path from "path";

export type Question = {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer: string;
  explanation?: string;
};

export function loadQuestionsQA(): Question[] {
  const filePath = path.join(process.cwd(), "src/data/questions.txt");
  const raw = fs.readFileSync(filePath, "utf-8");

  return raw.split("\n").map((line) => {
    const parts = line.split(" ; ");
    const [question, answer1, answer2, answer3, answer4, answer, explanation] = parts;
    return {
      question: question.trim(),
      answer1: answer1.trim(),
      answer2: answer2.trim(),
      answer3: answer3.trim(),
      answer4: answer4.trim(),
      answer: answer.trim(),
      ...(explanation ? { explanation: explanation.trim() } : {}),
    };
  });
}
