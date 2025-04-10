from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RequestBase(BaseModel):
    customer_clerkId: str
    ragpicker_clerkId: str


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    status: str  # PENDING, ACCEPTED, REJECTED, COMPLETED


class RequestResponse(RequestBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Include customer and ragpicker names from joined queries
    customer_name: Optional[str] = None
    ragpicker_name: Optional[str] = None

    class Config:
        from_attributes = True 