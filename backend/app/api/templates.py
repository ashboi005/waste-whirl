from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os
import logging

logger = logging.getLogger(__name__)

# Set up templates
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)

router = APIRouter(tags=["templates"])

@router.get("/user-details", response_class=HTMLResponse)
async def user_profile_page(request: Request):
    """
    Serve the user profile setup page
    """
    logger.info("Serving user profile setup page")
    return templates.TemplateResponse("user_details.html", {"request": request})

@router.get("/ragpicker-details", response_class=HTMLResponse)
async def ragpicker_wallet_page(request: Request):
    """
    Serve the ragpicker wallet setup page
    """
    logger.info("Serving ragpicker wallet setup page")
    return templates.TemplateResponse("ragpicker_details.html", {"request": request})

@router.get("/ragpicker-application", response_class=HTMLResponse)
async def ragpicker_application_page(request: Request):
    """
    Serve the ragpicker application submission page
    """
    logger.info("Serving ragpicker application submission page")
    return templates.TemplateResponse("application_submission.html", {"request": request}) 