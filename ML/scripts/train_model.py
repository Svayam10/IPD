import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

# === Setup dynamic paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "cleaned_model_dataset.csv")
OUTPUTS_DIR = os.path.join(BASE_DIR, "..", "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
UTILS_DIR = os.path.join(BASE_DIR, "..", "utils")

os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(UTILS_DIR, exist_ok=True)

# === Load dataset ===
df = pd.read_csv(DATA_PATH)

# === Prepare features and target ===
X = df.drop("Approved_Flag", axis=1)

# Encode target labels: 'P1', 'P2', 'P3', 'P4' → 0, 1, 2, 3
target_encoder = LabelEncoder()
y = target_encoder.fit_transform(df["Approved_Flag"])
joblib.dump(target_encoder, os.path.join(UTILS_DIR, "target_encoder.pkl"))

# === Encode categorical columns ===
cat_cols = X.select_dtypes(include=["object"]).columns
encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = le  # Save encoder for inference

# === Train-test split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Define models ===
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=100),
    "Decision Tree": DecisionTreeClassifier(),
    "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric="mlogloss")
}

results = {}
best_model = None
best_acc = 0

# === Train and evaluate ===
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    results[name] = acc

    print(f"\n🧠 Model: {name}")
    print(f"✅ Accuracy: {acc:.4f}")
    print("📊 Classification Report:")
    print(classification_report(y_test, preds))

    # Save confusion matrix plot
    cm = confusion_matrix(y_test, preds)
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap="Blues")
    plt.title(f"Confusion Matrix - {name}")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUTS_DIR, f"confusion_matrix_{name.replace(' ', '_')}.png"))
    plt.close()

    # Track best model
    if acc > best_acc:
        best_acc = acc
        best_model = model
        best_model_name = name

# === Accuracy comparison plot ===
plt.figure(figsize=(8, 5))
sns.barplot(x=list(results.keys()), y=list(results.values()))
plt.ylabel("Accuracy")
plt.title("Model Accuracy Comparison")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUTS_DIR, "model_accuracy_comparison.png"))
plt.close()

# === Save best model and encoders ===
joblib.dump(best_model, os.path.join(MODELS_DIR, "best_model.pkl"))
joblib.dump(encoders, os.path.join(UTILS_DIR, "label_encoders.pkl"))

print(f"\n✅ Best Model: {best_model_name} with Accuracy: {best_acc:.4f}")
print("📦 Model saved to: models/best_model.pkl")
print("🎯 Visuals saved to: outputs/")
