"""Typing Tutor Flask API モジュール

Webフロントエンドからのリクエストを受け取り、コアモジュールを実行してJSONを返します。
"""

from flask import Flask, jsonify, render_template, request

from app.calculator import calculate_accuracy, calculate_wpm
from app.evaluator import evaluate_char
from app.text_manager import get_lesson_text

app = Flask(__name__, template_folder="../templates", static_folder="../static")


@app.route("/")
def index():
    """メイン画面（HTML）を返すルーティング"""
    return render_template("index.html")


@app.route("/api/text", methods=["GET"])
def api_get_text():
    """課題テキスト取得 API"""
    try:
        level = int(request.args.get("level", 1))
        category = request.args.get("category", "default")
        text = get_lesson_text(level=level, category=category)
        return jsonify({"text": text, "level": level, "category": category}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


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