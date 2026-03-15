import joblib
from  datetime import datetime


def get_time_of_day():
    hour = datetime.now().hour

    if 0 <= hour < 6:
        return "Night"
    elif 6 <= hour < 11:
        return "Morning Peak"
    elif 11 <= hour < 17:
        return "Afternoon"
    else:
        return "Evening Peak"
get_time_of_day()




def get_day_type():
    weekday = datetime.now().weekday()
    return "Weekend" if weekday >= 5 else "Weekday"


saved = joblib.load("start_area_complete_model.pkl")
model = saved["model"]
label_encoder = saved["label_encoder"]
