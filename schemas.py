from sqlalchemy import Column, Integer, String
from enum import Enum as pe
from sqlalchemy import Column, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserRole(str, pe):

    RIDER = "rider"
    DRIVER = "driver"
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), nullable=False)


# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
