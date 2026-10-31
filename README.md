# ⌨️ Typing Tutor (English Typing Practice App)

> 約30年前のMac版『Typing Tutor』にオマージュを捧げた、レトロテーマ対応の英語タイピング学習Webアプリケーション。
> テスト駆動開発（TDD）による堅牢なバックエンド設計と、GitHub ActionsによるCI（継続的インテグレーション）自動テストパイプラインを構築したポートフォリオ作品です。

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=flat&logo=flask&logoColor=white)
![pytest](https://img.shields.io/badge/pytest-Passed-0A9EDC?style=flat&logo=pytest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat&logo=githubactions&logoColor=white)

---

## 🌟 主な機能 (Key Features)

- **リアルタイム打鍵判定 & スコア計算 API**
  - **モード切り替え:** ミス時に打鍵をストップする `Strict` モードと、ミスを許容して進む `Free` モードをサポート。
  - **リアルタイム計算:** 入力スピード（WPM: Words Per Minute）および正確率（Accuracy）をリアルタイムで算出。
- **レトロ＆モダン UI テーマ機能**
  - **Mac System 7 (1991):** 90年代クラシックMac（System 7風）のモノクロ・立体グレーデザイン。
  - **Modern Dark:** 視認性に優れたモダンなダークテーマ。
  - テーマ設定はブラウザの `localStorage` に保持されます。
- **オンスクリーンキーボード & 指位置ガイド**
  - 次に押すべきキーをリアルタイムでハイライト表示。
  - ホームポジションおよび推奨する指（左小指、右人差し指など）を日本語・英語で案内。
- **練習スコア履歴（Practice History）**
  - レッスン完了時のWPM、正確率、日時、チャレンジレベルを `localStorage` に保存。
  - 過去の練習履歴をテーブル一覧でいつでも振り返り・クリア可能。
- **豊富な練習コンテンツ**
  - レベル別（ホームポジション / 単語 / 英文）およびカテゴリ別（デフォルト / IT用語 / 名言）の課題テキストを搭載。

---

## 🛠 技術スタック (Tech Stack)

### Backend / Quality Assurance
- **Language:** Python 3.11+
- **Framework:** Flask (RESTful Web API)
- **Testing:** pytest (単体テスト・API統合テスト)
- **CI/CD:** GitHub Actions (コードPush時の全テスト自動実行)

### Frontend
- **HTML5 / CSS3** (CSS変数を用いた動的テーマ切り替え、レスポンシブデザイン)
- **JavaScript (ES6+)** (Fetch APIによる非同期通信、DOM操作、`localStorage` 活用)

---

## 🏗 ディレクトリ構造 (Project Structure)

```text
TypingTutor/
├── .github/
│   └── workflows/
│       └── test.yml          # GitHub Actions CI パイプライン定義
├── app/
│   ├── __init__.py
│   ├── api.py                # Flask Web API & ルーティング
│   ├── calculator.py         # WPM・正確率計算ロジック
│   ├── evaluator.py          # 打鍵正誤判定ロジック
│   └── text_manager.py       # 練習用テキストデータ管理
├── static/
│   ├── css/
│   │   └── style.css         # UIスタイル & System 7 レトロテーマ定義
│   └── js/
│       └── main.js           # フロントエンドロジック & イベントハンドラ
├── templates/
│   └── index.html            # メイン画面HTML
├── tests/
│   ├── test_api.py           # API統合テスト
│   ├── test_calculator.py    # 計算ロジック単体テスト
│   ├── test_evaluator.py     # 判定ロジック単体テスト
│   └── test_text_manager.py # テキスト管理単体テスト
├── requirements.txt          # 依存ライブラリ一覧
└── README.md
```

## 🚀 起動手順 (Local Setup)
1. リポジトリのクローンと移動
```Bash
git clone [https://github.com/mysweetlatte201051/TypingTutor.git](https://github.com/mysweetlatte201051/TypingTutor.git)
cd TypingTutor
```

2. 仮想環境の作成とライブラリのインストール
```Bash
python -m venv .venv
source .venv/bin/activate  # Windowsの場合: .venv\Scripts\activate
pip install -r requirements.txt
```

3. pytest による自動テストの実行
```Bash
pytest -v
```

4. アプリケーションの起動
```Bash
python -m app.api
```
起動後、ブラウザで http://127.0.0.1:5000 にアクセスしてご利用ください。