from fastapi import FastAPI
import pickle
from pydantic import BaseModel
app=FastAPI()

@app.get("/")
def home():
    return {"message":"api is working"}

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

class SessionData(BaseModel):
    avg_mouse_speed: float
    mouse_speed_variance: float
    click_interval_avg: float
    click_interval_variance: float
    typing_avg_delay: float
    typing_variance: float
    backspace_count: int
    scroll_speed: float
    hesitation_time: float
    session_duration: float
    actions_per_second: float

@app.post("/predict")
def predict(data: SessionData):
    features = [[
        data.avg_mouse_speed,
        data.mouse_speed_variance,
        data.click_interval_avg,
        data.click_interval_variance,
        data.typing_avg_delay,
        data.typing_variance,
        data.backspace_count,
        data.scroll_speed,
        data.hesitation_time,
        data.session_duration,
        data.actions_per_second
    ]]

    prediction = model.predict(features)[0]

    return {
        "prediction": int(prediction),
        "result": "human" if prediction == 1 else "bot"
    }