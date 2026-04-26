// src/lib/loadQuestions.ts
import fs from "fs";
import path from "path";

export type Question = {
  question: string;
  answer: string;
};

export function loadQuestions(): Question[] {
  const filePath = path.join(process.cwd(), "src/data/themes.txt");
  const raw = fs.readFileSync(filePath, "utf-8");

  return raw
    .split("\n")
    .filter((line) => line.includes(" ; "))
    .map((line) => {
      const [question, answer] = line.split(" ; ");
      return {
        question: question.trim(),
        answer: answer.trim(),
      };
    });
}
