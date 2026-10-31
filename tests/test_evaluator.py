import pytest
from app.evaluator import evaluate_char, EvaluationResult


class TestEvaluateCharStrict:
    """evaluate_char 関数 (Strict モード) のテスト"""

    def test_correct_char_typed(self):
        """正常系: 正しい文字を入力した場合
        - カーソルが次に進む (current_index + 1)
        - is_correct が True になる
        """
        result = evaluate_char(
            target_text="Hello", current_index=0, typed_char="H", mode="strict"
        )

        assert isinstance(result, EvaluationResult)
        assert result.is_correct is True
        assert result.expected_char == "H"
        assert result.typed_char == "H"
        assert result.current_index == 1
        assert result.is_completed is False

    def test_incorrect_char_typed_in_strict_mode(self):
        """正常系 (Strict): 誤った文字を入力した場合
        - カーソルは進まない (current_index のまま)
        - is_correct が False になる
        """
        result = evaluate_char(
            target_text="Hello", current_index=0, typed_char="h", mode="strict"
        )

        assert result.is_correct is False
        assert result.expected_char == "H"
        assert result.typed_char == "h"
        assert result.current_index == 0
        assert result.is_completed is False

    def test_last_character_completion(self):
        """正常系: 最後の1文字を正しく入力した場合
        - is_completed が True になる
        """
        result = evaluate_char(
            target_text="Hi", current_index=1, typed_char="i", mode="strict"
        )

        assert result.is_correct is True
        assert result.current_index == 2
        assert result.is_completed is True


class TestEvaluateCharFree:
    """evaluate_char 関数 (Free モード) のテスト"""

    def test_incorrect_char_typed_in_free_mode(self):
        """正常系 (Free): 誤った文字を入力した場合でもカーソルが次に進む"""
        result = evaluate_char(
            target_text="Hello", current_index=0, typed_char="x", mode="free"
        )

        assert result.is_correct is False
        assert result.current_index == 1
        assert result.is_completed is False


class TestEvaluateCharExceptions:
    """異常系・境界値のテスト"""

    def test_invalid_typed_char_length(self):
        """異常系: 入力文字が1文字でない場合は ValueError"""
        with pytest.raises(ValueError):
            evaluate_char(
                target_text="Hello", current_index=0, typed_char="He", mode="strict"
            )

        with pytest.raises(ValueError):
            evaluate_char(
                target_text="Hello", current_index=0, typed_char="", mode="strict"
            )

    def test_out_of_range_index(self):
        """異常系: current_index が範囲外の場合は IndexError"""
        with pytest.raises(IndexError):
            evaluate_char(
                target_text="Hello", current_index=5, typed_char="a", mode="strict"
            )

        with pytest.raises(IndexError):
            evaluate_char(
                target_text="Hello", current_index=-1, typed_char="a", mode="strict"
            )