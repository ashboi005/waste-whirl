from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.user import Reviews, RagpickerDetails
from app.schemas.review import ReviewCreate, ReviewResponse
from typing import List

router = APIRouter()

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_data: ReviewCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new review for a ragpicker
    Should only be allowed after a completed request
    Will also update the ragpicker's average rating
    """
    # This would create a new review and update ragpicker's average rating
    pass

@router.get("/ragpicker/{clerk_id}", response_model=List[ReviewResponse])
async def get_ragpicker_reviews(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all reviews for a ragpicker
    """
    # This would retrieve all reviews for the ragpicker
    pass
