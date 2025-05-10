import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

# === Setup paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "cleaned_model_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
OUTPUTS_DIR = os.path.join(BASE_DIR, "..", "outputs")
UTILS_DIR = os.path.join(BASE_DIR, "..", "utils")

# Create directories if they don't exist
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(UTILS_DIR, exist_ok=True)

# === Load and preprocess data ===
df = pd.read_csv(DATA_PATH)
X = df.drop("Approved_Flag", axis=1)
y = df["Approved_Flag"]

# Encode categorical columns
from sklearn.preprocessing import LabelEncoder
encoders = {}
for col in X.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = le

# Save encoders for later use
joblib.dump(encoders, os.path.join(UTILS_DIR, "label_encoders.pkl"))

# Encode target variable
target_encoder = LabelEncoder()
y = target_encoder.fit_transform(y)
joblib.dump(target_encoder, os.path.join(UTILS_DIR, "target_encoder.pkl"))

# === Split data ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Save train-test split for later use
joblib.dump((X_train, X_test, y_train, y_test), os.path.join(UTILS_DIR, "train_test_split.pkl"))

# === Define models ===
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42),
}

# === Train and evaluate ===
results = {}
best_model = None
best_acc = 0

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

    # Save the best model
    if acc > best_acc:
        best_acc = acc
        best_model = model
        best_model_name = name

    # Save each model
    joblib.dump(model, os.path.join(MODELS_DIR, f"{name.replace(' ', '_').lower()}.pkl"))

# === Accuracy comparison plot ===
plt.figure(figsize=(8, 5))
sns.barplot(x=list(results.keys()), y=list(results.values()), palette="viridis")
plt.ylabel("Accuracy")
plt.title("Model Accuracy Comparison")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUTS_DIR, "model_accuracy_comparison.png"))
plt.close()

joblib.dump(best_model, os.path.join(MODELS_DIR, "best_model.pkl"))

print(f"\n✅ Best Model: {best_model_name} with Accuracy: {best_acc:.4f}")
print("📦 Models saved to: models/")
print("🎯 Visuals saved to: outputs/")