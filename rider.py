from fastapi import APIRouter, Depends, HTTPException, status,BackgroundTasks,Request
from limiter import limiter
from login import get_current_user,require_role
from schemas import UserDB
from basemodel import CaptainRequest
from redis_client import redis_client,ONLINE_TIMEOUT
from rider_model import predict_eta
import time
#  router
rider_router= APIRouter(prefix="/rider", tags=["rider"])
@rider_router.get("/")
@limiter.limit("10/minute")
def home(request: Request,current_user: UserDB = Depends(require_role("rider"))):
    return {"message":"you are welcome"}


@rider_router.post("/get-captain")
async def get_captain(
        request: CaptainRequest,
        current_user: UserDB = Depends(require_role("rider"))
):

    current_time = int(time.time())
    cutoff = current_time - ONLINE_TIMEOUT

    # remove inactive drivers
    await redis_client.zremrangebyscore("drivers:online", 0, cutoff)

    drivers = await redis_client.zrange("drivers:online", 0, -1)

    if not drivers:
        return {"message": "No drivers online"}

    pipe = redis_client.pipeline()

    for email in drivers:
        pipe.hgetall(f"driver:{email}")

    results = await pipe.execute()

    driver_rank_list = []

    for email, data in zip(drivers, results):

        if not data:
            continue

        if data.get("availability") != "available":
            continue

        driver_area = data.get("area")

        model_input = {
            "start_area": driver_area,
            "end_area": request.end_area,
            "distance_km": request.distance_km,
            "time_of_day": request.time_of_day,
            "day_of_week": request.day_of_week,
            "weather_condition": request.weather_condition,
            "traffic_density_level": request.traffic_density_level,
            "road_type": request.road_type,
        }

        eta = predict_eta(model_input)

        driver_rank_list.append({
            "email": email,
            "area": driver_area,
            "eta_minutes": round(eta, 2)
        })

    if not driver_rank_list:
        return {"message": "No available drivers"}

    # ranking drivers by ETA
    driver_rank_list.sort(key=lambda x: x["eta_minutes"])

    return {
        "count": len(driver_rank_list),
        "ranked_drivers": driver_rank_list
    }
