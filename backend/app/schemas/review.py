from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    customer_clerkId: str
    ragpicker_clerkId: str
    rating: float = Field(..., ge=1, le=5)
    review: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime

    # Include customer and ragpicker names from joined queries
    customer_name: Optional[str] = None
    ragpicker_name: Optional[str] = None

    class Config:
        from_attributes = True 