from features import load_and_prepare_data
from model import train_price_model, predict_latest


# Dataset location
DATA_PATH = "C:\\Users\\htc\\OneDrive\\Desktop\\HCL Training Project\\data\\nvidia_stock_data_1999_2026.csv"


print("=" * 60)
print("P_100 - NVIDIA STOCK PRICE PREDICTION")
print("=" * 60)


# Load and prepare dataset
df, feature_columns = load_and_prepare_data(DATA_PATH)

print(f"\nDataset rows: {len(df)}")
print(f"Features used: {len(feature_columns)}")


# Train price-only model
model, accuracy, f1, test_data = train_price_model(
    df,
    feature_columns
)


# Display evaluation
print("\nPRICE-ONLY MODEL")
print("-" * 40)

print(f"Accuracy : {accuracy:.4f}")
print(f"F1 Score : {f1:.4f}")


# Latest prediction
direction, probability = predict_latest(
    model,
    df,
    feature_columns
)


print("\nLATEST PREDICTION")
print("-" * 40)

print(f"Direction   : {direction}")
print(f"Probability : {probability:.2%}")


print("\n" + "=" * 60)
# print("Educational prototype only.")
# print("Not financial or investment advice.")
print("=" * 60)