from fastapi import APIRouter, Depends, HTTPException, status,BackgroundTasks,Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pwdlib import PasswordHash
import os
from dotenv import load_dotenv



from basemodel import UserRegister, Token,EmailRequest, OTPVerify, PasswordReset
from schemas import UserDB, get_db,UserRole
from redis_client import check_rate_limit, store_otp, verify_otp_redis, mark_email_verified, is_email_verified_status
from email_utils import send_otp_email, generate_otp
from limiter import limiter



load_dotenv()


# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 2

# password acess object
password_hasher = PasswordHash.recommended()

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["Authentication"])



def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hasher.verify(plain_password, hashed_password)


def get_password_hash(password):
    return  password_hasher.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Routes
@router.post("/register/request-otp")
@limiter.limit("3/minute")
async def request_registration_otp(
    data: EmailRequest,
    request: Request,

    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    db_user = db.query(UserDB).filter(UserDB.email == data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Rate Limit
    await check_rate_limit(data.email)

    # Generate and Store OTP
    otp = generate_otp()
    await store_otp(data.email, otp)

    # Send Email
    background_tasks.add_task(send_otp_email, data.email, otp, "Registration OTP")

    return {"message": "OTP sent successfully"}


@router.post("/register/verify-otp")
async def verify_registration_otp(data: OTPVerify):
    is_valid = await verify_otp_redis(data.email, data.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")


    await mark_email_verified(data.email)

    return {"message": "Email verified successfully"}

@router.post("/register", response_model=Token)
async def register(user: UserRegister, db: Session = Depends(get_db)):
    #  Verify email
    if not await is_email_verified_status(user.email):
         raise HTTPException(status_code=400, detail="Email verification required first")

    #  Double check DB
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create User
    new_user = UserDB(
        name=user.name,
        email=user.email,
        phone_number=user.phone_number,
        hashed_password=get_password_hash(user.set_password),
        role=UserRole(user.role)
    )
    db.add(new_user)
    db.commit()

    #  Generate Token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password/request-otp")
async def forgot_password_request(
        request: EmailRequest,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    #  Check if user exists
    user = db.query(UserDB).filter(UserDB.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2.  Rate Limit
    await check_rate_limit(request.email)

    #  Generate & Store otp
    otp = generate_otp()
    await store_otp(request.email, otp)

    # Send Email
    background_tasks.add_task(send_otp_email, request.email, otp, "Reset Password OTP")

    return {"message": "OTP sent if email exists"}

@router.post("/forgot-password/reset")
async def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    # Verify OTP
    is_valid = await verify_otp_redis(data.email, data.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    #  Fetch User
    user = db.query(UserDB).filter(UserDB.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #  Update Password
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request,form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' field (which will be the user's email)
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email,"role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role : str = payload.get("role")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Fetch user from DB to ensure they still exist
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if user is None:
        raise credentials_exception
    return user

#  jwt based authorization


def require_role(required_role: str):
    def role_checker(current_user: UserDB = Depends(get_current_user)):
        if current_user.role.value != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return current_user
    return role_checker