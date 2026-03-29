# %%
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pickle
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV
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
from sklearn.calibration import CalibratedClassifierCV

model = XGBClassifier(
    n_estimators=200,
    max_depth=4,          
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=2,       
    reg_alpha=1,
    random_state=42
)

calibrated_model = CalibratedClassifierCV(model, method='sigmoid')

calibrated_model.fit(X_train, y_train)

model = calibrated_model

# %%
y_pred = model.predict(X_test)
probs = model.predict_proba(X_test)[:,1]
#print(probs)
l=[0,0,0,0,0,0,0,0,0,0]
for x in probs:
    if x < 0.1: l[0] += 1
    elif x < 0.2: l[1] += 1
    elif x < 0.3: l[2] += 1
    elif x < 0.4: l[3] += 1
    elif x < 0.5: l[4] += 1
    elif x < 0.6: l[5] += 1
    elif x < 0.7: l[6] += 1
    elif x < 0.8: l[7] += 1
    elif x < 0.9: l[8] += 1
    else: l[9] += 1
print(l)
accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

# %%
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

# %%
