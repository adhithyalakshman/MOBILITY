from redis_client import redis_client

HEARTBEAT_INTERVAL = 60       # seconds (frontend sends every 60 sec)
TTL_SECONDS = 120             # expiration time

def get_user_key(user_id: str) -> str:
    return f"user:online:{user_id}"


async def update_heartbeat(user_id: str):



    key = get_user_key(user_id)
    # Create or refresh user online key with TTL.

    # SET key value EX ttl (atomic operation)
    await redis_client.set(
        key,
        "1",
        ex=TTL_SECONDS
    )


async def is_user_online(user_id: str) -> bool:
    """
    Check if user key exists.
    """
    key = get_user_key(user_id)
    exists = await redis_client.exists(key)
    return exists == 1
