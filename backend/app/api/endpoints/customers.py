from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.user import User, CustomerDetails, Balances
from app.schemas.customer import CustomerDetailsCreate, CustomerDetailsResponse, CustomerBalanceResponse
from typing import List
import logging

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/{clerk_id}/details", response_model=CustomerDetailsResponse)
async def create_customer_details(clerk_id: str, details: CustomerDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Create or update customer details
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Check if user is a customer
    if user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerk ID {clerk_id} is not a customer"
        )
    
    # Check if customer details already exist
    result = await db.execute(select(CustomerDetails).where(CustomerDetails.clerkId == clerk_id))
    existing_details = result.scalars().first()
    
    if existing_details:
        # Update existing details
        existing_details.wallet_address = details.wallet_address
        customer_details = existing_details
    else:
        # Create new customer details
        customer_details = CustomerDetails(
            clerkId=clerk_id,
            wallet_address=details.wallet_address
        )
        db.add(customer_details)
    
    await db.commit()
    await db.refresh(customer_details)
    
    return CustomerDetailsResponse(
        clerkId=customer_details.clerkId,
        wallet_address=customer_details.wallet_address
    )

@router.get("/{clerk_id}/details", response_model=CustomerDetailsResponse)
async def get_customer_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get customer details by clerk ID
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Get customer details
    result = await db.execute(select(CustomerDetails).where(CustomerDetails.clerkId == clerk_id))
    customer_details = result.scalars().first()
    
    if not customer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer details for clerk ID {clerk_id} not found"
        )
    
    return CustomerDetailsResponse(
        clerkId=customer_details.clerkId,
        wallet_address=customer_details.wallet_address
    )

@router.put("/{clerk_id}/details", response_model=CustomerDetailsResponse)
async def update_customer_details(clerk_id: str, details: CustomerDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Update customer details by clerk ID
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.clerkId == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerk ID {clerk_id} not found"
        )
    
    # Check if user is a customer
    if user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerk ID {clerk_id} is not a customer"
        )
    
    # Check if customer details exist
    result = await db.execute(select(CustomerDetails).where(CustomerDetails.clerkId == clerk_id))
    customer_details = result.scalars().first()
    
    if not customer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer details for clerk ID {clerk_id} not found"
        )
    
    # Update fields
    customer_details.wallet_address = details.wallet_address
    
    await db.commit()
    await db.refresh(customer_details)
    
    return CustomerDetailsResponse(
        clerkId=customer_details.clerkId,
        wallet_address=customer_details.wallet_address
    )

