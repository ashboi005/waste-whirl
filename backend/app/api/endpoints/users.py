from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.user import User, UserDetails
from app.schemas.user import UserCreate, UserResponse, UserDetailsCreate, UserDetailsResponse
from typing import List

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new user (admin only for testing purposes)
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.clerkId == user_data.clerkId))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerk ID {user_data.clerkId} already exists"
        )
    
    # Create new user
    db_user = User(
        clerkId=user_data.clerkId,
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        role=user_data.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Get all users
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.get("/{clerk_id}", response_model=UserResponse)
async def get_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a specific user by clerk ID
    """
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    return user

@router.put("/{clerk_id}", response_model=UserResponse)
async def update_user(clerk_id: str, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Update a user by clerk ID
    """
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Update user fields
    user.email = user_data.email
    user.firstName = user_data.firstName
    user.lastName = user_data.lastName
    user.role = user_data.role
    
    await db.commit()
    await db.refresh(user)
    return user

# User details endpoints
@router.post("/{clerk_id}/details", response_model=UserDetailsResponse)
async def create_user_details(clerk_id: str, details: UserDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Create or update user details
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Check if user details already exist
    result = await db.execute(select(UserDetails).where(UserDetails.clerkId == clerk_id))
    existing_details = result.scalars().first()
    
    if existing_details:
        # Update existing details
        existing_details.phone = details.phone
        existing_details.address = details.address
        existing_details.bio = details.bio
        existing_details.profile_pic_url = details.profile_pic_url
        user_details = existing_details
    else:
        # Create new user details
        user_details = UserDetails(
            clerkId=clerk_id,
            phone=details.phone,
            address=details.address,
            bio=details.bio,
            profile_pic_url=details.profile_pic_url
        )
        db.add(user_details)
    
    await db.commit()
    await db.refresh(user_details)
    return user_details

@router.get("/{clerk_id}/details", response_model=UserDetailsResponse)
async def get_user_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get user details by clerk ID
    """
    result = await db.execute(select(UserDetails).where(UserDetails.clerkId == clerk_id))
    user_details = result.scalars().first()
    
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User details for clerk ID {clerk_id} not found"
        )
    
    return user_details

@router.put("/{clerk_id}/details", response_model=UserDetailsResponse)
async def update_user_details(clerk_id: str, details: UserDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Update user details by clerk ID
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Check if user details exist
    result = await db.execute(select(UserDetails).where(UserDetails.clerkId == clerk_id))
    user_details = result.scalars().first()
    
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User details for clerk ID {clerk_id} not found"
        )
    
    # Update fields
    user_details.phone = details.phone
    user_details.address = details.address
    user_details.bio = details.bio
    user_details.profile_pic_url = details.profile_pic_url
    
    await db.commit()
    await db.refresh(user_details)
    return user_details 

