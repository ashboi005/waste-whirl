from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.schemas.user import RagpickerApplicationResponse, ApplicationStatus,ApplicationCreateRequest
from app.models.user import User, RagpickerApplication, RagpickerDetails
from app.services import s3
from datetime import datetime
import httpx
from typing import List
import os
import logging
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Set up templates
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)

# Clerk SDK configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
# Hardcoded backup key for testing - replace with your actual key
if not CLERK_SECRET_KEY:
    # This is just a fallback for development, should be set properly in production
    logger.warning("CLERK_SECRET_KEY not found in environment, using hardcoded test key")
    CLERK_SECRET_KEY = "REPLACE_WITH_YOUR_CLERK_SECRET_KEY"  # Replace with your actual key
    
# Updated Clerk API URL
CLERK_API_URL = "https://api.clerk.dev"  # Changed from api.clerk.com to api.clerk.dev

async def update_clerk_role(clerk_id: str, new_role: str):
    """Update user role in Clerk system"""
    
    # Check if CLERK_SECRET_KEY is set
    if not CLERK_SECRET_KEY or CLERK_SECRET_KEY == "REPLACE_WITH_YOUR_CLERK_SECRET_KEY":
        error_msg = "CLERK_SECRET_KEY environment variable is not properly set"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )
    
    # Print the clerk_id for debugging
    logger.info(f"Clerk ID before API call: {clerk_id}")
    
    # Make sure clerk_id is correctly formatted (no leading/trailing spaces)
    clerk_id = clerk_id.strip()
    
    # Full API URL
    api_url = f"{CLERK_API_URL}/v1/users/{clerk_id}"
    logger.info(f"Full Clerk API URL: {api_url}")
    
    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "public_metadata": {
            "role": new_role
        }
    }
    
    logger.info(f"Making request to Clerk API for user {clerk_id} to set role to {new_role}")
    logger.info(f"Request payload: {payload}")
    
    try:
        async with httpx.AsyncClient() as client:
            # Enable debug logging for httpx
            client.headers.update(headers)
            
            # Log the full request details
            logger.info(f"Making PATCH request to {api_url}")
            logger.info(f"Headers: {headers}")
            
            response = await client.patch(
                api_url,
                json=payload
            )
            
        logger.info(f"Clerk API response status: {response.status_code}")
        logger.info(f"Clerk API response body: {response.text}")
            
        if response.status_code != 200:
            # Try to extract more error details from the response
            error_detail = "Unknown error"
            try:
                error_data = response.json()
                error_detail = str(error_data)
                logger.error(f"Clerk API error: {error_detail}")
            except:
                error_detail = response.text[:200]  # Get first 200 chars of response
                logger.error(f"Clerk API error (text): {error_detail}")
                
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update user role in Clerk system. Status: {response.status_code}. Details: {error_detail}"
            )
            
        logger.info(f"Successfully updated role for user {clerk_id}")
        return response.json()
    except httpx.RequestError as exc:
        error_msg = f"HTTP Request failed: {str(exc)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

async def update_clerk_role_alternative(clerk_id: str, new_role: str):
    """
    Alternative implementation to update user role in Clerk system
    Uses multiple API formats to ensure compatibility
    """
    if not CLERK_SECRET_KEY or CLERK_SECRET_KEY == "REPLACE_WITH_YOUR_CLERK_SECRET_KEY":
        error_msg = "CLERK_SECRET_KEY environment variable is not properly set"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )
    
    # Clean up clerk_id
    clerk_id = clerk_id.strip()
    logger.info(f"Using alternative method to update Clerk role for user: {clerk_id}")
    
    # Try various API formats - Clerk might have changed their API structure
    api_urls = [
        f"https://api.clerk.dev/v1/users/{clerk_id}",     # New API with v1
        f"https://api.clerk.com/v1/users/{clerk_id}",     # Old domain with v1
        f"https://clerk.com/v1/users/{clerk_id}",         # Base domain with v1
        f"https://api.clerk.dev/users/{clerk_id}",        # New API without v1
        f"https://api.clerk.com/users/{clerk_id}",        # Old domain without v1
        f"https://clerk.com/users/{clerk_id}"             # Base domain without v1
    ]
    
    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    # According to Clerk's latest docs
    payload = {
        "public_metadata": {
            "role": new_role
        }
    }
    
    logger.info(f"Payload for update: {payload}")
    
    # Try each URL format
    all_responses = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for api_url in api_urls:
            try:
                logger.info(f"Trying API URL: {api_url}")
                
                response = await client.patch(
                    api_url,
                    json=payload,
                    headers=headers
                )
                
                status_code = response.status_code
                logger.info(f"Response from {api_url}: Status {status_code}")
                
                response_text = response.text[:200] if response.text else "No response body"
                logger.info(f"Response body: {response_text}")
                
                # Store all responses for debugging
                all_responses.append({
                    "url": api_url,
                    "status": status_code,
                    "body": response_text
                })
                
                if status_code == 200:
                    logger.info(f"Successfully updated role using {api_url}")
                    return response.json()
                
                # Special handling for common error codes
                if status_code == 401:
                    logger.error("Authentication failed - invalid API key")
                elif status_code == 403:
                    logger.error("Authorization failed - insufficient permissions")
                elif status_code == 404:
                    logger.error(f"User not found with ID {clerk_id}")
                elif status_code == 422:
                    logger.error(f"Invalid request payload: {response_text}")
                
            except Exception as e:
                logger.warning(f"Failed with URL {api_url}: {str(e)}")
                all_responses.append({
                    "url": api_url,
                    "error": str(e)
                })
    
    # If we get here, all attempts failed
    error_msg = f"All attempts to update Clerk user failed. Responses: {all_responses}"
    logger.error(error_msg)
    
    # Return a more detailed error
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "message": "Failed to update user role in Clerk",
            "clerk_id": clerk_id,
            "responses": all_responses
        }
    )

@router.post("/applications/", status_code=status.HTTP_201_CREATED)
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



@router.get("/applications/", response_model=List[RagpickerApplicationResponse])
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
        # Handle case where status is already a string
        status_value = app.status
        if hasattr(app.status, 'value'):  # Check if it's an enum
            status_value = app.status.value
        elif app.status is None:
            status_value = "PENDING"
            
        app_dict = {
            "id": app.id,
            "clerk_id": app.clerk_id,
            "document_url": app.document_url,
            "notes": app.notes,
            "status": status_value,
            "created_at": app.created_at,
            "updated_at": app.updated_at or datetime.utcnow()
        }
        formatted_applications.append(app_dict)
    
    return formatted_applications

@router.post("/applications/{application_id}/review", status_code=status.HTTP_200_OK)
async def review_application(
    application_id: int,
    status_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or reject a ragpicker application (Admin only)
    """
    status = status_data.get("status")
    logger.info(f"Processing application review for application ID {application_id} with status {status}")
    
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
        logger.warning(f"Application with ID {application_id} not found")
        raise HTTPException(status_code=404, detail="Application not found")
    
    logger.info(f"Found application for clerk_id: {application.clerk_id}")
    
    # Update application status
    application.status = status
    application.updated_at = datetime.utcnow()
    
    if status == "ACCEPTED":
        logger.info(f"Application accepted, updating user role for clerk_id: {application.clerk_id}")
        
        # Get associated user
        user_result = await db.execute(
            select(User)
            .where(User.clerkId == application.clerk_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"User with clerk_id {application.clerk_id} not found in database")
            raise HTTPException(status_code=404, detail="User not found in database")
            
        # Update role in Clerk system
        try:
            # First verify the user exists in Clerk
            try:
                logger.info(f"Verifying user exists in Clerk: {application.clerk_id}")
                clerk_user = await verify_clerk_user_exists(application.clerk_id)
                logger.info(f"User verified in Clerk. User ID: {clerk_user.get('id', 'unknown')}")
            except Exception as e:
                logger.error(f"User verification failed: {str(e)}")
                # Continue anyway, in case verification fails but update still works
            
            # Try to update the role
            logger.info(f"Attempting to update Clerk role for user: {application.clerk_id}")
            clerk_response = await update_clerk_role_alternative(application.clerk_id, "RAGPICKER")
            logger.info(f"Successfully updated Clerk role. Response: {clerk_response}")
            
            # Update local database
            user.role = "RAGPICKER"
            db.add(user)
            
        except HTTPException as http_exc:
            # Pass through HTTP exceptions with their status codes
            logger.error(f"HTTP error updating Clerk role: {http_exc.detail}")
            await db.rollback()
            raise
        except Exception as e:
            logger.error(f"Error updating Clerk role: {str(e)}", exc_info=True)
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update user role in Clerk: {str(e)}"
            )
    
    db.add(application)
    await db.commit()
    
    # Send SMS notification based on application status
    try:
        user_result = await db.execute(
            select(User)
            .where(User.clerkId == application.clerk_id)
        )
        user = user_result.scalar_one_or_none()
        applicant_name = f"{user.firstName} {user.lastName}" if user else "Applicant"
        
        if status == "ACCEPTED":
            notification_message = f"Congratulations {applicant_name}! Your application to become a ragpicker has been approved. You can now start accepting waste collection requests."
        elif status == "REJECTED":
            notification_message = f"Dear {applicant_name}, we regret to inform you that your application to become a ragpicker has been rejected. Please contact support for more information."
        else:
            notification_message = f"Your application status has been updated to: {status}"
        
        logger.info(f"Sending notification for application {application_id}: {notification_message}")
        sms_sent = await twilio_service.send_sms(notification_message)
        
        if sms_sent:
            logger.info(f"SMS notification sent successfully for application {application_id}")
        else:
            logger.warning(f"Failed to send SMS notification for application {application_id}")
    except Exception as e:
        # Don't fail the endpoint if SMS sending fails
        logger.error(f"Error sending SMS notification: {str(e)}")
    
    logger.info(f"Application {application_id} status updated to {status}")
    return {"message": f"Application {status} successfully"}

async def verify_clerk_user_exists(clerk_id: str):
    """
    Verify that the Clerk user exists by making a GET request
    Returns the user data if found, raises an exception if not
    """
    if not CLERK_SECRET_KEY or CLERK_SECRET_KEY == "REPLACE_WITH_YOUR_CLERK_SECRET_KEY":
        error_msg = "CLERK_SECRET_KEY environment variable is not properly set"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )
    
    # Clean up clerk_id
    clerk_id = clerk_id.strip()
    logger.info(f"Verifying Clerk user exists: {clerk_id}")
    
    # Try various API formats for GET request
    api_urls = [
        f"https://api.clerk.dev/v1/users/{clerk_id}",
        f"https://api.clerk.com/v1/users/{clerk_id}",
        f"https://api.clerk.dev/users/{clerk_id}",
        f"https://api.clerk.com/users/{clerk_id}"
    ]
    
    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for api_url in api_urls:
            try:
                logger.info(f"Trying GET request to: {api_url}")
                
                response = await client.get(
                    api_url,
                    headers=headers
                )
                
                status_code = response.status_code
                logger.info(f"GET response from {api_url}: Status {status_code}")
                
                if status_code == 200:
                    user_data = response.json()
                    logger.info(f"Successfully verified user exists: {clerk_id}")
                    return user_data
                
            except Exception as e:
                logger.warning(f"GET request failed with URL {api_url}: {str(e)}")
    
    # If we get here, user was not found
    error_msg = f"User with clerk_id {clerk_id} not found in Clerk"
    logger.error(error_msg)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=error_msg
    )

# Add this Pydantic model for RFID data
class RFIDData(BaseModel):
    rfid: str

@router.post("/ragpickers/{application_id}/rfid", status_code=status.HTTP_200_OK)
async def assign_rfid(
    application_id: int,
    rfid_data: RFIDData,
    db: AsyncSession = Depends(get_db)
):
    """
    Assign RFID to a ragpicker
    
    Expected payload format:
    {"rfid": "rfid_string_value"}
    """
    try:
        # Log the received RFID value
        logger.info(f"RFID assignment request received for application {application_id}")
        logger.info(f"RFID value received: {rfid_data.rfid}")
        
        # Use the string from the model
        rfid_value = rfid_data.rfid
        
        # Validate RFID value is not empty
        if not rfid_value or not rfid_value.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFID value is required and cannot be empty"
            )
            
        # Get the application to find the associated clerkId
        stmt = select(RagpickerApplication).where(RagpickerApplication.id == application_id)
        result = await db.execute(stmt)
        application = result.scalar_one_or_none()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found"
            )
        
        # Get the clerk_id from the application
        clerk_id = application.clerk_id
        logger.info(f"Found application for clerk_id: {clerk_id}")
        
        # Get the ragpicker details using the clerk_id
        stmt = select(RagpickerDetails).where(RagpickerDetails.clerkId == clerk_id)
        result = await db.execute(stmt)
        ragpicker_details = result.scalar_one_or_none()
        
        if not ragpicker_details:
            logger.warning(f"Ragpicker details not found for clerk_id {clerk_id}, creating new record")
            # Create a new record if it doesn't exist
            ragpicker_details = RagpickerDetails(
                clerkId=clerk_id,
                RFID=rfid_value
            )
            db.add(ragpicker_details)
        else:
            # Update existing record
            logger.info(f"Updating RFID for existing ragpicker details, clerk_id: {clerk_id}")
            logger.info(f"Old RFID: {ragpicker_details.RFID}, New RFID: {rfid_value}")
            ragpicker_details.RFID = rfid_value
        
        await db.commit()
        
        # Double-check the value was actually saved by refreshing from DB
        await db.refresh(ragpicker_details)
        saved_rfid = ragpicker_details.RFID
        logger.info(f"RFID saved successfully: {saved_rfid}")
        
        return {
            "message": "RFID assigned successfully",
            "rfid": saved_rfid,
            "clerk_id": clerk_id
        }
    
    except HTTPException as http_exc:
        await db.rollback()
        logger.error(f"HTTP error assigning RFID: {http_exc.detail}")
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error assigning RFID: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign RFID: {str(e)}"
        )

@router.get("/dashboard", response_class=HTMLResponse)
async def admin_dashboard_page(request: Request):
    """
    Serve the admin dashboard page
    """
    logger.info("Serving admin dashboard page")
    return templates.TemplateResponse("admin_dashboard.html", {"request": request})