# ml_model.py

import joblib
import pandas as pd

model = joblib.load("driver_model.pkl")


def predict_eta(data: dict):

    df = pd.DataFrame([data])

    speed = model.predict(df)[0]

    distance = data["distance_km"]

    eta_minutes = (distance / speed) * 60

    return eta_minutes
