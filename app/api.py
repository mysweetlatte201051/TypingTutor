"""Typing Tutor Flask API モジュール

Webフロントエンドからのリクエストを受け取り、コアモジュールを実行してJSONを返します。
"""

import json
import os
from flask import Flask, jsonify, render_template, request

from app.calculator import calculate_accuracy, calculate_wpm
from app.evaluator import evaluate_char

app = Flask(__name__, template_folder="../templates", static_folder="../static")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "texts.json")


def load_texts():
    """texts.json を安全に読み込むヘルパー関数"""
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"JSON load error: {e}")
            return {}
    else:
        print(f"File not found: {DATA_PATH}")
        return {}


@app.route("/")
def index():
    """メイン画面（HTML）を返すルーティング"""
    return render_template("index.html")


@app.route("/api/chapters", methods=["GET"])
def get_chapters():
    """指定されたカテゴリ内の全チャプター/レベル一覧を数値昇順で返す API"""
    category = request.args.get("category", "default")
    texts_data = load_texts()

    category_data = texts_data.get(category, {})
    raw_keys = list(category_data.keys())
    chapters = sorted(raw_keys, key=lambda x: int(x) if x.isdigit() else x)

    return jsonify({"chapters": chapters}), 200


@app.route("/api/text", methods=["GET"])
def get_text():
    """課題テキスト取得 API（カテゴリ・チャプター/レベル対応）"""
    category = request.args.get("category", "default")
    chapter = request.args.get("chapter") or request.args.get("level", "1")

    texts_data = load_texts()
    category_data = texts_data.get(category, {})

    # 指定カテゴリにデータがない場合のフォールバック（defaultへ落とす）
    if not category_data and category != "default":
        category_data = texts_data.get("default", {})

    chapter_paragraphs = category_data.get(str(chapter), [])

    # チャプター内に段落が存在しない場合、カテゴリの最初のキーを取得
    if not chapter_paragraphs and category_data:
        first_key = next(iter(category_data.keys()), "1")
        chapter_paragraphs = category_data.get(first_key, [])

    selected_text = (
        chapter_paragraphs[0]
        if chapter_paragraphs
        else "The quick brown fox jumps over the lazy dog."
    )

    return jsonify(
        {"text": selected_text, "category": category, "chapter": str(chapter)}
    ), 200


@app.route("/api/evaluate", methods=["POST"])
def api_evaluate():
    """打鍵判定 API"""
    data = request.get_json() or {}
    try:
        result = evaluate_char(
            target_text=data.get("target_text", ""),
            current_index=int(data.get("current_index", 0)),
            typed_char=data.get("typed_char", ""),
            mode=data.get("mode", "strict"),
        )
        return jsonify(
            {
                "is_correct": result.is_correct,
                "expected_char": result.expected_char,
                "typed_char": result.typed_char,
                "is_completed": result.is_completed,
                "current_index": result.current_index,
            }
        ), 200
    except (ValueError, IndexError) as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    """スコア（WPM・正確率）計算 API"""
    data = request.get_json() or {}
    try:
        total_typed = int(data.get("total_typed", 0))
        errors = int(data.get("errors", 0))
        time_seconds = float(data.get("time_seconds", 0.0))

        wpm = calculate_wpm(total_typed, errors, time_seconds)
        accuracy = calculate_accuracy(total_typed, errors)

        return jsonify({"wpm": wpm, "accuracy": accuracy}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)