from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User, Reviews, RagpickerDetails
from app.schemas.review import ReviewCreate, ReviewResponse
from typing import List
import logging

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_data: ReviewCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new review for a ragpicker.
    This will also update the ragpicker's average rating.
    """
    # Check if customer exists
    customer_result = await db.execute(select(User).where(User.clerkId == review_data.customer_clerkId))
    customer = customer_result.scalars().first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with clerk ID {review_data.customer_clerkId} not found"
        )
    
    # Check if customer is a customer
    if customer.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerk ID {review_data.customer_clerkId} is not a customer"
        )
    
    # Check if ragpicker exists
    ragpicker_result = await db.execute(select(User).where(User.clerkId == review_data.ragpicker_clerkId))
    ragpicker = ragpicker_result.scalars().first()
    
    if not ragpicker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ragpicker with clerk ID {review_data.ragpicker_clerkId} not found"
        )
    
    # Check if ragpicker is a ragpicker
    if ragpicker.role != "RAGPICKER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerk ID {review_data.ragpicker_clerkId} is not a ragpicker"
        )
    
    # Create new review
    new_review = Reviews(
        customer_clerkId=review_data.customer_clerkId,
        ragpicker_clerkId=review_data.ragpicker_clerkId,
        rating=review_data.rating,
        review=review_data.review
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    # Update ragpicker's average rating
    # 1. Get all reviews for this ragpicker
    avg_rating_query = select(func.avg(Reviews.rating)).where(
        Reviews.ragpicker_clerkId == review_data.ragpicker_clerkId
    )
    avg_rating_result = await db.execute(avg_rating_query)
    avg_rating = avg_rating_result.scalar_one_or_none()
    
    # Ensure avg_rating is a valid float
    if avg_rating is None:
        avg_rating = float(review_data.rating)  # If this is the first review, use its rating
    else:
        avg_rating = float(avg_rating)  # Convert to float to be safe
    
    # Round to 1 decimal place
    avg_rating = round(avg_rating, 1)
    
    # 2. Update ragpicker details with new average rating
    ragpicker_details_result = await db.execute(
        select(RagpickerDetails).where(RagpickerDetails.clerkId == review_data.ragpicker_clerkId)
    )
    ragpicker_details = ragpicker_details_result.scalars().first()
    
    if ragpicker_details:
        ragpicker_details.average_rating = avg_rating
        await db.commit()
    else:
        # Create ragpicker details if they don't exist
        new_ragpicker_details = RagpickerDetails(
            clerkId=review_data.ragpicker_clerkId,
            average_rating=avg_rating,
            wallet_address=None,  # Initialize wallet_address to None
            RFID=None  # Initialize RFID to None
        )
        db.add(new_ragpicker_details)
        await db.commit()
    
    # Get names for response
    customer_name = f"{customer.firstName} {customer.lastName}"
    ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}"
    
    return ReviewResponse(
        id=new_review.id,
        customer_clerkId=new_review.customer_clerkId,
        ragpicker_clerkId=new_review.ragpicker_clerkId,
        rating=new_review.rating,
        review=new_review.review,
        created_at=new_review.created_at,
        customer_name=customer_name,
        ragpicker_name=ragpicker_name
    )

@router.get("/ragpicker/{clerk_id}", response_model=List[ReviewResponse])
async def get_ragpicker_reviews(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all reviews for a ragpicker
    """
    # Check if ragpicker exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    ragpicker = result.scalars().first()
    
    if not ragpicker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ragpicker with clerk ID {clerk_id} not found"
        )
    
    # Get all reviews for the ragpicker
    query = select(Reviews).where(Reviews.ragpicker_clerkId == clerk_id).order_by(Reviews.created_at.desc())
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    # Prepare the response with customer and ragpicker names
    review_responses = []
    for review in reviews:
        # Get customer name
        customer_result = await db.execute(select(User).where(User.clerkId == review.customer_clerkId))
        customer = customer_result.scalars().first()
        customer_name = f"{customer.firstName} {customer.lastName}" if customer else None
        
        # Ragpicker name (we already have the ragpicker object)
        ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}"
        
        review_responses.append(
            ReviewResponse(
                id=review.id,
                customer_clerkId=review.customer_clerkId,
                ragpicker_clerkId=review.ragpicker_clerkId,
                rating=review.rating,
                review=review.review,
                created_at=review.created_at,
                customer_name=customer_name,
                ragpicker_name=ragpicker_name
            )
        )
    
    return review_responses
