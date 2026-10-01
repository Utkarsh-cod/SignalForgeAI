import os
import json
import requests
import pandas as pd

from dotenv import load_dotenv


load_dotenv()


API_KEY = os.getenv("LLM_API_KEY")
BASE_URL = os.getenv(
    "LLM_BASE_URL",
    "https://openrouter.ai/api/v1"
)
MODEL = os.getenv("LLM_MODEL")


def analyze_sentiment(headline):

    if not API_KEY:
        raise ValueError(
            "LLM_API_KEY is missing in .env"
        )

    if not MODEL:
        raise ValueError(
            "LLM_MODEL is missing in .env"
        )

    url = f"{BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are a financial news sentiment analyzer.

Analyze the following financial news headline.

Return ONLY valid JSON in this format:

{{
    "sentiment": "positive",
    "score": 0.75
}}

Rules:

- sentiment must be one of:
  positive, neutral, negative

- score must be between -1 and 1

Examples:

Positive:
{{"sentiment": "positive", "score": 0.8}}

Neutral:
{{"sentiment": "neutral", "score": 0.0}}

Negative:
{{"sentiment": "negative", "score": -0.8}}

Headline:
{headline}
"""

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You analyze financial news sentiment."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=60
    )

    response.raise_for_status()

    result = response.json()

    content = result["choices"][0]["message"]["content"]

    # Remove markdown code fences if returned
    content = content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    data = json.loads(content)

    sentiment = data["sentiment"]
    score = float(data["score"])

    # Safety validation
    if sentiment not in [
        "positive",
        "neutral",
        "negative"
    ]:
        sentiment = "neutral"

    score = max(-1, min(1, score))

    return sentiment, score


def process_news(input_file, output_file):

    df = pd.read_csv(input_file)

    sentiments = []
    scores = []

    for i, row in df.iterrows():

        headline = row["Headline"]

        print(
            f"Analyzing news {i + 1}/{len(df)}..."
        )

        sentiment, score = analyze_sentiment(
            headline
        )

        sentiments.append(sentiment)
        scores.append(score)

    df["sentiment"] = sentiments
    df["sentiment_score"] = scores

    df.to_csv(
        output_file,
        index=False
    )

    print(
        f"\nSentiment data saved to {output_file}"
    )


if __name__ == "__main__":

    process_news(
        "data/news.csv",
        "data/news_with_sentiment.csv"
    )