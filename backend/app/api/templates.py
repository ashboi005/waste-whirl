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

@router.get("/user-profile", response_class=HTMLResponse)
async def user_profile_page(request: Request):
    """
    Serve the user profile setup page
    """
    logger.info("Serving user profile setup page")
    return templates.TemplateResponse("user_details.html", {"request": request})

@router.get("/ragpicker-wallet", response_class=HTMLResponse)
async def ragpicker_wallet_page(request: Request):
    """
    Serve the ragpicker wallet setup page
    """
    logger.info("Serving ragpicker wallet setup page")
    return templates.TemplateResponse("ragpicker_details.html", {"request": request}) 