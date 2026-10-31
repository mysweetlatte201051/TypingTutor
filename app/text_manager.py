"""Text Manager モジュール

タイピング練習用の課題テキストを管理・提供します。
"""

import random

# レッスンデータの定義
LESSONS = {
    "default": {
        1: [
            "f j f j d k d k s l s l a ; a ;",
            "fjgh dksl a;fj ghdk sla;",
            "asdf jkl; fdsa jkl; asdf ghjk",
        ],
        2: [
            "cat dog apple banana orange",
            "python flask pytest terminal code",
            "keyboard screen mouse system data",
        ],
        3: [
            "The quick brown fox jumps over the lazy dog.",
            "Practice makes perfect when learning to type fast.",
            "Python and JavaScript are widely used programming languages.",
        ],
    },
    "it_terms": {
        1: [
            "git init git add git commit",
        ],
        2: [
            "refactoring testing debugging deployment pipeline",
        ],
        3: [
            "GitHub Actions automates your software build and test workflows.",
            "Test-driven development helps engineers write clean and robust code.",
        ],
    },
    "quotes": {
        3: [
            "Stay hungry, stay foolish.",
            "Simplicity is the soul of efficiency.",
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