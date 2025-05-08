import pandas as pd
import os

# === Setup paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(BASE_DIR, "..", "data", "External_Cibil_Dataset.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "..", "data", "cleaned_model_dataset.csv")

# === Load dataset ===
df = pd.read_csv(INPUT_PATH)
df.columns = df.columns.str.strip()  # Clean column names

# === Define core 16 features only ===
selected_features = [
    "NETMONTHLYINCOME", "AGE", "Time_With_Curr_Empr", "CC_utilization", "PL_utilization",
    "enq_L6m", "tot_enq", "num_deliq_12mts", "max_delinquency_level", "num_std",
    "CC_Flag", "PL_Flag", "MARITALSTATUS", "EDUCATION", "GENDER", "Credit_Score", "Approved_Flag"
]

# Filter available columns
available_features = [f for f in selected_features if f in df.columns]
df = df[available_features].copy()

# === Impute -99999 with median — but no `_missing` flags ===
placeholder_cols = ["CC_utilization", "PL_utilization", "enq_L6m", "tot_enq", "max_delinquency_level"]

for col in placeholder_cols:
    if col in df.columns:
        df[col] = df[col].replace(-99999, pd.NA)
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val).infer_objects(copy=False)

# === Save cleaned dataset ===
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
df.to_csv(OUTPUT_PATH, index=False)
print(f"✅ Cleaned dataset saved at: {OUTPUT_PATH}")
