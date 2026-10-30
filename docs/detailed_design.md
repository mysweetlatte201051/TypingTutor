# 『Typing Tutor』詳細設計書 (Detailed Design Specification)

本ドキュメントは、タイピング学習アプリケーションのバックエンドにおける各コアモジュールのインターフェース（関数仕様、型定義、戻り値、例外）を定義します。

---

## 1. モジュール一覧

| モジュール名 | ファイルパス | 主な役割 |
| :--- | :--- | :--- |
| **Score Calculator** | `app/calculator.py` | 打鍵数、経過時間、エラー数からの WPM や Accuracy（正確率）の計算 |
| **Typing Evaluator** | `app/evaluator.py` | 入力文字と課題文字の判定、カーソル位置およびエラー検出 |
| **Text Manager** | `app/text_manager.py` | レッスン別テキストの保持・取得、難易度フィルター |

---

## 2. モジュール詳細仕様

### 2.1 Score Calculator (`app/calculator.py`)

タイピングのパフォーマンス指標を計算する独立モジュール。UIや状態に依存せず、純粋な計算処理のみを担う。

#### ① `calculate_wpm(total_typed: int, errors: int, time_seconds: float) -> int`
* **概要:** 1分間あたりの打鍵単語数（WPM: Words Per Minute）を算出する。1単語＝5文字として計算。
* **引数:**
  * `total_typed` (`int`): 総打鍵数（正解・不正解を含む）
  * `errors` (`int`): 総エラー（誤打鍵）数
  * `time_seconds` (`float`): 経過時間（秒）
* **戻り値:** `int` - 算出されたWPM（四捨五入して整数で返す。負の値になる場合は `0`）
* **計算式:** $\text{WPM} = \max\left(0, \text{Round}\left(\frac{\frac{\text{total\_typed}}{5} - \text{errors}}{\frac{\text{time\_seconds}}{60}}\right)\right)$
* **例外処理・境界値:**
  * `time_seconds <= 0` の場合は 0 除算を防ぎ `0` を返す。
  * `total_typed < 0` や `errors < 0` の場合は `ValueError` を発生させる。

#### ② `calculate_accuracy(total_typed: int, errors: int) -> float`
* **概要:** タイピングの正確率（%）を算出する。
* **引数:**
  * `total_typed` (`int`): 総打鍵数
  * `errors` (`int`): 総エラー数
* **戻り値:** `float` - 正確率（0.0 〜 100.0。小数第1位まで保持）
* **計算式:** $\text{Accuracy} = \max\left(0.0, \text{Round}\left(\frac{\text{total\_typed} - \text{errors}}{\text{total\_typed}} \times 100, 1\right)\right)$
* **例外処理・境界値:**
  * `total_typed == 0` の場合は `100.0` を返す。
  * `errors > total_typed` の場合は `0.0` を返す。

---

### 2.2 Typing Evaluator (`app/evaluator.py`)

ユーザーの入力キーと課題テキストの文字を照合し、判定結果を返すモジュール。

#### 型定義 (Dataclass / TypedDict)
```python
from dataclasses import dataclass

@dataclass
class EvaluationResult:
    is_correct: bool       # 入力文字が正解かどうか
    expected_char: str     # 本来打つべき文字
    typed_char: str        # ユーザーが入力した文字
    is_completed: bool     # テキスト全文の入力が完了したか
    current_index: int     # 次に入力すべき文字のインデックス

```

#### ① `evaluate_char(target_text: str, current_index: int, typed_char: str, mode: str = "strict") -> EvaluationResult`

* **概要:** ユーザーが入力した1文字を判定し、次の状態を返す。
* **引数:**
* `target_text` (`str`): 課題テキストの全文
* `current_index` (`int`): 現在のカーソル位置（0始まり）
* `typed_char` (`str`): 入力された文字（長さ1の文字列）
* `mode` (`str`): 判定モード (`"strict"`: 正解するまで進まない / `"free"`: 誤打鍵でも進む)


* **戻り値:** `EvaluationResult` オブジェクト
* **例外処理:**
* `len(typed_char) != 1` の場合 `ValueError` を発生させる。
* `current_index` が範囲外（`0 > current_index` または `current_index >= len(target_text)`）の場合 `IndexError` を発生させる。



---

### 2.3 Text Manager (`app/text_manager.py`)

タイピング練習用の課題テキストを管理・提供するモジュール。

#### ① `get_lesson_text(level: int, category: str = "default") -> str`

* **概要:** 指定されたレベル・カテゴリに応じた練習テキストを1件取得する。
* **引数:**
* `level` (`int`): 難易度レベル (1: ホームポジション / 2: 単語 / 3: 英文短文)
* `category` (`str`): テキストのカテゴリ (`"default"`, `"quotes"`, `"it_terms"` など)


* **戻り値:** `str` - 課題テキスト
* **例外処理:**
* 存在しない `level` や `category` が指定された場合は `ValueError` を発生させる。



---

## 3. pytest によるテスト実装計画

本詳細設計書に基づき、実装前に以下のテストコードを作成します（TDDの実施）。

* `tests/test_calculator.py`
* `test_calculate_wpm_normal()`: 正常系のWPM計算検証
* `test_calculate_wpm_zero_division()`: 経過時間 0 秒時の挙動検証
* `test_calculate_accuracy_boundary()`: 総打鍵数 0 や全ミスの境界値検証


* `tests/test_evaluator.py`
* `test_evaluate_char_strict_mode()`: Strictモードでの正解・不正解時のカーソル遷移検証
* `test_evaluate_char_invalid_input()`: 空文字や複数文字入力時の例外検証
