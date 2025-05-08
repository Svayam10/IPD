import joblib
import pandas as pd
import os

# === Step 1: Define 16-feature input (no _missing flags) ===
input_data = {
    "NETMONTHLYINCOME": 18000,
    "AGE": 38,
    "Time_With_Curr_Empr": 4,
    "CC_utilization": 95,
    "PL_utilization": 88,
    "enq_L6m": 6,
    "tot_enq": 9,
    "num_deliq_12mts": 4,
    "max_delinquency_level": 4,
    "num_std": 5,
    "CC_Flag": 0,
    "PL_Flag": 0,
    "MARITALSTATUS": "Single",
    "EDUCATION": "SSC",
    "GENDER": "M",
    "Credit_Score": 570  # Ensure this matches the training feature name
}

# === Step 2: Set up paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "best_model.pkl")

# === Step 3: Load the trained model ===
model = joblib.load(MODEL_PATH)

# === Step 4: Convert input data to DataFrame ===
df_input = pd.DataFrame([input_data])

# === Step 5: Preprocess the input data ===
# Convert numeric fields to the correct data types
numeric_fields = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization",
    "PL_utilization", "enq_L6m", "tot_enq", "num_deliq_12mts",
    "max_delinquency_level", "num_std", "CC_Flag", "PL_Flag", "Credit_Score"
]
df_input[numeric_fields] = df_input[numeric_fields].apply(pd.to_numeric, errors="coerce")

# One-hot encode categorical features
df_input = pd.get_dummies(df_input, columns=["MARITALSTATUS", "EDUCATION", "GENDER"], drop_first=True)

# Align with the model's expected columns
selected_columns = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization",
    "PL_utilization", "enq_L6m", "tot_enq", "num_deliq_12mts",
    "max_delinquency_level", "num_std", "CC_Flag", "PL_Flag",
    "MARITALSTATUS", "EDUCATION", "GENDER", "Credit_Score"
]
for col in selected_columns:
    if col not in df_input.columns:
        df_input[col] = 0  # Add missing columns with default value
df_input = df_input[selected_columns]

# === Step 6: Predict the class ===
try:
    pred_numeric = model.predict(df_input)[0]
    print(f"🧠 Raw model output: {pred_numeric}")
except Exception as e:
    print(f"❌ Error during prediction: {e}")
    exit(1)

# === Step 7: Map the numeric output to a class label ===
class_map = {0: "P1", 1: "P2", 2: "P3", 3: "P4"}
pred_label = class_map.get(pred_numeric, "Unknown")
print(f"\n📌 Predicted Creditworthiness Class: {pred_label}")