# Typing Tutor ⌨️（English Typing Practice App）

> **Mac System 7 Homage English Typing Application**  
> 90年代クラシックMac（System 7）のGUIをオマージュした、TDD（テスト駆動開発）および CI パイプラインで構築された英語タイピング学習 Web アプリケーション。

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![pytest](https://img.shields.io/badge/pytest-PASSED-brightgreen.svg)
![Build Status](https://github.com/mysweetlatte201051/TypingTutor/actions/workflows/test.yml/badge.svg)

---

## 🌟 主な機能（Key Features）

- **レトロ＆モダン UI テーマ切り替え:** 90年代クラシックMac（System 7）風モノクロGUIと Modern Dark テーマをワンタップ切り替え（`localStorage` 保存）。
- **リアルタイム打鍵判定 Engine:** `Strict` モード（誤打鍵時に止まる）と `Free` モード（誤打鍵でも進む）に対応。
- **オンスクリーンキーボード & 指位置ガイド:** 次に入力すべきキーと推奨される指の位置（Home Position）をリアルタイムハイライト。
- **Web Audio API による効果音:** タイプライター風の打鍵音およびエラー時の低音警告音（遅延なし・トグル切り替え可能）。
- **Chart.js によるスコア推移グラフ:** 過去のタイピング練習履歴から WPM（入力速度）と Accuracy（正確率）の成長推移をビジュアル可視化。
- **JSON ベースの柔軟な練習テキスト管理:** Level 1（ホームポジション）から Level 4（長文段落）、Level 5（プログラミングコード / IT実務英文）まで拡張可能。

---

## 🏗️ Tech Stack

- **Backend:** Python 3.11+, Flask (RESTful Web API)
- **Testing / QA:** `pytest`, GitHub Actions (CI)
- **Frontend:** HTML5, CSS3 (CSS Variables), JavaScript (ES6+, Fetch API, Web Audio API, Chart.js)
- **Data Management:** JSON (`app/data/texts.json`), Browser `localStorage`

---

## 📂 Project Structure

```text
TypingTutor/
├── app/
│   ├── data/
│   │   └── texts.json         # レベル・カテゴリ別練習テキスト（Level 1〜5）
│   ├── api.py                 # Flask RESTful API エンドポイント
│   ├── calculator.py          # WPM / Accuracy 計算モジュール
│   ├── evaluator.py           # 打鍵判定コアロジック
│   └── text_manager.py        # JSONテキストデータ読み込みモジュール
├── static/
│   ├── css/style.css          # System 7 / Dark テーマ定義 & レスポンシブUI
│   └── js/main.js             # API通信, Web Audio API, Chart.js 描画ロジック
├── templates/
│   └── index.html             # メインアプリケーション画面
├── tests/                     # pytest 単体・統合テストスイート
│   ├── test_api.py
│   ├── test_calculator.py
│   ├── test_evaluator.py
│   └── test_text_manager.py
├── .github/workflows/
│   └── test.yml               # GitHub Actions CI パイプライン
└── requirements.txt
```

## 🚀Quick Start
1. リポジトリのクローン:

```Bash
git clone [https://github.com/mysweetlatte201051/TypingTutor.git](https://github.com/mysweetlatte201051/TypingTutor.git)
cd TypingTutor
````

2. 仮想環境構築と依存パッケージのインストール:

```Bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
````

3. テストの実行:

```Bash
pytest -v
````

4. アプリケーションの起動:

```Bash
python -m app.api
```

ブラウザで http://127.0.0.1:5000 にアクセスしてください。


## 📦 リリース履歴 (Release History)

### v1.2.0 (2026-11-01) - 外部テキスト自動インポート & UI/UX の刷新

* **外部テキスト自動インポート機能の追加 (`scripts/import_text.py`)**
  * 青空文庫や Project Gutenberg などの長文テキスト（`alice.txt` 等）を自動分割・整形し、`app/data/texts.json` へ取り込むスクリプトを追加。
  * テキスト読み込み時に、スマートクォート（`“”` `‘’`）やダッシュ記号（`—` `–`）を標準入力可能な記号（`"` `'` `-`）へ自動変換・標準化するロジックを実装。

* **設定モーダル（ポップアップ）とUI制御の刷新**
  * レッスン選択（Book / Category / Chapter / Level）や動作モード、テーマ設定を中央モーダル内に集約。
  * `Book / Category` の選択内容（Alice 等の本 vs 通常レベル）に応じて `Chapter` と `Level` の選択肢を動的に有効・無効（`disabled`）制御。
  * タイピング表示エリアの固定高化と縦スクロール対応を追加（現在打鍵中の位置への自動スクロール追従機能付き）。

* **デザイン・テーマ（Mac System 7）の品質改善**
  * レトロテーマ（`theme-system7`）適用時の未打鍵文字・現在位置カーソル・背景色の視認性と配色ロジックを改善。
  * キーボードのネクストキー（次打鍵ガイド）表示クラス名を統一し、ハイライト表示の不具合を修正。

* **バックエンド API の強化 (`app/api.py`)**
  * `/api/chapters`: 指定カテゴリ内のチャプター一覧を数値昇順（`1, 2, ..., 12`）でソートして返却する API を追加。
  * `/api/text`: `category`, `chapter`, `level` パラメータを柔軟に受け取り、適切なフォールバック処理を行うよう修正。
  * 単体テスト（`pytest`）の通過を確認。
---

### v1.1.1 (2026-11-01) - Bug Fixes & UI Improvements
- **Level 5 コードタイピングの機能改善・不具合修正**
  - **改行（Enter）キー入力の対応:** `\n`（改行文字）に対する打鍵判定および処理を拡張し、`Enter` キーで正常に改行・進行できるように修正。
  - **記号エスケープ・描画バグの修正:** `{`, `}`, `<`, `>` などの記号入力時における描画崩れおよび入力停止不具合を HTML エスケープ処理（`escapeHtml`）の分離により解消。
  - **UI/UX の向上:** 
    - 改行位置に視覚的な改行マーク（`↵`）を表示。
    - コードのインデント（連続スペース）を崩さずに保持表示（`white-space: pre-wrap;`）。
    - 入力中の文字（カーソル位置）を視認性の高い薄黄色ハイライト（`#ffff99`）で表示。

---

### v1.1.0 (2026-10) - Feature Enhancements
- Web Audio API による効果音・警告音再生機能の導入
- Chart.js を用いたタイピングスコア・WPM推移のグラフ表示機能
- 外部 JSON（`texts.json`）による Level 1〜5 の動的テキスト管理
