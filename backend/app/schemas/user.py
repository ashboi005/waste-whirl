from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from datetime import datetime
from enum import Enum
from pydantic import validator

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


class RagpickerApplicationCreate(RagpickerApplicationBase):
    status: str = "PENDING"
    
    @validator('status')
    def validate_status(cls, v):
        if v not in ["PENDING", "ACCEPTED", "REJECTED"]:
            raise ValueError('Status must be one of: PENDING, ACCEPTED, REJECTED')
        return v


class RagpickerApplicationResponse(BaseModel):
    id: int
    clerk_id: str
    document_url: str
    notes: str
    status: str
    created_at: datetime
    updated_at: datetime

    @validator('status')
    def validate_status(cls, v):
        if v not in ["PENDING", "ACCEPTED", "REJECTED"]:
            raise ValueError('Status must be one of: PENDING, ACCEPTED, REJECTED')
        return v

    class Config:
        from_attributes = True

class ApplicationCreateRequest(BaseModel):
    clerk_id: str
    notes: str
    document: str  # Base64 encoded string
    file_extension: Optional[str] = "pdf"
    folder: Optional[str] = "applications"