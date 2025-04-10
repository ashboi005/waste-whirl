from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.user import RagpickerApplication, RagpickerDetails, ApplicationStatus
from app.services.s3 import generate_presigned_url
from app.services.twilio_service import send_sms
import os
import uuid

admin_router = APIRouter()

templates = Jinja2Templates(directory="app/templates")

@admin_router.get("/", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """
    Admin dashboard main page
    """
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})

@admin_router.get("/users", response_class=HTMLResponse)
async def admin_users(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Admin users management page
    """
    return templates.TemplateResponse("admin/users.html", {"request": request})

@admin_router.get("/sensors", response_class=HTMLResponse)
async def admin_sensors(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Admin sensors management page
    """
    return templates.TemplateResponse("admin/sensors.html", {"request": request})

@admin_router.get("/finances", response_class=HTMLResponse)
async def admin_finances(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Admin finances overview page
    """
    return templates.TemplateResponse("admin/finances.html", {"request": request})

@admin_router.post("/ragpicker/apply")
async def apply_ragpicker(
    clerk_id: str = Form(...),
    notes: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a ragpicker application
    """
    # Generate a unique filename for the document
    file_name = f"{clerk_id}_{uuid.uuid4()}.pdf"
    
    # Generate presigned URL for document upload
    presigned_url = generate_presigned_url(file_name, "application/pdf")
    
    # Create application record
    application = RagpickerApplication(
        clerk_id=clerk_id,
        document_url=f"ragpicker-documents/{file_name}",
        notes=notes
    )
    
    db.add(application)
    await db.commit()
    
    return {
        "presigned_url": presigned_url,
        "application_id": application.id
    }

@admin_router.post("/ragpicker/{application_id}/review")
async def review_application(
    application_id: int,
    status: ApplicationStatus,
    phone_number: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Review and approve/reject a ragpicker application
    """
    # Get the application
    query = select(RagpickerApplication).where(RagpickerApplication.id == application_id)
    result = await db.execute(query)
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update application status
    application.status = status
    await db.commit()
    
    # Send notification via Twilio
    if status == ApplicationStatus.ACCEPTED:
        # Generate RFID tag
        rfid_tag = f"RFID_{uuid.uuid4().hex[:8].upper()}"
        
        # Create or update ragpicker details
        ragpicker = RagpickerDetails(
            clerkId=application.clerk_id,
            RFID=rfid_tag
        )
        db.add(ragpicker)
        await db.commit()
        
        message = f"Congratulations! Your ragpicker application has been accepted. Your RFID tag is: {rfid_tag}"
    else:
        message = "We regret to inform you that your ragpicker application has been rejected."
    
    try:
        send_sms(phone_number, message)
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Failed to send SMS: {str(e)}")
    
    return {"status": "success", "message": "Application review completed"}

 