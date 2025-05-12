import sys
import json
import pandas as pd
import joblib
import os

# Load the trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "models", "best_model.pkl")
model = joblib.load(model_path)

# Define the selected columns (same as frontend form fields)
selected_columns = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization",
    "PL_utilization", "enq_L6m", "tot_enq", "num_deliq_12mts",
    "max_delinquency_level", "num_std", "CC_Flag", "PL_Flag",
    "MARITALSTATUS", "EDUCATION", "GENDER", "Credit_Score"
]

# Read JSON from stdin (passed from Node.js backend)
try:
    input_data = json.loads(sys.stdin.read())
    df = pd.DataFrame([input_data])
except Exception as e:
    print(f"❌ Error reading input: {e}", file=sys.stderr)
    sys.exit(1)

# Convert numeric fields to the correct data types
numeric_fields = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization",
    "PL_utilization", "enq_L6m", "tot_enq", "num_deliq_12mts",
    "max_delinquency_level", "num_std", "CC_Flag", "PL_Flag", "Credit_Score"
]
df[numeric_fields] = df[numeric_fields].apply(pd.to_numeric, errors="coerce")

# One-hot encode categorical features
df = pd.get_dummies(df, columns=["MARITALSTATUS", "EDUCATION", "GENDER"], drop_first=True)

# Align with selected columns
for col in selected_columns:
    if col not in df.columns:
        df[col] = 0  # Add missing columns with default value
df = df[selected_columns]

# 🔍 Diagnostic logs (before prediction)
print("🧪 Final input columns:", df.columns.tolist(), file=sys.stderr)
print("🧾 Input values:", df.iloc[0].to_dict(), file=sys.stderr)

# Predict
try:
    prediction = model.predict(df)[0]
    print("🧠 Raw model output:", prediction, file=sys.stderr)
except Exception as e:
    print(f"❌ Error during prediction: {e}", file=sys.stderr)
    sys.exit(1)

# Map encoded class back to label
class_map = {0: "P1", 1: "P2", 2: "P3", 3: "P4"}
predicted_class = class_map.get(prediction, "Unknown")

# Output only the predicted class to stdout
print(predicted_class)