import pytest
from app.api import app


@pytest.fixture
def client():
    """Flask のテストクライアントを提供するフィクスチャ"""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestApiEndpoints:
    """Flask API エンドポイントの統合テスト"""

    def test_get_text_endpoint(self, client):
        """GET /api/text: テキスト取得 API の正常系テスト"""
        response = client.get("/api/text?level=3&category=default")
        assert response.status_code == 200
        data = response.get_json()
        assert "text" in data
        assert isinstance(data["text"], str)

    def test_evaluate_endpoint(self, client):
        """POST /api/evaluate: 打鍵判定 API の正常系テスト"""
        payload = {
            "target_text": "Hello",
            "current_index": 0,
            "typed_char": "H",
            "mode": "strict",
        }
        response = client.post("/api/evaluate", json=payload)
        assert response.status_code == 200
        data = response.get_json()
        assert data["is_correct"] is True
        assert data["current_index"] == 1

    def test_calculate_endpoint(self, client):
        """POST /api/calculate: スコア計算 API の正常系テスト"""
        payload = {
            "total_typed": 150,
            "errors": 5,
            "time_seconds": 60.0,
        }
        response = client.post("/api/calculate", json=payload)
        assert response.status_code == 200
        data = response.get_json()
        assert data["wpm"] == 25
        assert data["accuracy"] == 96.7