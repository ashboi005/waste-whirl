from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from app.core.config import ASYNC_DATABASE_URL, SYNC_DATABASE_URL
import logging
import os

logger = logging.getLogger(__name__)

if not ASYNC_DATABASE_URL:
    logger.warning("⚠️ DATABASE_URL not found! Using in-memory SQLite database for development only.")
    logger.warning("⚠️ Make sure to set DATABASE_URL in your .env file for production.")
    ASYNC_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    SYNC_DATABASE_URL = "sqlite:///:memory:"
    
    if os.getenv("ENVIRONMENT") != "production":
        logger.info("Environment variables check:")
        for env_var in ["DATABASE_URL", "ENVIRONMENT"]:
            logger.info(f"{env_var}: {os.getenv(env_var)}")
        
        # Check if .env file exists
        if os.path.exists(".env"):
            logger.info(".env file exists, but DATABASE_URL might not be set correctly")
        else:
            logger.warning(".env file not found!")


async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    future=True,
)


sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=False,
    future=True,
)


async_session_factory = sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_engine():
    return sync_engine 