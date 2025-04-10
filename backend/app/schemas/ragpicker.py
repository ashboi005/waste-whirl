from pydantic import BaseModel, Field
from typing import Optional
from app.models.user import ApplicationStatus
from datetime import datetime

class RagpickerDetailsBase(BaseModel):
    wallet_address: Optional[str] = None
    RFID: Optional[str] = None
    average_rating: float = 0.0


class RagpickerDetailsCreate(BaseModel):
    wallet_address: Optional[str] = None


class RagpickerDetailsUpdate(BaseModel):
    wallet_address: Optional[str] = None
    RFID: Optional[str] = None


class RagpickerDetailsResponse(RagpickerDetailsBase):
    clerkId: str

    class Config:
        from_attributes = True


class RagpickerBalanceResponse(BaseModel):
    clerkId: str
    balance: float

    class Config:
        from_attributes = True


class RagpickerListResponse(BaseModel):
    clerkId: str
    firstName: str
    lastName: str
    average_rating: float
    profile_pic_url: Optional[str] = None

    class Config:
        from_attributes = True 

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