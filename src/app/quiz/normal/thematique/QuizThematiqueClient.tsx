"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type Question = {
  question: string;
  answers: string[];
  explanation?: string;
};

type MatchKind = "exact" | "article" | "fuzzy" | "phonetic" | "none";

// ─── Constants ───────────────────────────────────────────────────────────────

const BATCH_SIZE = 10;

// Sorted longest-first so "de l'" is tried before "l'"
const FR_ARTICLES = [
  "de l'",
  "de la ",
  "du ",
  "les ",
  "le ",
  "la ",
  "l'",
  "un ",
  "une ",
  "des ",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, "'") // unify apostrophes
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "") // strip diacritical marks (é→e, à→a, …)
    .replace(/\s+/g, " ");
}

// Digit groups of a string ("le 14 juillet 1789" → "14 1789"). Fuzzy and
// phonetic matching must never forgive a wrong digit: "1789" vs "1788" is a
// wrong answer, not a typo.
function digitsOf(s: string): string {
  return (s.match(/\d+/g) ?? []).join(" ");
}

function stripArticle(s: string): string {
  for (const art of FR_ARTICLES) {
    if (s.startsWith(art)) return s.slice(art.length).trimStart();
  }
  return s;
}

/**
 * Reduce a normalised string to a phonetic skeleton for French/European names.
 * Handles digraphs like tch/ch/ph/qu, common vowel groups (eau/au/ai/ou), and
 * German/Slavic conventions (w→v, ck→k, sch/tch→x). Double consonants collapse
 * to one. The result is shorter and more stable across spelling variants.
 */
function phonetize(s: string): string {
  let p = s;
  // Multi-char digraphs — longest first to avoid partial substitution
  p = p.replace(/sch/g, "x");
  p = p.replace(/tch/g, "x");
  p = p.replace(/ph/g, "f");
  p = p.replace(/ch/g, "x");
  p = p.replace(/ck/g, "k");
  p = p.replace(/qu/g, "k");
  p = p.replace(/gn/g, "n");
  // Vowel groups
  p = p.replace(/eau/g, "o");
  p = p.replace(/au/g, "o");
  p = p.replace(/ai|ei/g, "e");
  p = p.replace(/ou/g, "u");
  // Single-char equivalences
  p = p.replace(/w/g, "v");
  p = p.replace(/y/g, "i");
  // Collapse doubled consonants
  p = p.replace(/([bcdfghjklmnpqrstvxz])\1+/g, "$1");
  return p;
}

// Optimal string alignment (restricted Damerau-Levenshtein):
// counts adjacent transpositions as cost 1 instead of 2.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let pprev = new Array<number>(n + 1).fill(0);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
        // Transposition: a[i-1] == b[j-2] && a[i-2] == b[j-1]
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          curr[j] = Math.min(curr[j], pprev[j - 2] + 1);
        }
      }
    }
    [pprev, prev, curr] = [prev, curr, pprev];
  }
  return prev[n];
}

/**
 * Validate a free-text input against one or more accepted answers.
 *
 * Rules (tried in order, first match wins):
 *  1. Exact match after normalisation (case-insensitive, accent-insensitive).
 *  2. Match after stripping a leading French article from the *correct* answer
 *     ("La Joconde" → "Joconde") — user omitted the article.
 *  3. Match after stripping a leading French article from the *user input*
 *     ("le Fémur" typed but answer is just "Fémur") — user added an article.
 *  4. Both sides stripped (article on both sides differs).
 *  5. Levenshtein distance ≤ 1 between any of the four combinations above,
 *     but only for answers of length ≥ 4 (avoids false positives on short words).
 *  6. Phonetic match: both sides are run through phonetize() and their phonetic
 *     skeletons are within Levenshtein ≤ 1, for answers of length ≥ 5.
 *     Catches spelling variants of proper nouns ("Tchaikovsky"/"Chaïkovski").
 *
 *  Rules 5 and 6 additionally require all digits to match exactly: for a date
 *  like "1789", typing "1788" is a wrong answer, never a typo.
 *
 * Returns:
 *  - "exact"    — matched perfectly (incl. article normalisation)
 *  - "article"  — matched only because an article was added/removed
 *  - "fuzzy"    — matched within 1 character of edit distance
 *  - "phonetic" — matched phonetically despite different spelling
 *  - "none"     — no match
 */
function validate(input: string, validAnswers: string[]): MatchKind {
  const ni = normalize(input);
  const niNoArt = stripArticle(ni);

  for (const ans of validAnswers) {
    const na = normalize(ans);
    const naNoArt = stripArticle(na);

    // 1 – Exact
    if (ni === na) return "exact";

    // 2 – User dropped the article that belongs in the answer
    if (ni === naNoArt && naNoArt !== na) return "article";

    // 3 – User added an article that doesn't belong
    if (niNoArt === na && niNoArt !== ni) return "article";

    // 4 – Both sides had articles; they still match once stripped
    if (niNoArt === naNoArt && niNoArt !== ni && naNoArt !== na)
      return "article";

    // Tolerant stages (5 and 6) only apply when every digit matches exactly:
    // for dates and other numbers, a one-character difference is a wrong
    // answer, not a typo.
    if (digitsOf(ni) !== digitsOf(na)) continue;

    // 5 – Fuzzy (Levenshtein ≤ 1 on raw forms)
    const refLen = Math.min(na.length, naNoArt.length);
    if (refLen >= 4) {
      if (
        levenshtein(ni, na) <= 1 ||
        levenshtein(ni, naNoArt) <= 1 ||
        levenshtein(niNoArt, na) <= 1 ||
        levenshtein(niNoArt, naNoArt) <= 1
      )
        return "fuzzy";
    }

    // 6 – Phonetic (Levenshtein ≤ 1 on phonetized skeletons)
    if (refLen >= 5) {
      const pi = phonetize(ni);
      const piA = phonetize(niNoArt);
      const pa = phonetize(na);
      const paA = phonetize(naNoArt);
      if (
        (pi.length >= 4 && levenshtein(pi, pa) <= 1) ||
        (pi.length >= 4 && levenshtein(pi, paA) <= 1) ||
        (piA.length >= 4 && levenshtein(piA, pa) <= 1) ||
        (piA.length >= 4 && levenshtein(piA, paA) <= 1)
      )
        return "phonetic";
    }
  }

  return "none";
}

function pickBatch(all: Question[]): Question[] {
  const valid = all.filter((q) => q.question && q.answers.length > 0);
  return [...valid].sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE);
}

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = "playing" | "revealed" | "finished";

export default function QuizThematiqueClient({
  questions,
}: {
  questions: Question[];
}) {
  const router = useRouter();
  const [batch, setBatch] = useState<Question[]>(() => pickBatch(questions));
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("playing");
  const [matchKind, setMatchKind] = useState<MatchKind>("none");
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = batch[qIndex];
  const batchSize = batch.length;
  const accepted = matchKind !== "none";

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [qIndex, phase]);

  const handleSubmit = () => {
    if (phase !== "playing" || !input.trim()) return;
    const kind = validate(input, current.answers);
    setMatchKind(kind);
    if (kind !== "none") setScore((s) => s + 1);
    setPhase("revealed");
  };

  const handleNext = () => {
    if (qIndex + 1 >= batchSize) {
      setPhase("finished");
    } else {
      setQIndex((i) => i + 1);
      setInput("");
      setMatchKind("none");
      setPhase("playing");
    }
  };

  const handleRestart = () => {
    setBatch(pickBatch(questions));
    setQIndex(0);
    setInput("");
    setPhase("playing");
    setMatchKind("none");
    setScore(0);
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (phase === "finished") {
    const pct = Math.round((score / batchSize) * 100);
    const emoji =
      score === batchSize ? "🏆" : score >= 7 ? "🎉" : score >= 4 ? "👍" : "💪";
    return (
      <div className="page">
        <div className="page-content">
          <button className="back-btn" onClick={() => router.push("/quiz/normal")}>
            ← Retour
          </button>
          <div className="gameover-card">
            <div className="gameover-emoji">{emoji}</div>
            <h2 className="gameover-title">Quiz terminé !</h2>
            <div className="gameover-score-value">
              {score}/{batchSize}
            </div>
            <p className="gameover-score-label">bonnes réponses · {pct}%</p>
            <div className="gameover-actions">
              <button className="btn btn-primary btn-lg" onClick={handleRestart}>
                Nouveau quiz →
              </button>
              <button
                className="btn btn-outline"
                onClick={() => router.push("/quiz/normal")}
              >
                Retour au menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────

  // Feedback block styles & messages
  const feedbackStyle: React.CSSProperties = accepted
    ? {
        background: "var(--success-bg)",
        borderColor: "var(--success-border)",
        color: "var(--success-text)",
      }
    : {
        background: "var(--danger-bg)",
        borderColor: "var(--danger-border)",
        color: "var(--danger-text)",
      };

  const feedbackText =
    matchKind === "phonetic"
      ? `✓ Bonne réponse ! (${current.answers[0]})`
      : matchKind === "fuzzy"
      ? `✓ Bonne réponse ! (${current.answers[0]})`
      : accepted
      ? "✓ Bonne réponse !"
      : `✗ La bonne réponse était : ${current.answers[0]}`;

  return (
    <div className="page">
      <div className="page-content">
        <button className="back-btn" onClick={() => router.push("/quiz/normal")}>
          ← Retour
        </button>

        <div className="quiz-header">
          <span className="quiz-mode-badge">✏️ Réponse Libre</span>
          <div className="quiz-score-group">
            <span className="score-pill good">✓ {score}</span>
            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              {qIndex + 1} / {batchSize}
            </span>
          </div>
        </div>

        <div key={qIndex} className="quiz-card animate-in">
          <p className="quiz-question-text">{current.question}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              ref={inputRef}
              className="form-input"
              type="text"
              placeholder="Votre réponse…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={phase === "revealed"}
              style={{ marginBottom: "10px" }}
            />
            {phase === "playing" && (
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={!input.trim()}
              >
                Valider
              </button>
            )}
          </form>

          {phase === "revealed" && (
            <>
              <div className="reveal-block" style={feedbackStyle}>
                {feedbackText}
              </div>

              {current.explanation && (
                <p className="quiz-explanation">{current.explanation}</p>
              )}

              <div className="quiz-actions">
                <button className="btn btn-primary" onClick={handleNext}>
                  {qIndex + 1 >= batchSize
                    ? "Voir les résultats →"
                    : "Question suivante →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
