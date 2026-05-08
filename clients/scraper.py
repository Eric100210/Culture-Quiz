import requests
from bs4 import BeautifulSoup
import json
import re
import time
import random
import os

BASE_URL = "https://quiz-culture-generale.com"
QUIZ_URL_TEMPLATE = BASE_URL + "/quiz/quiz-culture-generale-{n}/"
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "../src/data/questions.txt")

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "fr-FR,fr;q=0.9",
    }
)


def get_page(url: str) -> tuple[BeautifulSoup, str]:
    response = SESSION.get(url, timeout=10)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser"), response.text


def polite_delay(min_s: float = 1.5, max_s: float = 4.0) -> None:
    time.sleep(random.uniform(min_s, max_s))


def extract_correct_answers(raw_html: str) -> dict[int, int]:
    match = re.search(r"var snax_quiz_config\s*=\s*(\{.*?\});", raw_html, re.DOTALL)
    if not match:
        return {}
    config = json.loads(match.group(1))
    return {
        entry["question_id"]: entry["answer"]
        for entry in config.get("questions_answers_arr", [])
    }


def extract_category(soup: BeautifulSoup) -> tuple[str, str]:
    article = soup.find("article")
    if not article:
        return "", ""
    classes = article.get("class", [])
    category = next(
        (
            c.removeprefix("category-")
            for c in classes
            if c.startswith("category-") and c != "category-quiz"
        ),
        "",
    )
    difficulty = next(
        (c.removeprefix("tag-") for c in classes if c.startswith("tag-")), ""
    )
    return category, difficulty


def scrape_quiz(url: str) -> list[dict]:
    soup, raw_html = get_page(url)
    correct_map = extract_correct_answers(raw_html)
    category, difficulty = extract_category(soup)

    questions = []
    for q_div in soup.select("div[data-quizzard-question-id]"):
        question_id = int(q_div["data-quizzard-question-id"])
        correct_answer_id = correct_map.get(question_id)

        title_tag = q_div.select_one("h2.snax-quiz-question-title")
        question_text = title_tag.get_text(strip=True) if title_tag else ""

        image_tag = q_div.select_one("figure.snax-quiz-question-media img")
        image_url = image_tag["src"] if image_tag else None

        choices = []
        correct_text = ""
        for a_div in q_div.select("div[data-quizzard-answer-id]"):
            answer_id = int(a_div["data-quizzard-answer-id"])
            label_tag = a_div.select_one("div.snax-quiz-answer-label-text")
            answer_text = label_tag.get_text(strip=True) if label_tag else ""
            choices.append(answer_text)
            if answer_id == correct_answer_id:
                correct_text = answer_text

        questions.append(
            {
                "question": question_text,
                "choices": choices,
                "correct": correct_text,
                "category": category,
                "difficulty": difficulty,
                "source_url": url,
                **({"image_url": image_url} if image_url else {}),
            }
        )

    return questions


def to_txt_line(q: dict) -> str:
    parts = [q["question"]] + q["choices"] + [q["correct"]]
    return " ; ".join(parts)


def load_existing_questions() -> set[str]:
    try:
        with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
            return {line.split(" ; ")[0].strip() for line in f if line.strip()}
    except FileNotFoundError:
        return set()


def validate_and_save(questions: list[dict]) -> None:
    if not questions:
        print("No questions to validate.")
        return

    existing = load_existing_questions()
    saved = 0
    skipped = 0
    duplicates = 0
    print(f"\n{'─' * 60}")
    print(f"  Manual validation — {len(questions)} question(s) to review")
    print(f"{'─' * 60}\n")

    with open(QUESTIONS_FILE, "a", encoding="utf-8") as f:
        # Ensure the file ends with a newline before appending
        f.seek(0, 2)
        if f.tell() > 0:
            f.seek(f.tell() - 1)
            if f.read(1) != "\n":
                f.write("\n")

        for i, q in enumerate(questions, 1):
            print(f"[{i}/{len(questions)}] {q['question']}")

            if q["question"] in existing:
                print("  [duplicate] This question already exists — skipping.\n")
                duplicates += 1
                continue

            for j, choice in enumerate(q["choices"], 1):
                marker = "✓" if choice == q["correct"] else " "
                print(f"  {marker} {j}. {choice}")
            if q.get("category"):
                print(f"  Category: {q['category']}  Difficulty: {q['difficulty']}")
            print()

            while True:
                answer = input("  Save? [Y/n/q to quit] ").strip().lower()
                if answer in ("y", ""):
                    f.write(to_txt_line(q) + "\n")
                    existing.add(q["question"])
                    saved += 1
                    break
                elif answer == "n":
                    skipped += 1
                    break
                elif answer == "q":
                    print(f"\nAborted. {saved} saved, {skipped} skipped, {duplicates} duplicate(s).")
                    return
                else:
                    print("  Please enter Y, n, or q.")
            print()

    print(f"Done — {saved} saved, {skipped} skipped, {duplicates} duplicate(s) → {QUESTIONS_FILE}")


def ask_range() -> tuple[int, int]:
    print("=== Quiz Culture Générale Scraper ===\n")
    while True:
        raw = input(
            "Which pages do you want to scrape? (e.g. 1-100 or just 5): "
        ).strip()
        match = re.fullmatch(r"(\d+)(?:-(\d+))?", raw)
        if match:
            start = int(match.group(1))
            end = int(match.group(2)) if match.group(2) else start
            if start <= end:
                return start, end
        print("Invalid input. Please enter a number or a range like 1-100.\n")


def run() -> None:
    start, end = ask_range()
    all_questions: list[dict] = []

    print(f"\nScraping pages {start} to {end}...\n")
    for n in range(start, end + 1):
        url = QUIZ_URL_TEMPLATE.format(n=n)
        try:
            questions = scrape_quiz(url)
            all_questions.extend(questions)
            print(f"[ok] {url} — {len(questions)} question(s)")
        except requests.HTTPError as e:
            if e.response.status_code == 404:
                print(f"[skip] {url} — not found")
            else:
                print(f"[error] {url}: {e}")
        except Exception as e:
            print(f"[error] {url}: {e}")
        polite_delay()

    print(f"\nScraped {len(all_questions)} questions total.")
    validate_and_save(all_questions)


if __name__ == "__main__":
    run()
