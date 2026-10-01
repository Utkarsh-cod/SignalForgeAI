# Evaluation

## Metrics
The ML pipeline computes the following performance metrics on the test dataset:
- **Accuracy**: Overall correct classification rate (UP vs DOWN).
- **Precision**: How often the model is correct when it predicts UP.
- **Recall**: The proportion of actual UP days the model correctly identified.
- **F1-Score**: Harmonic mean of Precision and Recall.
- **Confusion Matrix**: True Positives, False Positives, True Negatives, False Negatives.
- **Feature Importance**: Gini importance derived from the Random Forest classifier.

## Backtesting
The project features a built-in historical backtester to translate classification performance into hypothetical financial returns.
- **Rules**: If the model predicts UP, the strategy holds a long position for 1 day. If DOWN, it stays in cash (0% return).
- **Execution**: The strategy theoretically captures the `daily_return` of the *following* day.
- **Benchmark**: A simple "Buy and Hold" strategy of the same underlying asset.
- **Outputs**:
  - Cumulative Strategy Return vs Benchmark Return
  - Win Rate (percentage of winning trades)
  - Maximum Drawdown (largest peak-to-trough drop)

*Note: The backtest ignores trading fees, slippage, and market impact.*
