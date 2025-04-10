from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from mangum import Mangum
import os
from fastapi import HTTPException
from fastapi.responses import HTMLResponse
from fastapi.requests import Request
import logging
from app.core.config import ENVIRONMENT, DATABASE_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WASTE_WHIRL",
    description="Backend API for Waste Management Platform",
    version="0.1.0",
    root_path="" if ENVIRONMENT == "development" else "/Prod",
    docs_url="/apidocs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",  
    servers=[
        {"url": "", "description": "Production Server"},
        {"url": "http://localhost:8000", "description": "Local Development Server"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    """
    Check environment variables and database connection at startup
    """
    logger.info(f"Environment: {ENVIRONMENT}")
    
    if DATABASE_URL:
        logger.info(f"Database URL is set. Starts with: {DATABASE_URL[:20]}...")
    else:
        logger.warning("DATABASE_URL is not set! Using fallback database.")
    
    if os.path.isfile(".env"):
        logger.info(".env file found.")
    else:
        logger.warning(".env file not found in working directory!")
        
    logger.info(f"Current working directory: {os.getcwd()}")
    
    if ENVIRONMENT != "production":
        env_vars = {k: v for k, v in os.environ.items() if "SECRET" not in k and "KEY" not in k and "PASSWORD" not in k}
        logger.info(f"Environment variables: {env_vars}")

@app.get("/docs", include_in_schema=False)
async def api_documentation(request: Request):
    return HTMLResponse(
        """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>WASTE WHIRL DOCS</title>

    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
  </head>
  <body>

    <elements-api
      apiDescriptionUrl="openapi.json"
      router="hash"
      theme="dark"
    />

  </body>
</html>"""
    )

if ENVIRONMENT == "development":
    app.mount("/static", StaticFiles(directory="app/static"), name="static")
    templates = Jinja2Templates(directory="app/templates")

@app.get("/")
async def root():
    return {"message": "Welcome to Waste Whirl API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 