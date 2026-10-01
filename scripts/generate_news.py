import pandas as pd
import numpy as np
import os
import random

DATA_PATH = os.path.join("data", "nvidia_stock_data_1999_2026.csv")
OUTPUT_PATH = os.path.join("data", "news.csv")

# NOTE: This generates synthetic news for development purposes only.
# It does NOT look at the target or future prices to prevent leakage.
# Real historical news should be used for production.

HEADLINE_TEMPLATES = [
    "NVIDIA announces new breakthrough in AI computing.",
    "Market analysts raise target price for NVIDIA.",
    "NVIDIA faces potential supply chain delays.",
    "Competitor launches new AI chip to challenge NVIDIA.",
    "NVIDIA reports strong quarterly earnings.",
    "Tech sector sees broad sell-off, NVIDIA affected.",
    "New partnership between NVIDIA and major cloud provider.",
    "Regulatory scrutiny increases over NVIDIA acquisitions.",
    "NVIDIA CEO speaks at major technology conference.",
    "Investors await NVIDIA's upcoming product launch."
]

def generate_synthetic_news(num_articles: int = 1000):
    np.random.seed(42)
    random.seed(42)
    
    if not os.path.exists(DATA_PATH):
        print(f"Error: Could not find {DATA_PATH}")
        return
        
    df = pd.read_csv(DATA_PATH)
    try:
        df["date"] = pd.to_datetime(df["date"], format="%d-%m-%y")
    except Exception:
        df["date"] = pd.to_datetime(df["date"])
        
    # Get a range of dates from the dataset (last 2 years approx to limit size)
    recent_dates = df["date"].tail(500).tolist()
    
    news_data = []
    
    for _ in range(num_articles):
        # Pick a random date from the recent dates
        dt = random.choice(recent_dates)
        
        # Sometimes there's 1 article, sometimes multiple per day
        headline = random.choice(HEADLINE_TEMPLATES)
        
        # Add random noise to headline to make them unique
        headline = headline.replace(".", f" in {dt.strftime('%B')}.")
        
        news_data.append({
            "date": dt.strftime("%Y-%m-%d"),
            "headline": headline,
            "source": "SyntheticNewsGenerator",
            "url": "http://synthetic-news.local"
        })
        
    news_df = pd.DataFrame(news_data)
    news_df = news_df.sort_values("date").reset_index(drop=True)
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    news_df.to_csv(OUTPUT_PATH, index=False)
    
    print(f"Successfully generated {num_articles} synthetic news articles.")
    print(f"Saved to: {OUTPUT_PATH}")
    print("WARNING: This is synthetic data for development. Do not use for real trading.")

if __name__ == "__main__":
    generate_synthetic_news(500)
