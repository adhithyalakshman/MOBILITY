from fastapi import APIRouter, Depends, HTTPException, status,BackgroundTasks,Request
from limiter import limiter
from login import get_current_user,require_role
from schemas import UserDB
from redis_client import set_driver_location
from basemodel import  DriverSuggestRequest,DriverSuggestResponse
from drivermodel import get_day_type,get_time_of_day,model,label_encoder
import pandas as pd
#  router
driver_router = APIRouter(prefix="/driver", tags=["driver"])
@driver_router.get("/")
@limiter.limit("10/minute")
def home(request: Request,current_user: UserDB = Depends(require_role("driver"))):
    return {"message":"you are welcome"}


@driver_router.post("/suggest-area", response_model=DriverSuggestResponse)
@limiter.limit("10/minute")
def suggest_area(
        request: Request,
        payload: DriverSuggestRequest,
        current_user: UserDB = Depends(require_role("driver"))
):
    # Auto-fill system fields
    time_of_day = get_time_of_day()
    day_of_week = get_day_type()

    # Prepare input DataFrame
    input_data = pd.DataFrame([{
        "end_area": payload.end_area,
        "distance_km": payload.distance_km,
        "time_of_day": time_of_day,
        "day_of_week": day_of_week,
        "weather_condition": payload.weather_condition.value,
        "traffic_density_level": payload.traffic_density_level.value,
        "road_type": payload.road_type.value,
        "average_speed_kmph": payload.average_speed_kmph
    }])

    # Predict
    prediction_encoded = model.predict(input_data)
    prediction = label_encoder.inverse_transform(prediction_encoded)[0]

    return DriverSuggestResponse(
        suggested_start_area=prediction
    )




