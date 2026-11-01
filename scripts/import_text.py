import json
import os
import re

# パス設定（プロジェクトルートからの相対パス）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, "app", "data", "texts.json")
TXT_INPUT_PATH = os.path.join(BASE_DIR, "alice.txt")  # ルートに配置するテキストファイル


def import_text_to_json(category_name="alice", input_file_path=TXT_INPUT_PATH):
    """
    テキストファイルをチャプター・段落ごとに分割し、texts.json へ自動保存するスクリプト
    """
    if not os.path.exists(input_file_path):
        print(f"エラー: 入力ファイル '{input_file_path}' が見つかりません。")
        print("プロジェクトのルート直下に 'alice.txt' を配置してください。")
        return

    # 1. 既存の JSON データを読み込む
    json_data = {}
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            try:
                json_data = json.load(f)
            except json.JSONDecodeError:
                print(f"警告: {JSON_PATH} の読み込みに失敗しました。新規作成します。")

    # 2. テキストファイルを読み込む
    with open(input_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 3. チャプター（CHAPTER I, CHAPTER II 等）ごとに分割する正規表現
    # CHAPTER + ローマ数字（I, II, III...）またはアラビア数字にマッチ
    chapters = re.split(r"(CHAPTER\s+[IVXLCDM\d]+.*)", content, flags=re.IGNORECASE)

    parsed_chapters = {}
    current_chapter_num = 1

    # 分割されたテキストをパース
    # chapters[0] は見出し前のプリアンブル（ヘッダー等）、奇数インデックスが見出し、偶数インデックスが本文
    if len(chapters) > 1:
        for i in range(1, len(chapters), 2):
            chapter_title = chapters[i].strip()
            chapter_body = chapters[i + 1].strip() if i + 1 < len(chapters) else ""

            # 改行を整形し、タイピングしやすい適切な長さの段落（20文字以上）に切り分ける
            paragraphs = [
                p.replace("\n", " ").strip()
                for p in chapter_body.split("\n\n")
                if len(p.strip()) > 20
            ]

            if paragraphs:
                parsed_chapters[str(current_chapter_num)] = paragraphs
                current_chapter_num += 1
    else:
        # チャプター見出しがない場合は段落ごとに分割して Level 1（"1"）として格納
        paragraphs = [
            p.replace("\n", " ").strip()
            for p in content.split("\n\n")
            if len(p.strip()) > 20
        ]
        parsed_chapters["1"] = paragraphs

    # 4. 指定したカテゴリ名（例: 'alice'）で JSON データを更新
    json_data[category_name] = parsed_chapters

    # 5. JSON ファイルへ安全に書き戻す
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    print(f"成功: '{category_name}' カテゴリに {len(parsed_chapters)} 章の文章を texts.json へインポートしました！")


if __name__ == "__main__":
    import_text_to_json()