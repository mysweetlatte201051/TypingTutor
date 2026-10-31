"""Typing Evaluator モジュール

ユーザーの打鍵結果と課題テキストを照合し、判定結果を返します。
"""

from dataclasses import dataclass


@dataclass
class EvaluationResult:
    """打鍵判定の結果を保持するデータクラス"""

    is_correct: bool       # 入力文字が正解かどうか
    expected_char: str     # 本来打つべき文字
    typed_char: str        # ユーザーが入力した文字
    is_completed: bool     # テキスト全文の入力が完了したか
    current_index: int     # 次に入力すべき文字のインデックス


def evaluate_char(
    target_text: str, current_index: int, typed_char: str, mode: str = "strict"
) -> EvaluationResult:
    """ユーザーが入力した1文字を判定し、EvaluationResult を返します。"""
    # 1. 異常系チェック: 入力文字長
    if len(typed_char) != 1:
        raise ValueError("typed_char must be exactly 1 character.")

    # 2. 異常系チェック: インデックス範囲
    if current_index < 0 or current_index >= len(target_text):
        raise IndexError("current_index is out of range for target_text.")

    # 3. 正誤判定
    expected_char = target_text[current_index]
    is_correct = typed_char == expected_char

    # 4. 次のインデックス計算 (strictモードとfreeモードの制御)
    if is_correct:
        next_index = current_index + 1
    else:
        next_index = current_index + 1 if mode == "free" else current_index

    # 5. 完了判定
    is_completed = next_index >= len(target_text)

    return EvaluationResult(
        is_correct=is_correct,
        expected_char=expected_char,
        typed_char=typed_char,
        is_completed=is_completed,
        current_index=next_index,
    )