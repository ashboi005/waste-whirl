from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from app.core.config import ASYNC_DATABASE_URL, SYNC_DATABASE_URL
import logging
import os
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

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

# Function to remove sslmode parameter from PostgreSQL URL
def clean_connection_url(url):
    if not url or not isinstance(url, str):
        return url
        
    if 'postgresql' in url and 'sslmode' in url:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        
        # Remove the sslmode parameter
        if 'sslmode' in query_params:
            del query_params['sslmode']
            
        # Reconstruct the URL
        clean_query = urlencode(query_params, doseq=True)
        clean_url = urlunparse((
            parsed.scheme, 
            parsed.netloc, 
            parsed.path, 
            parsed.params, 
            clean_query, 
            parsed.fragment
        ))
        return clean_url
    return url

# Clean the connection URLs to remove sslmode
clean_async_url = clean_connection_url(ASYNC_DATABASE_URL)
clean_sync_url = clean_connection_url(SYNC_DATABASE_URL)

# Create async engine with cleaned URL
async_engine = create_async_engine(
    clean_async_url,
    echo=False,
    future=True,
)

# Create sync engine with cleaned URL
sync_engine = create_engine(
    clean_sync_url,
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