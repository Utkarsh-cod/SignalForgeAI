import os
import sys
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.engines.sentiment_llm import SentimentEngine

NEWS_PATH = os.path.join("data", "news.csv")
OUTPUT_PATH = os.path.join("data", "news_with_sentiment.csv")

def main():
    if not os.path.exists(NEWS_PATH):
        print(f"Error: {NEWS_PATH} not found. Run generate_news.py first.")
        return
        
    print("Initializing Sentiment Engine...")
    engine = SentimentEngine(db_path=os.path.join("data", "sentiment_cache.db"))
    
    print(f"Loading {NEWS_PATH}...")
    df = pd.read_csv(NEWS_PATH)
    
    sentiments = []
    scores = []
    confidences = []
    
    print("Scoring news headlines...")
    for i, headline in enumerate(df["headline"]):
        if i % 50 == 0:
            print(f"Processed {i}/{len(df)}...")
        result = engine.analyze(headline)
        sentiments.append(result["sentiment"])
        scores.append(result["score"])
        confidences.append(result["confidence"])
        
    df["sentiment"] = sentiments
    df["sentiment_score"] = scores
    df["sentiment_confidence"] = confidences
    
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved scored news to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
