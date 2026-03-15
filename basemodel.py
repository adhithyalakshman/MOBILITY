from enum import Enum
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    set_password: str
    confirm_password: str
    role: Literal["rider", "driver"]

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'set_password' in values and v != values['set_password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(BaseModel):
    username: EmailStr  # Using email as username per your logic
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class EmailRequest(BaseModel):

    email: EmailStr
class OTPVerify(BaseModel):

    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class PasswordReset(BaseModel):

    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

DriverArea = Literal[
    "Preet Vihar",
    "Greater Kailash",
    "Vasant Kunj",
    "IGI Airport",
    "Saket",
    "Punjabi Bagh",
    "Nehru Place",
    "Dwarka",
    "Kalkaji",
    "AIIMS",
    "Rohini",
    "Okhla",
    "Civil Lines",
    "Model Town",
    "Janakpuri",
    "Karol Bagh",
    "Connaught Place",
    "Noida Sector 18",
    "Chandni Chowk",
    "Mayur Vihar",
    "Hauz Khas",
    "Pitampura",
    "Shahdara",
    "Rajouri Garden",
    "Lajpat Nagar"
]


class LocationUpdate(BaseModel):
    area: DriverArea

#  for dirver  surge model
class WeatherCondition(str, Enum):
    clear = "Clear"
    rain = "Rain"
    fog = "Fog"
    heatwave = "Heatwave"

class TrafficDensity(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    very_high = "Very High"

class RoadType(str, Enum):
    main = "Main Road"
    inner = "Inner Road"
    highway = "Highway"

class DayType(str, Enum):
    weekday = "Weekday"
    weekend = "Weekend"

class TimeOfDay(str, Enum):
    night = "Night"
    morning_peak = "Morning Peak"
    afternoon = "Afternoon"
    evening_peak = "Evening Peak"

class DriverSuggestRequest(BaseModel):
    end_area: str
    weather_condition: WeatherCondition
    traffic_density_level: TrafficDensity
    road_type: RoadType
    average_speed_kmph: float
    distance_km: float


class DriverSuggestResponse(BaseModel):
    suggested_start_area: str

# rider
class CaptainRequest(BaseModel):
    rider_area: DriverArea
    end_area: DriverArea
    weather_condition: WeatherCondition
    traffic_density_level: TrafficDensity
    road_type: RoadType
    distance_km: float
    time_of_day: TimeOfDay
    day_of_week: str

