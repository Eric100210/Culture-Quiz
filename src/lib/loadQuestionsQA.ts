// src/lib/loadQuestions.ts
import fs from "fs";
import path from "path";

export type Question = {
  question: string;
  answer: string;
};

export function loadQuestionsQA(): Question[] {
  const filePath = path.join(process.cwd(), "src/data/questions.txt");
  const raw = fs.readFileSync(filePath, "utf-8");

  return raw.split("\n").map((line) => {
    const [question, answer] = line.split(" ; ");
    return {
      question: question.trim(),
      answer: answer.trim().slice(0,-1),
    };
  });
}
