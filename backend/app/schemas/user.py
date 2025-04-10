from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from datetime import datetime
from enum import Enum

class UserBase(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    role: str


class UserCreate(UserBase):
    clerkId: str


class UserResponse(UserBase):
    clerkId: str
    createdAt: datetime

    class Config:
        from_attributes = True


class UserDetailsBase(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None


class UserDetailsCreate(UserDetailsBase):
    base64_image: Optional[str] = None
    file_extension: Optional[str] = None


class UserDetailsResponse(UserDetailsBase):
    clerkId: str
    profile_pic_url: Optional[str] = None

    class Config:
        from_attributes = True


class ProfilePictureUpload(BaseModel):
    """Schema for profile picture upload request"""
    content_type: str = Field(..., description="Content type of the file to be uploaded (e.g., 'image/jpeg', 'image/png')") 


class ApplicationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class RagpickerApplicationBase(BaseModel):
    clerk_id: str
    document_url: str
    notes: str
    status: ApplicationStatus

class RagpickerApplicationCreate(RagpickerApplicationBase):
    pass

class RagpickerApplicationResponse(RagpickerApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplicationCreateRequest(BaseModel):
    clerk_id: str
    notes: str
    document: str  # Base64 encoded string
    file_extension: Optional[str] = "pdf"
    folder: Optional[str] = "applications"