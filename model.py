import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score


def train_price_model(df, feature_columns):

    # Split data chronologically
    # First 80% = training
    # Last 20% = testing
    split_index = int(len(df) * 0.8)

    train_data = df.iloc[:split_index]
    test_data = df.iloc[split_index:]

    # Training data
    X_train = train_data[feature_columns]
    y_train = train_data["target"]

    # Testing data
    X_test = test_data[feature_columns]
    y_test = test_data["target"]

    # Create Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=10
    )

    # Train model
    model.fit(X_train, y_train)

    # Predictions
    predictions = model.predict(X_test)

    # Evaluation
    accuracy = accuracy_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)

    return model, accuracy, f1, test_data


def predict_latest(model, df, feature_columns):

    # Get latest row
    latest_row = df.iloc[[-1]]

    # Predict direction
    prediction = model.predict(
        latest_row[feature_columns]
    )[0]

    # Prediction probability
    probabilities = model.predict_proba(
        latest_row[feature_columns]
    )[0]

    probability = probabilities[prediction]

    if prediction == 1:
        direction = "UP"
    else:
        direction = "DOWN"

    return direction, probability