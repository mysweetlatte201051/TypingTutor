import pytest
from app.text_manager import load_texts, get_lesson_text


def test_load_texts_success():
    """JSONファイルが正しく読み込めるかテスト"""
    texts = load_texts()
    assert isinstance(texts, dict)
    assert "default" in texts
    assert "it_terms" in texts
    assert "quotes" in texts


def test_get_lesson_text_valid_levels():
    """Level 1 から Level 5 までのテキストが取得できるかテスト"""
    for level in ["1", "2", "3", "4", "5"]:
        text = get_lesson_text(level=level, category="default")
        assert isinstance(text, str)
        assert len(text) > 0


def test_get_lesson_text_fallback():
    """存在しないカテゴリやレベルが指定された場合のフォールバック処理テスト"""
    text = get_lesson_text(level="1", category="non_existent_category")
    assert isinstance(text, str)
    assert len(text) > 0