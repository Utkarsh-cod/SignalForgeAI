import os
import requests
from dotenv import load_dotenv

load_dotenv("../.env")

url = os.getenv("LLM_BASE_URL") + "/chat/completions"
api_key = os.getenv("LLM_API_KEY")
model = os.getenv("LLM_MODEL")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

payload = {
    "model": model,
    "messages": [
        {
            "role": "user",
            "content": (
                "Analyze this financial headline. "
                "Return ONLY valid JSON with exactly these fields: "
                "sentiment, score, confidence. "
                "Sentiment must be positive, neutral, or negative. "
                "Score must be between -1 and 1. "
                "Confidence must be between 0 and 1. "
                "Headline: NVIDIA reports strong quarterly earnings "
                "and raises its revenue outlook."
            ),
        }
    ],
    "temperature": 0,
}

print("Model:", model)
print("URL:", url)

try:
    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=30,
    )

    print("Status:", response.status_code)
    print("Response:")
    print(response.text)

except Exception as e:
    print("ERROR:", e)