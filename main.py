from fastapi import FastAPI,Depends,Request

from fastapi.middleware.cors import CORSMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
from schemas import UserDB
from login import router as auth_router,get_current_user
from rider import rider_router
from driver import driver_router
from status import router as status_router
# main app
app=FastAPI()
origins = [
    "http://localhost:3000",   # React default
    "http://localhost:5173",   # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
#  routes
app.include_router(auth_router)
app.include_router(rider_router)
app.include_router(driver_router)
app.include_router(status_router)
@app.get("/",tags=["home"])
@limiter.limit("10/minute")
def home(request: Request,current_user: UserDB = Depends(get_current_user)):
    return {"message":"you are welcome"}
