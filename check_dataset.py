import pandas as pd
import glob

files = glob.glob("data/*.csv")

if not files:
    print("No CSV file found in the data folder.")
    exit()

file_path = files[0]

print("Reading:", file_path)

df = pd.read_csv(file_path)

print("\nColumns:")
print(df.columns.tolist())

print("\nShape:")
print(df.shape)

print("\nFirst 5 rows:")
print(df.head())