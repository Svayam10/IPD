import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# === Setup paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
OUTPUTS_DIR = os.path.join(BASE_DIR, "..", "outputs")
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "cleaned_model_dataset.csv")

# === Load the trained model ===
model_path = os.path.join(MODELS_DIR, "best_model.pkl")  # Change to the desired model file
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")

model = joblib.load(model_path)

# === Load the dataset to get feature names ===
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Dataset file not found: {DATA_PATH}")

df = pd.read_csv(DATA_PATH)

# Ensure the dataset contains the 16 features you provided
expected_features = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization", "PL_utilization",
    "enq_L6m", "tot_enq", "num_deliq_12mts", "max_delinquency_level", "num_std",
    "CC_Flag", "PL_Flag", "MARITALSTATUS", "EDUCATION", "GENDER", "Credit_Score"
]
missing_features = [feature for feature in expected_features if feature not in df.columns]
if missing_features:
    raise ValueError(f"The following expected features are missing from the dataset: {missing_features}")

X = df[expected_features]  # Use only the 16 features for feature importance

# === Check if the model supports feature importances ===
if hasattr(model, "feature_importances_"):
    feature_importances = model.feature_importances_
    importance_df = pd.DataFrame({
        "Feature": X.columns,
        "Importance": feature_importances
    }).sort_values(by="Importance", ascending=False)

    # Save feature importance to a CSV file
    importance_csv_path = os.path.join(OUTPUTS_DIR, "feature_importance_xgboost.csv")
    importance_df.to_csv(importance_csv_path, index=False)
    print(f"📁 Feature importance saved to: {importance_csv_path}")

    # Plot feature importance
    plt.figure(figsize=(10, 6))
    sns.barplot(x="Importance", y="Feature", data=importance_df, palette="coolwarm", hue=None, legend=False)
    plt.title("Feature Importance - XGBoost")
    plt.xlabel("Importance Score")
    plt.ylabel("Features")
    plt.tight_layout()

    # Save the plot
    importance_plot_path = os.path.join(OUTPUTS_DIR, "feature_importance_xgboost.png")
    plt.savefig(importance_plot_path)
    print(f"📊 Feature importance plot saved to: {importance_plot_path}")
    # plt.show()
else:
    print("❌ The selected model does not support feature importances.")