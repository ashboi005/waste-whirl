from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.user import User, RagpickerDetails, Balances, Reviews, UserDetails
from app.schemas.ragpicker import RagpickerDetailsCreate, RagpickerDetailsUpdate, RagpickerDetailsResponse, RagpickerListResponse, RagpickerBalanceResponse
from typing import List
import logging

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/all-ragpickers", response_model=List[RagpickerListResponse])
async def get_ragpickers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Get all ragpickers, optionally filtered by location
    """
    # Get all users with role 'RAGPICKER'
    query = select(User, RagpickerDetails).join(
        RagpickerDetails, 
        User.clerkId == RagpickerDetails.clerkId, 
        isouter=True
    ).where(User.role == "RAGPICKER").offset(skip).limit(limit)
    
    result = await db.execute(query)
    ragpickers = result.all()
    
    response_list = []
    for user, details in ragpickers:
        # If ragpicker details don't exist or average_rating is None, use default 0.0
        avg_rating = 0.0
        if details and details.average_rating is not None:
            avg_rating = details.average_rating
        
        # Get profile pic URL from user details if available
        profile_pic_url = None
        user_details_query = select(UserDetails).where(UserDetails.clerkId == user.clerkId)
        user_details_result = await db.execute(user_details_query)
        user_details = user_details_result.scalars().first()
        if user_details:
            profile_pic_url = user_details.profile_pic_url
            
        response_list.append(
            RagpickerListResponse(
                clerkId=user.clerkId,
                firstName=user.firstName,
                lastName=user.lastName,
                average_rating=avg_rating,
                profile_pic_url=profile_pic_url
            )
        )
    
    return response_list

@router.post("/{clerk_id}/details", response_model=RagpickerDetailsResponse)
async def create_ragpicker_details(clerk_id: str, details: RagpickerDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Create ragpicker details with only wallet address. RFID is set to None by default.
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Check if ragpicker details already exist
    result = await db.execute(select(RagpickerDetails).where(RagpickerDetails.clerkId == clerk_id))
    existing_details = result.scalars().first()
    
    if existing_details:
        # Update existing details wallet address, leave other fields unchanged
        existing_details.wallet_address = details.wallet_address
        # Make sure average_rating is never None
        if existing_details.average_rating is None:
            existing_details.average_rating = 0.0
        ragpicker_details = existing_details
    else:
        # Create new ragpicker details with wallet address only
        ragpicker_details = RagpickerDetails(
            clerkId=clerk_id,
            wallet_address=details.wallet_address,
            RFID=None,  # Set to None explicitly
            average_rating=0.0  # Default to 0.0
        )
        db.add(ragpicker_details)
    
    await db.commit()
    await db.refresh(ragpicker_details)
    
    # Ensure average_rating is always valid for the response
    avg_rating = 0.0
    if ragpicker_details.average_rating is not None:
        avg_rating = ragpicker_details.average_rating
    
    return RagpickerDetailsResponse(
        clerkId=ragpicker_details.clerkId,
        wallet_address=ragpicker_details.wallet_address,
        RFID=ragpicker_details.RFID,
        average_rating=avg_rating
    )

@router.get("/{clerk_id}/details", response_model=RagpickerDetailsResponse)
async def get_ragpicker_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get ragpicker details by clerk ID
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Get ragpicker details
    result = await db.execute(select(RagpickerDetails).where(RagpickerDetails.clerkId == clerk_id))
    ragpicker_details = result.scalars().first()
    
    if not ragpicker_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ragpicker details for clerk ID {clerk_id} not found"
        )
    
    # Ensure average_rating is always a valid float
    avg_rating = 0.0
    if ragpicker_details.average_rating is not None:
        avg_rating = ragpicker_details.average_rating
    
    return RagpickerDetailsResponse(
        clerkId=ragpicker_details.clerkId,
        wallet_address=ragpicker_details.wallet_address,
        RFID=ragpicker_details.RFID,
        average_rating=avg_rating
    )

@router.put("/{clerk_id}/details", response_model=RagpickerDetailsResponse)
async def update_ragpicker_details(clerk_id: str, details: RagpickerDetailsUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update ragpicker details: wallet address and RFID.
    Average rating is managed separately through reviews.
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Check if user is a ragpicker
    if user.role != "RAGPICKER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerk ID {clerk_id} is not a ragpicker"
        )
    
    # Check if ragpicker details exist
    result = await db.execute(select(RagpickerDetails).where(RagpickerDetails.clerkId == clerk_id))
    ragpicker_details = result.scalars().first()
    
    if not ragpicker_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ragpicker details for clerk ID {clerk_id} not found"
        )
    
    # Update fields
    if details.wallet_address is not None:
        ragpicker_details.wallet_address = details.wallet_address
    if details.RFID is not None:
        ragpicker_details.RFID = details.RFID
    # Don't update average_rating through this endpoint, it's calculated from reviews
    
    # Make sure average_rating is never None
    if ragpicker_details.average_rating is None:
        ragpicker_details.average_rating = 0.0
    
    await db.commit()
    await db.refresh(ragpicker_details)
    
    # Ensure average_rating is always a valid float for the response
    avg_rating = 0.0
    if ragpicker_details.average_rating is not None:
        avg_rating = ragpicker_details.average_rating
    
    return RagpickerDetailsResponse(
        clerkId=ragpicker_details.clerkId,
        wallet_address=ragpicker_details.wallet_address,
        RFID=ragpicker_details.RFID,
        average_rating=avg_rating
    )


