from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.schemas.user import RagpickerApplicationResponse, ApplicationStatus,ApplicationCreateRequest
from app.models.user import User, RagpickerApplication
from app.services import s3
from datetime import datetime
import httpx
from typing import List
import os

router = APIRouter()

# Clerk SDK configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_API_URL = "https://api.clerk.com"

async def update_clerk_role(clerk_id: str, new_role: str):
    """Update user role in Clerk system"""
    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "public_metadata": {
            "role": new_role
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{CLERK_API_URL}/users/{clerk_id}",
            json=payload,
            headers=headers
        )
        
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role in Clerk system"
        )

@router.post("/admin/applications/", status_code=status.HTTP_201_CREATED)
async def create_application(
    application_data: ApplicationCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a new ragpicker application with base64 document
    
    Request Body (JSON):
    {
        "clerk_id": "user_123",
        "notes": "Application notes",
        "document": "base64encodedstring",
        "file_extension": "pdf",  # optional
        "folder": "applications"   # optional
    }
    """
    try:
        # Upload document to S3
        document_url = await s3.upload_base64_image_to_s3(
            base64_image=application_data.document,
            file_extension=application_data.file_extension,
            folder=application_data.folder
        )
        
        # Create application record
        new_application = RagpickerApplication(
            clerk_id=application_data.clerk_id,
            document_url=document_url,
            notes=application_data.notes,
            status=ApplicationStatus.PENDING
        )
        
        db.add(new_application)
        await db.commit()
        await db.refresh(new_application)
        
        return {
            "message": "Application submitted successfully",
            "application_id": new_application.id,
            "document_url": document_url
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Application submission failed: {str(e)}"
        )



@router.get("/admin/applications/", response_model=List[RagpickerApplicationResponse])
async def get_all_applications(
    status: ApplicationStatus = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all ragpicker applications (Admin only)
    """
    query = select(RagpickerApplication)
    
    if status:
        query = query.where(RagpickerApplication.status == status)
        
    result = await db.execute(query)
    applications = result.scalars().all()
    
    # Convert enum values to strings and handle None values for updated_at
    formatted_applications = []
    for app in applications:
        app_dict = {
            "id": app.id,
            "clerk_id": app.clerk_id,
            "document_url": app.document_url,
            "notes": app.notes,
            "status": app.status.value if app.status else "PENDING",
            "created_at": app.created_at,
            "updated_at": app.updated_at or datetime.utcnow()
        }
        formatted_applications.append(app_dict)
    
    return formatted_applications

@router.post("/admin/applications/{application_id}/review", status_code=status.HTTP_200_OK)
async def review_application(
    application_id: int,
    status: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or reject a ragpicker application (Admin only)
    """
    # Validate status value
    if status not in ["PENDING", "ACCEPTED", "REJECTED"]:
        raise HTTPException(
            status_code=400, 
            detail="Status must be one of: PENDING, ACCEPTED, REJECTED"
        )
        
    # Get application
    result = await db.execute(
        select(RagpickerApplication)
        .where(RagpickerApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update application status
    application.status = status
    application.updated_at = datetime.utcnow()
    
    if status == "ACCEPTED":
        # Get associated user
        user_result = await db.execute(
            select(User)
            .where(User.clerkId == application.clerk_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Update role in Clerk system
        try:
            await update_clerk_role(application.clerk_id, "RAGPICKER")
        except Exception as e:
            await db.rollback()
            raise
            
        # Update local database
        user.role = "RAGPICKER"
        db.add(user)
    
    db.add(application)
    await db.commit()
    
    return {"message": f"Application {status} successfully"}