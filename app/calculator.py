"""Score Calculator モジュール

打鍵数、エラー数、経過時間から WPM および正確率を計算します。
"""


def calculate_wpm(total_typed: int, errors: int, time_seconds: float) -> int:
    """1分間あたりの打鍵単語数（WPM: Words Per Minute）を計算する。

    1単語＝5文字換算とし、エラー数をペナルティとして減算します。
    """
    if total_typed < 0 or errors < 0:
        raise ValueError("total_typed and errors must be non-negative integers.")

    if time_seconds <= 0.0:
        return 0

    words_typed = total_typed / 5.0
    net_words = words_typed - errors
    time_minutes = time_seconds / 60.0

    wpm = net_words / time_minutes
    return max(0, round(wpm))


def calculate_accuracy(total_typed: int, errors: int) -> float:
    """タイピングの正確率（%）を計算する。"""
    if total_typed == 0:
        return 100.0

    if errors >= total_typed:
        return 0.0

    correct_typed = total_typed - errors
    accuracy = (correct_typed / total_typed) * 100.0
    return max(0.0, round(accuracy, 1))