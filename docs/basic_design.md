# タイピング学習アプリケーション『Typing Tutor』基本設計書

## 1. プロジェクト概要

1990年代のMacintosh版『Typing Tutor』が持つ「英文タイピングの向上」と「自然な英語学習」の両立というコンセプトを現代のWeb技術で再構築するプロジェクトです。  
正確な打鍵判定と詳細なスコア計測ロジックを備え、Python（`pytest`）による徹底した単体・統合テストを組み込むことで、高品質かつ拡張性の高いWebアプリケーションとして開発します。

---

## 2. システムアーキテクチャ

本システムは、コアロジックを分離したPythonバックエンドAPIと、軽量なフロントエンドで構成されます。


```

[ Frontend (HTML5 / CSS3 / Vanilla JS) ]
│
│ REST API / JSON
▼
[ Backend API (Flask / FastAPI) ]
│                      │
├─ Typing Evaluator    ├─ Score Calculator
└─ Text Manager        └─ Test Suite (pytest)

```

---

## 3. 技術スタック

| カテゴリ | 選定技術 | 採用理由 |
| :--- | :--- | :--- |
| **Language** | Python 3.11+ / JavaScript (ES6+) | ロジックの明瞭化とWeb標準への準拠 |
| **Backend** | Flask (または FastAPI) | APIの軽量構築とテスト容易性の確保 |
| **Testing** | pytest | アサーションの簡潔さとパラメータ化テストによる網羅性確保 |
| **Frontend** | HTML5, CSS3, JavaScript | 低レイテンシなキー入力レスポンスとシンプルな構成 |
| **CI/CD** | GitHub Actions | コミット/PR時の自動テスト実行 (`pytest`) パイプライン構築 |
| **Version Control** | Git / GitHub | ドキュメンテーションとアジャイルな機能開発管理 |

---

## 4. 機能要件

### 4.1 タイピング制御 & 計測モジュール (`evaluator.py`, `calculator.py`)
* **リアルタイムキー照合:** 入力キーと課題テキストの文字を即座に判定。
* **打鍵モード切替:**
  * **Strict Mode（厳格）:** 正しいキーを入力するまでカーソルが進行しない（標準）。
  * **Free Mode（流し打ち）:** 誤入力でもそのまま進行し、後からバックスペース等で修正可能。
* **指標計算:**
  * **WPM (Words Per Minute):** $( (総打鍵数 / 5) - エラー数 ) / 経過時間(分)$
  * **Accuracy (正確率):** $( (総打鍵数 - エラー数) / 総打鍵数 ) \times 100$ (%)

### 4.2 レッスン & テキスト管理モジュール (`text_manager.py`)
* **段階的レッスン構造:**
  1. **Level 1:** ホームポジション & キー配列習得 (e.g., `fjgh dksl a;`)
  2. **Level 2:** 英単語 & 基本フレーズ
  3. **Level 3:** 実用英文 & 名言・IT用語
* **カスタムテキスト機能:** ユーザーが練習用テキストを任意で入力・追加できるAPI。

---

## 5. テスト設計 (pytest構想)

ポートフォリオの品質担保として、単体テスト・境界値テスト・異常系テストを `pytest` で構築します。

### 5.1 テストケース構成


```

tests/
├── test_calculator.py   # WPM・正確率の計算ロジック検証
├── test_evaluator.py    # 文字列照合・ミス判定・入力制御検証
└── test_api.py          # APIエンドポイントのレスポンス検証

```

### 5.2 主なテスト観点表

| モジュール | テスト対象 | 検証内容 (`pytest` パラメータ化テスト活用) |
| :--- | :--- | :--- |
| `calculator.py` | `calculate_wpm()` | 正常入力時のWPM算出、打鍵数0の境界値、0除算の回避 |
| `calculator.py` | `calculate_accuracy()` | 全正解(100%)、全誤り(0%)、ミス入力時の正確率計算 |
| `evaluator.py` | `evaluate_char()` | 大文字/小文字の区別、スペース/記号打鍵の判定 |
| `text_manager.py`| `get_lesson()` | 指定レベルのテキスト取得、存在しないレベル指定時のエラーハンドリング |

---

## 6. ディレクトリ構造（予定）

```text
typing-tutor/
├── .github/
│   └── workflows/
│       └── test.yml          # GitHub Actions (pytest自動化)
├── app/
│   ├── __init__.py
│   ├── api.py                # REST API エンドポイント
│   ├── calculator.py         # WPM/正確率 計算ロジック
│   ├── evaluator.py          # 打鍵判定ロジック
│   └── text_manager.py       # テキスト・レッスン管理
├── static/
│   ├── css/style.css         # UIスタイル
│   └── js/main.js            # フロントエンドキーイベント制御
├── templates/
│   └── index.html            # メイン画面
├── tests/
│   ├── test_calculator.py
│   ├── test_evaluator.py
│   └── test_api.py
├── requirements.txt          # 依存ライブラリ一覧
└── README.md                 # プロジェクト概要

```

---

## 7. 開発・テストロードマップ

1. **Step 1:** リポジトリ作成 & `README.md` (本設計書) のコミット
2. **Step 2:** `pytest` を用いたコアロジックの TDD (テスト駆動開発) 実装
3. **Step 3:** Flask API の構築 & APIテスト作成
4. **Step 4:** HTML/CSS/JS によるフロントエンド画面実装 & キーレスポンス調整
5. **Step 5:** GitHub Actions による CI パイプライン（プッシュ時自動テスト）構築
