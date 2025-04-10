from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


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
