import redis.asyncio as redis
from fastapi import HTTPException, status
import os,time
from dotenv import load_dotenv
load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
# Configurations
REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}"

# Initialize Redis Pool
pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True, max_connections=10)
redis_client = redis.Redis(connection_pool=pool)

# Constants
OTP_EXPIRY = 120           # 2 minutes
RATE_LIMIT_DURATION = 600  # 10 minutes
MAX_ATTEMPTS = 3

async def check_rate_limit(email: str):

    rate_key = f"rate_limit:{email}"
    current_count = await redis_client.get(rate_key)

    if current_count and int(current_count) >= MAX_ATTEMPTS:
        ttl = await redis_client.ttl(rate_key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many OTP requests. Try again in {ttl // 60} minutes."
        )

    pipe = redis_client.pipeline(transaction=True)

    pipe.incr(rate_key)
    if not current_count:
        pipe.expire(rate_key, RATE_LIMIT_DURATION)
    await pipe.execute()

async def store_otp(email: str, otp: str):

    await redis_client.setex(f"otp:{email}", OTP_EXPIRY, otp)

async def verify_otp_redis(email: str, otp: str) -> bool:

    stored_otp = await redis_client.get(f"otp:{email}")
    if stored_otp and stored_otp == otp:
        await redis_client.delete(f"otp:{email}")
        return True
    return False

async def mark_email_verified(email: str):

    await redis_client.setex(f"verified_status:{email}", 900, "true")

async def is_email_verified_status(email: str) -> bool:

    status = await redis_client.get(f"verified_status:{email}")
    return status == "true"

#   heart beat user online chack status
HEARTBEAT_TTL = 120  # seconds


async def update_user_heartbeat(email: str, role: str):

    current_time = int(time.time())

    # 1. Update individual key
    await redis_client.setex(f"user:online:{email}", HEARTBEAT_TTL, "true")

    # 2. Add/Update the user in the Sorted Set for their specific role
    # The score is the timestamp, the value is the email
    await redis_client.zadd(f"online_users:{role}", {email: current_time})

async def is_user_online(email: str) -> bool:
    key = f"user:online:{email}"
    exists = await redis_client.exists(key)
    return exists > 0


async def get_online_users_by_role(role: str) -> list[str]:


    # returns the active ones for a specific role.

    current_time = int(time.time())
    cutoff_time = current_time - HEARTBEAT_TTL

    # 1. Remove users who haven't sent a heartbeat in the last 30 seconds
    await redis_client.zremrangebyscore(f"online_users:{role}", 0, cutoff_time)

    # 2. Fetch all remaining (active) users
    active_users = await redis_client.zrange(f"online_users:{role}", 0, -1)

    return active_users

ONLINE_TIMEOUT = 120  # seconds

async def set_driver_location(email: str, area: str):
    key = f"driver:{email}"
    timestamp = int(time.time())

    await redis_client.hset(key, mapping={
        "area": area,
        "status": "online",
        "availability": "available",
        "last_seen": timestamp
    })

    await redis_client.zadd("drivers:online", {email: timestamp})
    await redis_client.expire(key, ONLINE_TIMEOUT)


async def update_driver_heartbeat(email: str):
    key = f"driver:{email}"
    timestamp = int(time.time())

    exists = await redis_client.exists(key)
    if not exists:
        return False

    await redis_client.hset(key, "last_seen", timestamp)
    await redis_client.zadd("drivers:online", {email: timestamp})
    await redis_client.expire(key, ONLINE_TIMEOUT)

    return True

async def update_rider_heartbeat(email: str):
    timestamp = int(time.time())
    await redis_client.zadd("riders:online", {email: timestamp})
