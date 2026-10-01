import pytest
from fastapi.testclient import TestClient
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

client = TestClient(app)

# 13. API health endpoint
def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["status"] == "ok"

# 14. Main prediction endpoint
def test_prediction_endpoint():
    response = client.get("/api/v1/stock/NVDA/prediction")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "result" in data
    assert data["result"]["ticker"] == "NVDA"
    assert "baseline" in data["result"]
    assert "direction" in data["result"]["baseline"]
