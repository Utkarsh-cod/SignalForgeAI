import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix
)
from typing import Dict, Any


def evaluate_model(
    model: object,
    test_data: pd.DataFrame,
    feature_columns: list
) -> Dict[str, Any]:
    """
    Evaluate the ML model on test data.
    Calculates Accuracy, F1, Precision, Recall,
    and Directional Accuracy.
    """

    X_test = test_data[feature_columns]
    y_test = test_data["target"]

    # PricePredictor.predict() returns:
    # (prediction, probability)
    #
    # For batch evaluation we need only the predicted
    # class labels, so use the underlying sklearn model.
    if hasattr(model, "model") and model.model is not None:
        predictions = model.model.predict(X_test)
    else:
        predictions = model.predict(X_test)

    acc = accuracy_score(y_test, predictions)
    f1 = f1_score(y_test, predictions, zero_division=0)
    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )
    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    # In this binary up/down prediction task,
    # directional accuracy is the same as accuracy.
    directional_accuracy = acc

    cm = confusion_matrix(y_test, predictions)

    feature_importance = {}

    if (
        hasattr(model, "model")
        and hasattr(model.model, "feature_importances_")
    ):
        imps = model.model.feature_importances_

        for feature, importance in zip(
            feature_columns,
            imps
        ):
            feature_importance[feature] = float(importance)

    return {
        "accuracy": float(acc),
        "f1": float(f1),
        "precision": float(precision),
        "recall": float(recall),
        "directional_accuracy": float(
            directional_accuracy
        ),
        "confusion_matrix": cm.tolist(),
        "feature_importance": feature_importance
    }