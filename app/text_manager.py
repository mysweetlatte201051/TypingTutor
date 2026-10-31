"""Text Manager モジュール

タイピング練習用の課題テキストを管理・提供します。
"""

import random

# レッスンデータの定義（バリエーション拡充版）
LESSONS = {
    "default": {
        1: [
            "f j f j d k d k s l s l a ; a ;",
            "fjgh dksl a;fj ghdk sla;",
            "asdf jkl; fdsa jkl; asdf ghjk",
            "fjdksla; fjdksla; ghfjdksla;",
            "a s d f g h j k l ; a s d f",
        ],
        2: [
            "cat dog apple banana orange",
            "python flask pytest terminal code",
            "keyboard screen mouse system data",
            "computer network server client memory",
            "function variable object string number",
        ],
        3: [
            "The quick brown fox jumps over the lazy dog.",
            "Practice makes perfect when learning to type fast.",
            "Python and JavaScript are widely used programming languages.",
            "Always write clear and maintainable code for your team.",
            "Continuous integration helps deliver reliable software quickly.",
        ],
    },
    "it_terms": {
        1: [
            "git init git add git commit",
            "pip install pytest flask",
        ],
        2: [
            "refactoring testing debugging deployment pipeline",
            "repository branch merge checkout rebase",
            "database postgresql query index transaction",
        ],
        3: [
            "GitHub Actions automates your software build and test workflows.",
            "Test-driven development helps engineers write clean and robust code.",
            "REST APIs provide a simple and standardized way to connect services.",
        ],
    },
    "quotes": {
        3: [
            "Stay hungry, stay foolish.",
            "Simplicity is the soul of efficiency.",
            "Talk is cheap. Show me the code.",
            "First, solve the problem. Then, write the code.",
        ],
    },
}


def get_lesson_text(level: int, category: str = "default") -> str:
    """指定されたレベル・カテゴリに応じた練習テキストをランダムに1件取得します。"""
    if category not in LESSONS:
        raise ValueError(f"Category '{category}' does not exist.")

    category_lessons = LESSONS[category]

    if level not in category_lessons:
        raise ValueError(f"Level {level} is not available in category '{category}'.")

    text_list = category_lessons[level]
    return random.choice(text_list)


def get_available_categories() -> list[str]:
    """利用可能なカテゴリの一覧を返します。"""
    return list(LESSONS.keys())