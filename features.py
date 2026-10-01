import pandas as pd


def load_and_prepare_data(file_path):
    # Load dataset
    df = pd.read_csv(file_path)

    # Convert date
    df["date"] = pd.to_datetime(
        df["date"],
        format="%d-%m-%y"
    )

    # Sort chronologically
    df = df.sort_values("date").reset_index(drop=True)

    # Create daily return
    df["daily_return"] = df["close"].pct_change()

    # Create next-day direction target
    # 1 = price goes up
    # 0 = price goes down or stays same
    df["target"] = (
        df["close"].shift(-1) > df["close"]
    ).astype(int)

    feature_columns = [
        "open",
        "high",
        "low",
        "close",
        "volume",
        "market_cap_usd_bn",
        "quarterly_revenue_usd_bn",
        "sma_20",
        "sma_50",
        "sma_200",
        "rsi_14",
        "daily_return"
    ]

    df = df[
        ["date"] + feature_columns + ["target"]
    ]

    df = df.dropna().reset_index(drop=True)

    return df, feature_columns