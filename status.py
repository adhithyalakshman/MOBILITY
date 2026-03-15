# Create a new file named status.py

from fastapi import APIRouter, Depends, HTTPException
from schemas import UserDB
from login import get_current_user
from redis_client import update_user_heartbeat, is_user_online,get_online_users_by_role,redis_client,update_driver_heartbeat,update_rider_heartbeat,set_driver_location,ONLINE_TIMEOUT
from basemodel import LocationUpdate
router = APIRouter(prefix="/status", tags=["User Status"])
import time
@router.post("/heartbeat")
async def heartbeat(current_user: UserDB = Depends(get_current_user)):

    if current_user.role.value == "driver":

        updated = await update_driver_heartbeat(current_user.email)
        if not updated:
            raise HTTPException(
                status_code=400,
                detail="Location not set. Please set location first."
            )

    else:
        await update_rider_heartbeat(current_user.email)

    return {"status": "alive"}

@router.get("/online/{email}")
async def check_user_status(email: str):
    #   ro check weather particular user online
    online = await is_user_online(email)
    return {"email": email, "is_online": online}

@router.post("/driver/set-location")
async def set_location(
    data: LocationUpdate,
    current_user: UserDB = Depends(get_current_user)
):
    if current_user.role.value != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can set location")

    await set_driver_location(current_user.email, data.area)

    return {"message": "Location set successfully"}



async def get_online_riders():
    """Returns a list of all currently online riders."""
    riders = await get_online_users_by_role("rider")
    return {"online_riders": riders, "count": len(riders)}


async def get_online_drivers():
    """Returns a list of all currently online drivers."""
    drivers = await get_online_users_by_role("driver")
    return {"online_drivers": drivers, "count": len(drivers)}

HEARTBEAT_TTL = 30

async def update_rider_state(email: str):
    """Sets rider as online with an auto-expiring TTL."""
    key = f"rider:online:{email}"
    await redis_client.setex(key, HEARTBEAT_TTL, "true")

async def update_driver_state(email: str, location: str, is_committed: bool):
    """Stores driver state in a hash with an auto-expiring TTL."""
    key = f"driver:state:{email}"
    mapping = {
        "location": location,
        "is_committed": str(is_committed).lower(),
        "activity": "online",

    }
    # Save the hash and set the expiration timer
    await redis_client.hset(key, mapping=mapping)
    await redis_client.expire(key, HEARTBEAT_TTL)

async def get_driver_state(email: str) -> dict:
    """Retrieves driver state. Returns empty dict if offline/expired."""
    key = f"driver:state:{email}"
    # hgetall returns byte strings depending on your redis client config,
    # handle decoding appropriately
    state = await redis_client.hgetall(key)
    return state


@router.get("/online-drivers")
async def get_online_drivers():

    current_time = int(time.time())
    cutoff = current_time - ONLINE_TIMEOUT

    # remove inactive drivers
    await redis_client.zremrangebyscore("drivers:online", 0, cutoff)

    drivers = await redis_client.zrange("drivers:online", 0, -1)

    pipe = redis_client.pipeline()

    for email in drivers:
        pipe.hgetall(f"driver:{email}")

    results = await pipe.execute()

    driver_list = []

    for email, data in zip(drivers, results):

        if not data:
            continue

        driver_list.append({
            "email": email,
            "area": data.get("area"),
            "availability": data.get("availability"),
            "last_seen": data.get("last_seen")
        })

    return {
        "drivers": driver_list,
        "count": len(driver_list)
    }

