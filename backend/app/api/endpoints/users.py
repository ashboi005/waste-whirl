from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.user import User, UserDetails
from app.schemas.user import UserCreate, UserResponse, UserDetailsCreate, UserDetailsResponse
from app.services.s3 import upload_base64_image_to_s3, delete_file, is_url
from typing import List, Dict
import logging

# Set up logger
logger = logging.getLogger(__name__)

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

@router.delete("/{clerk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete a user by clerk ID
    """
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    await db.delete(user)
    await db.commit()
    return None

# User details endpoints
@router.post("/{clerk_id}/details", response_model=UserDetailsResponse)
async def create_user_details(clerk_id: str, details: UserDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Create or update user details with optional profile picture upload
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Process base64 image if provided
    profile_pic_url = None
    if details.base64_image:
        try:
            logger.info(f"Processing base64 image upload for user {clerk_id}")
            # Use jpg as default if no extension provided
            file_ext = details.file_extension if details.file_extension else "jpg"
            profile_pic_url = await upload_base64_image_to_s3(
                base64_image=details.base64_image,
                file_extension=file_ext,
                folder="profiles"
            )
            logger.info(f"Successfully uploaded image for user {clerk_id}: {profile_pic_url}")
        except Exception as e:
            logger.error(f"Failed to upload base64 image: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to upload profile picture: {str(e)}"
            )
    
    # Check if user details already exist
    result = await db.execute(select(UserDetails).where(UserDetails.clerkId == clerk_id))
    existing_details = result.scalars().first()
    
    if existing_details:
        # If updating with a new profile pic, delete the old one if it exists
        if profile_pic_url and existing_details.profile_pic_url:
            try:
                await delete_file(existing_details.profile_pic_url, folder="profiles")
                logger.info(f"Deleted old profile picture: {existing_details.profile_pic_url}")
            except Exception as e:
                logger.warning(f"Failed to delete old profile picture: {str(e)}")
        
        # Update existing details
        existing_details.phone = details.phone
        existing_details.address = details.address
        existing_details.bio = details.bio
        if profile_pic_url:
            existing_details.profile_pic_url = profile_pic_url
        user_details = existing_details
    else:
        # Create new user details
        user_details = UserDetails(
            clerkId=clerk_id,
            phone=details.phone,
            address=details.address,
            bio=details.bio,
            profile_pic_url=profile_pic_url
        )
        db.add(user_details)
    
    await db.commit()
    await db.refresh(user_details)
    
    return UserDetailsResponse(
        clerkId=user_details.clerkId,
        phone=user_details.phone,
        address=user_details.address,
        bio=user_details.bio,
        profile_pic_url=user_details.profile_pic_url
    )

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
    
    return UserDetailsResponse(
        clerkId=user_details.clerkId,
        phone=user_details.phone,
        address=user_details.address,
        bio=user_details.bio,
        profile_pic_url=user_details.profile_pic_url
    )

@router.put("/{clerk_id}/details", response_model=UserDetailsResponse)
async def update_user_details(clerk_id: str, details: UserDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Update user details by clerk ID with optional profile picture update
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
    
    # Process base64 image if provided
    profile_pic_url = None
    if details.base64_image:
        try:
            logger.info(f"Processing base64 image upload for user {clerk_id}")
            # Use jpg as default if no extension provided
            file_ext = details.file_extension if details.file_extension else "jpg"
            profile_pic_url = await upload_base64_image_to_s3(
                base64_image=details.base64_image,
                file_extension=file_ext,
                folder="profiles"
            )
            logger.info(f"Successfully uploaded image for user {clerk_id}: {profile_pic_url}")
            
            # Delete old profile picture if it exists
            if user_details.profile_pic_url:
                try:
                    await delete_file(user_details.profile_pic_url, folder="profiles")
                    logger.info(f"Deleted old profile picture: {user_details.profile_pic_url}")
                except Exception as e:
                    logger.warning(f"Failed to delete old profile picture: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to upload base64 image: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to upload profile picture: {str(e)}"
            )
    
    # Update fields
    user_details.phone = details.phone
    user_details.address = details.address
    user_details.bio = details.bio
    if profile_pic_url:
        user_details.profile_pic_url = profile_pic_url
    
    await db.commit()
    await db.refresh(user_details)
    
    return UserDetailsResponse(
        clerkId=user_details.clerkId,
        phone=user_details.phone,
        address=user_details.address,
        bio=user_details.bio,
        profile_pic_url=user_details.profile_pic_url
    )

