import joblib
import pandas as pd
import os

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
    "Credit_Score": 570  
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "best_model.pkl")

model = joblib.load(MODEL_PATH)

df_input = pd.DataFrame([input_data])

numeric_fields = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization",
    "PL_utilization", "enq_L6m", "tot_enq", "num_deliq_12mts",
    "max_delinquency_level", "num_std", "CC_Flag", "PL_Flag", "Credit_Score"
]
df_input[numeric_fields] = df_input[numeric_fields].apply(pd.to_numeric, errors="coerce")

df_input = pd.get_dummies(df_input, columns=["MARITALSTATUS", "EDUCATION", "GENDER"], drop_first=True)

selected_columns = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization",
    "PL_utilization", "enq_L6m", "tot_enq", "num_deliq_12mts",
    "max_delinquency_level", "num_std", "CC_Flag", "PL_Flag",
    "MARITALSTATUS", "EDUCATION", "GENDER", "Credit_Score"
]
for col in selected_columns:
    if col not in df_input.columns:
        df_input[col] = 0  
df_input = df_input[selected_columns]

try:
    pred_numeric = model.predict(df_input)[0]
    print(f"🧠 Raw model output: {pred_numeric}")
except Exception as e:
    print(f"❌ Error during prediction: {e}")
    exit(1)

class_map = {0: "P1", 1: "P2", 2: "P3", 3: "P4"}
pred_label = class_map.get(pred_numeric, "Unknown")
print(f"\n📌 Predicted Creditworthiness Class: {pred_label}")