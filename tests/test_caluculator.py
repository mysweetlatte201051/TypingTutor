import pytest
from app.calculator import calculate_wpm, calculate_accuracy


class TestCalculateWpm:
    """calculate_wpm 関数のテスト"""

    def test_normal_case(self):
        """正常系: 標準的な打鍵数と時間での WPM 計算検証
        - 総打鍵数: 150文字 (30 words)
        - エラー数: 0
        - 経過時間: 60秒 (1分)
        - 期待値: 30 WPM
        """
        assert calculate_wpm(total_typed=150, errors=0, time_seconds=60.0) == 30

    def test_with_errors(self):
        """正常系: エラーペナルティが含まれる場合の検証
        - (150 / 5) - 5 = 25 words
        - 25 / 1分 = 25 WPM
        """
        assert calculate_wpm(total_typed=150, errors=5, time_seconds=60.0) == 25

    def test_zero_time(self):
        """境界値: 経過時間が 0 秒の場合は 0 Division を回避して 0 を返す"""
        assert calculate_wpm(total_typed=150, errors=0, time_seconds=0.0) == 0

    def test_negative_result_clamped_to_zero(self):
        """境界値: エラー数が多く計算結果が負になる場合は 0 に補正される"""
        assert calculate_wpm(total_typed=10, errors=10, time_seconds=30.0) == 0

    def test_invalid_input_raises_value_error(self):
        """異常系: 打鍵数やエラー数に負の数が指定された場合は ValueError を発生させる"""
        with pytest.raises(ValueError):
            calculate_wpm(total_typed=-10, errors=0, time_seconds=10.0)


class TestCalculateAccuracy:
    """calculate_accuracy 関数のテスト"""

    def test_perfect_accuracy(self):
        """正常系: ミスなしの場合は 100.0%"""
        assert calculate_accuracy(total_typed=100, errors=0) == 100.0

    def test_partial_accuracy(self):
        """正常系: ミスありの場合のパーセンテージ計算
        - (100 - 5) / 100 * 100 = 95.0%
        """
        assert calculate_accuracy(total_typed=100, errors=5) == 95.0

    def test_zero_typed(self):
        """境界値: 打鍵数が 0 の場合は 0 Division を回避して 100.0 を返す"""
        assert calculate_accuracy(total_typed=0, errors=0) == 100.0

    def test_errors_exceed_typed(self):
        """境界値: エラー数が打鍵数を超えた場合は 0.0 を返す"""
        assert calculate_accuracy(total_typed=10, errors=15) == 0.0