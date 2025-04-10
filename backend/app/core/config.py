import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

API_V1_STR = "/api/v1"
PROJECT_NAME = "Waste Whirl"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.warning("DATABASE_URL not found in environment variables.")
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            logger.info(f"Contents of .env file: {f.read()}")

if DATABASE_URL and DATABASE_URL.startswith("postgresql+psycopg2") and ENVIRONMENT != "testing":
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2", "postgresql+asyncpg")
    SYNC_DATABASE_URL = DATABASE_URL
else:
    ASYNC_DATABASE_URL = DATABASE_URL
    SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2") if DATABASE_URL else None

# Support both bucket name environment variables
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME") or os.getenv("AWS_BUCKET_NAME")
AWS_CLOUDFRONT_URL = os.getenv("AWS_CLOUDFRONT_URL")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

class Settings:
    API_V1_STR = API_V1_STR
    PROJECT_NAME = PROJECT_NAME
    ENVIRONMENT = ENVIRONMENT
    DATABASE_URL = ASYNC_DATABASE_URL
    AWS_S3_BUCKET_NAME = AWS_S3_BUCKET_NAME
    AWS_CLOUDFRONT_URL = AWS_CLOUDFRONT_URL
    TWILIO_ACCOUNT_SID = TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN = TWILIO_AUTH_TOKEN
    TWILIO_PHONE_NUMBER = TWILIO_PHONE_NUMBER

settings = Settings()

