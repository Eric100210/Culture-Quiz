import fs from "fs";
import path from "path";

export type QuestionLibre = {
  question: string;
  answers: string[];       // pipe-separated in the file: "Answer1 | Answer2"
  explanation?: string;
};

export function loadQuestionsLibre(): QuestionLibre[] {
  const filePath = path.join(process.cwd(), "src/data/questions_libre.txt");
  const raw = fs.readFileSync(filePath, "utf-8");

  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(" ; ");
      const question = parts[0]?.trim() ?? "";
      const answers = (parts[1] ?? "")
        .split("|")
        .map((a) => a.trim())
        .filter(Boolean);
      const explanation = parts[2]?.trim() || undefined;
      return { question, answers, explanation };
    })
    .filter((q) => q.question && q.answers.length > 0);
}
