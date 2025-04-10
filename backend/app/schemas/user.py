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
    profile_pic_url: Optional[str] = None


class UserDetailsCreate(UserDetailsBase):
    pass


class UserDetailsResponse(UserDetailsBase):
    clerkId: str

    class Config:
        from_attributes = True 