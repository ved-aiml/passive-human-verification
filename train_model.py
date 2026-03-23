# %%
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pickle

# %%
df = pd.read_csv("dataset.csv")

# %%
print(df.head())
print(df.shape)

# %%
X = df.drop("label", axis=1)
y = df["label"]

# %%
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# %%
model = RandomForestClassifier()
model.fit(X_train, y_train)

# %%
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

# %%
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

# %%
