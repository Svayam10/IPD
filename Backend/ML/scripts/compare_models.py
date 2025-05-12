import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_curve, auc

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "cleaned_model_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
OUTPUTS_DIR = os.path.join(BASE_DIR, "..", "outputs")
UTILS_DIR = os.path.join(BASE_DIR, "..", "utils")

df = pd.read_csv(DATA_PATH)
X = df.drop("Approved_Flag", axis=1)
y = joblib.load(os.path.join(UTILS_DIR, "target_encoder.pkl")).transform(df["Approved_Flag"])

encoders = joblib.load(os.path.join(UTILS_DIR, "label_encoders.pkl"))
for col, le in encoders.items():
    X[col] = le.transform(X[col])

_, X_test, _, y_test = joblib.load(os.path.join(UTILS_DIR, "train_test_split.pkl"))

model_files = [f for f in os.listdir(MODELS_DIR) if f.endswith(".pkl")]
models = {}
for model_file in model_files:
    model_name = model_file.replace(".pkl", "").replace("_", " ").title()
    models[model_name] = joblib.load(os.path.join(MODELS_DIR, model_file))

results = []
for name, model in models.items():
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)

    auc_score = None
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_prob, pos_label=1)
        auc_score = auc(fpr, tpr)

    results.append({"Model": name, "Accuracy": acc, "AUC": auc_score})

    print(f"\n🧠 Model: {name}")
    print(f"✅ Accuracy: {acc:.4f}")
    if auc_score:
        print(f"🎯 AUC: {auc_score:.4f}")
    print("📊 Classification Report:")
    print(classification_report(y_test, preds))

    cm = confusion_matrix(y_test, preds)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap="Blues", cbar=True)
    plt.title(f"Confusion Matrix - {name}")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUTS_DIR, f"confusion_matrix_{name.replace(' ', '_')}.png"))
    plt.close()

results_df = pd.DataFrame(results)
results_df.to_csv(os.path.join(OUTPUTS_DIR, "model_comparison_results.csv"), index=False)

plt.figure(figsize=(8, 5))
sns.barplot(x="Model", y="Accuracy", data=results_df, palette="viridis")
plt.ylabel("Accuracy")
plt.title("Model Accuracy Comparison")
plt.xticks(rotation=15)
for index, row in results_df.iterrows():
    plt.text(index, row["Accuracy"], f"{row['Accuracy']:.2%}", ha="center", va="bottom")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUTS_DIR, "model_accuracy_comparison.png"))
plt.close()

plt.figure(figsize=(10, 8))
for name, model in models.items():
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_prob, pos_label=1)
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f"{name} (AUC = {roc_auc:.2f})")

plt.plot([0, 1], [0, 1], "k--", label="Random Guess")
plt.title("ROC Curve Comparison")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.legend(loc="lower right")
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUTS_DIR, "roc_curve_comparison.png"))
plt.close()

print("\n🎯 Visuals and results saved to: outputs/")