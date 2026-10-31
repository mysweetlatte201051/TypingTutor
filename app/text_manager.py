import json
import os
import random

# JSON ファイルのパス定義
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "texts.json")


def load_texts():
    """JSONファイルから練習テキストデータを読み込む"""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Text data file not found at: {DATA_PATH}")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_lesson_text(level: str = "1", category: str = "default") -> str:
    """指定されたレベルとカテゴリに応じたランダムテキストを返す（API用）"""
    texts = load_texts()

    category_data = texts.get(category, texts.get("default", {}))
    level_texts = category_data.get(str(level), category_data.get("1", ["default text"]))

    return random.choice(level_texts)


# エイリアス（互換性維持）
get_random_text = get_lesson_text