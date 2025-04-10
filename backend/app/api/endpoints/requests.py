from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.db.database import get_db
from app.models.user import User, Requests, Balances, CustomerDetails, RagpickerDetails, UserDetails
from app.schemas.request import RequestCreate, RequestResponse, RequestUpdate, SmartContractUpdate
from app.services.twilio_service import twilio_service
from typing import List
import logging
from datetime import datetime

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(request_data: RequestCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new request from customer to ragpicker
    """
    # Check if customer exists
    customer_result = await db.execute(select(User).where(User.clerkId == request_data.customer_clerkId))
    customer = customer_result.scalars().first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with clerk ID {request_data.customer_clerkId} not found"
        )
    
    # Check if ragpicker exists
    ragpicker_result = await db.execute(select(User).where(User.clerkId == request_data.ragpicker_clerkId))
    ragpicker = ragpicker_result.scalars().first()
    
    if not ragpicker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ragpicker with clerk ID {request_data.ragpicker_clerkId} not found"
        )
    
    # Create new request
    new_request = Requests(
        customer_clerkId=request_data.customer_clerkId,
        ragpicker_clerkId=request_data.ragpicker_clerkId,
        status="PENDING",
        smart_contract_address=None
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # Send notification to ragpicker (not throwing error if it fails)
    await twilio_service.send_notification(
        notification_type="new_request",
        customer_name=f"{customer.firstName} {customer.lastName}"
    )
    
    # Get customer and ragpicker names for response
    customer_name = f"{customer.firstName} {customer.lastName}"
    ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}"
    
    # Get customer address
    customer_address = None
    user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request_data.customer_clerkId))
    user_details = user_details_result.scalars().first()
    if user_details:
        customer_address = user_details.address
    
    return RequestResponse(
        id=new_request.id,
        customer_clerkId=new_request.customer_clerkId,
        ragpicker_clerkId=new_request.ragpicker_clerkId,
        status=new_request.status,
        smart_contract_address=new_request.smart_contract_address,
        created_at=new_request.created_at,
        updated_at=new_request.updated_at,
        customer_name=customer_name,
        ragpicker_name=ragpicker_name,
        customer_address=customer_address
    )

@router.put("/{request_id}/status", response_model=RequestResponse)
async def update_request_status(request_id: int, request_update: RequestUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update request status (accept/reject)
    For ACCEPTED status, it sends a notification to the customer
    """
    # Check if request exists
    result = await db.execute(select(Requests).where(Requests.id == request_id))
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with ID {request_id} not found"
        )
    
    # Update status
    request.status = request_update.status
    request.updated_at = datetime.now()
    
    await db.commit()
    await db.refresh(request)
    
    # Get customer and ragpicker data for notification and response
    customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
    customer = customer_result.scalars().first()
    
    ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
    ragpicker = ragpicker_result.scalars().first()
    
    customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
    ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
    
    # Get customer address
    customer_address = None
    user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
    user_details = user_details_result.scalars().first()
    if user_details:
        customer_address = user_details.address
    
    # Send notification based on status
    if request_update.status == "ACCEPTED":
        await twilio_service.send_notification(
            notification_type="request_accepted",
            ragpicker_name=ragpicker_name
        )
        
        # Get wallet addresses for blockchain integration
        customer_wallet = None
        customer_details_result = await db.execute(select(CustomerDetails).where(CustomerDetails.clerkId == request.customer_clerkId))
        customer_details = customer_details_result.scalars().first()
        if customer_details:
            customer_wallet = customer_details.wallet_address
        
        ragpicker_wallet = None
        ragpicker_details_result = await db.execute(select(RagpickerDetails).where(RagpickerDetails.clerkId == request.ragpicker_clerkId))
        ragpicker_details = ragpicker_details_result.scalars().first()
        if ragpicker_details:
            ragpicker_wallet = ragpicker_details.wallet_address
            
        return RequestResponse(
            id=request.id,
            customer_clerkId=request.customer_clerkId,
            ragpicker_clerkId=request.ragpicker_clerkId,
            status=request.status,
            smart_contract_address=request.smart_contract_address,
            created_at=request.created_at,
            updated_at=request.updated_at,
            customer_name=customer_name,
            ragpicker_name=ragpicker_name,
            customer_address=customer_address,
            customer_wallet_address=customer_wallet,
            ragpicker_wallet_address=ragpicker_wallet
        )
    elif request_update.status == "REJECTED":
        await twilio_service.send_notification(
            notification_type="request_rejected"
        )
    
    return RequestResponse(
        id=request.id,
        customer_clerkId=request.customer_clerkId,
        ragpicker_clerkId=request.ragpicker_clerkId,
        status=request.status,
        smart_contract_address=request.smart_contract_address,
        created_at=request.created_at,
        updated_at=request.updated_at,
        customer_name=customer_name,
        ragpicker_name=ragpicker_name,
        customer_address=customer_address
    )

@router.put("/{request_id}/smart-contract", response_model=RequestResponse)
async def update_smart_contract(request_id: int, contract_data: SmartContractUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update the smart contract address for a request
    """
    # Check if request exists
    result = await db.execute(select(Requests).where(Requests.id == request_id))
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with ID {request_id} not found"
        )
    
    # Check if request status is ACCEPTED
    if request.status != "ACCEPTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Smart contract can only be added to ACCEPTED requests"
        )
    
    # Update smart contract address
    request.smart_contract_address = contract_data.smart_contract_address
    request.updated_at = datetime.now()
    
    await db.commit()
    await db.refresh(request)
    
    # Get customer and ragpicker data for response
    customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
    customer = customer_result.scalars().first()
    
    ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
    ragpicker = ragpicker_result.scalars().first()
    
    customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
    ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
    
    # Get customer address
    customer_address = None
    user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
    user_details = user_details_result.scalars().first()
    if user_details:
        customer_address = user_details.address
    
    return RequestResponse(
        id=request.id,
        customer_clerkId=request.customer_clerkId,
        ragpicker_clerkId=request.ragpicker_clerkId,
        status=request.status,
        smart_contract_address=request.smart_contract_address,
        created_at=request.created_at,
        updated_at=request.updated_at,
        customer_name=customer_name,
        ragpicker_name=ragpicker_name,
        customer_address=customer_address
    )

@router.put("/{request_id}/complete", response_model=RequestResponse)
async def complete_request(request_id: int, db: AsyncSession = Depends(get_db)):
    """
    Mark a request as completed and transfer funds
    """
    # Check if request exists
    result = await db.execute(select(Requests).where(Requests.id == request_id))
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with ID {request_id} not found"
        )
    
    # Check if request status is ACCEPTED
    if request.status != "ACCEPTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only ACCEPTED requests can be completed"
        )
    
    # Check if smart contract address is set
    if not request.smart_contract_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Smart contract address is not set for this request"
        )
    
    # Update status to COMPLETED
    request.status = "COMPLETED"
    request.updated_at = datetime.now()
    
    # Transfer funds from customer to ragpicker (fixed amount for now)
    transfer_amount = 100.0  # Fixed amount in credits/tokens
    
    # Get customer balance
    customer_balance_result = await db.execute(select(Balances).where(Balances.clerkId == request.customer_clerkId))
    customer_balance = customer_balance_result.scalars().first()
    
    if not customer_balance:
        # Create customer balance if not exists
        customer_balance = Balances(
            clerkId=request.customer_clerkId,
            balance=0.0
        )
        db.add(customer_balance)
        await db.commit()
        await db.refresh(customer_balance)
    
    # Get ragpicker balance
    ragpicker_balance_result = await db.execute(select(Balances).where(Balances.clerkId == request.ragpicker_clerkId))
    ragpicker_balance = ragpicker_balance_result.scalars().first()
    
    if not ragpicker_balance:
        # Create ragpicker balance if not exists
        ragpicker_balance = Balances(
            clerkId=request.ragpicker_clerkId,
            balance=0.0
        )
        db.add(ragpicker_balance)
        await db.commit()
        await db.refresh(ragpicker_balance)
    
    # Deduct from customer
    customer_balance.balance -= transfer_amount
    
    # Add to ragpicker
    ragpicker_balance.balance += transfer_amount
    
    await db.commit()
    await db.refresh(request)
    await db.refresh(customer_balance)
    await db.refresh(ragpicker_balance)
    
    # Get customer and ragpicker data for notification and response
    customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
    customer = customer_result.scalars().first()
    
    ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
    ragpicker = ragpicker_result.scalars().first()
    
    customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
    ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
    
    # Get customer address
    customer_address = None
    user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
    user_details = user_details_result.scalars().first()
    if user_details:
        customer_address = user_details.address
    
    # Send notification to both parties
    await twilio_service.send_notification(
        notification_type="request_completed"
    )
    
    await twilio_service.send_notification(
        notification_type="balance_updated",
        balance=str(ragpicker_balance.balance)
    )
    
    return RequestResponse(
        id=request.id,
        customer_clerkId=request.customer_clerkId,
        ragpicker_clerkId=request.ragpicker_clerkId,
        status=request.status,
        smart_contract_address=request.smart_contract_address,
        created_at=request.created_at,
        updated_at=request.updated_at,
        customer_name=customer_name,
        ragpicker_name=ragpicker_name,
        customer_address=customer_address
    )

@router.get("/", response_model=List[RequestResponse])
async def get_all_requests(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Get all requests
    """
    query = select(Requests).offset(skip).limit(limit).order_by(Requests.created_at.desc())
    result = await db.execute(query)
    requests = result.scalars().all()
    
    response_list = []
    for request in requests:
        # Get customer and ragpicker data
        customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
        customer = customer_result.scalars().first()
        
        ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
        ragpicker = ragpicker_result.scalars().first()
        
        customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
        ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
        
        # Get customer address
        customer_address = None
        user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
        user_details = user_details_result.scalars().first()
        if user_details:
            customer_address = user_details.address
        
        response_list.append(
            RequestResponse(
                id=request.id,
                customer_clerkId=request.customer_clerkId,
                ragpicker_clerkId=request.ragpicker_clerkId,
                status=request.status,
                smart_contract_address=request.smart_contract_address,
                created_at=request.created_at,
                updated_at=request.updated_at,
                customer_name=customer_name,
                ragpicker_name=ragpicker_name,
                customer_address=customer_address
            )
        )
    
    return response_list

@router.get("/customer/{clerk_id}", response_model=List[RequestResponse])
async def get_customer_requests(clerk_id: str, status: str = None, db: AsyncSession = Depends(get_db)):
    """
    Get all requests from a customer, optionally filtered by status
    """
    if status:
        query = select(Requests).where(
            and_(Requests.customer_clerkId == clerk_id, Requests.status == status)
        ).order_by(Requests.created_at.desc())
    else:
        query = select(Requests).where(
            Requests.customer_clerkId == clerk_id
        ).order_by(Requests.created_at.desc())
        
    result = await db.execute(query)
    requests = result.scalars().all()
    
    response_list = []
    for request in requests:
        # Get customer and ragpicker data
        customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
        customer = customer_result.scalars().first()
        
        ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
        ragpicker = ragpicker_result.scalars().first()
        
        customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
        ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
        
        # Get customer address
        customer_address = None
        user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
        user_details = user_details_result.scalars().first()
        if user_details:
            customer_address = user_details.address
        
        response_list.append(
            RequestResponse(
                id=request.id,
                customer_clerkId=request.customer_clerkId,
                ragpicker_clerkId=request.ragpicker_clerkId,
                status=request.status,
                smart_contract_address=request.smart_contract_address,
                created_at=request.created_at,
                updated_at=request.updated_at,
                customer_name=customer_name,
                ragpicker_name=ragpicker_name,
                customer_address=customer_address
            )
        )
    
    return response_list

@router.get("/ragpicker/{clerk_id}", response_model=List[RequestResponse])
async def get_ragpicker_requests(clerk_id: str, status: str = None, db: AsyncSession = Depends(get_db)):
    """
    Get all requests for a ragpicker, optionally filtered by status
    """
    if status:
        query = select(Requests).where(
            and_(Requests.ragpicker_clerkId == clerk_id, Requests.status == status)
        ).order_by(Requests.created_at.desc())
    else:
        query = select(Requests).where(
            Requests.ragpicker_clerkId == clerk_id
        ).order_by(Requests.created_at.desc())
        
    result = await db.execute(query)
    requests = result.scalars().all()
    
    response_list = []
    for request in requests:
        # Get customer and ragpicker data
        customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
        customer = customer_result.scalars().first()
        
        ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
        ragpicker = ragpicker_result.scalars().first()
        
        customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
        ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
        
        # Get customer address
        customer_address = None
        user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
        user_details = user_details_result.scalars().first()
        if user_details:
            customer_address = user_details.address
        
        response_list.append(
            RequestResponse(
                id=request.id,
                customer_clerkId=request.customer_clerkId,
                ragpicker_clerkId=request.ragpicker_clerkId,
                status=request.status,
                smart_contract_address=request.smart_contract_address,
                created_at=request.created_at,
                updated_at=request.updated_at,
                customer_name=customer_name,
                ragpicker_name=ragpicker_name,
                customer_address=customer_address
            )
        )
    
    return response_list

@router.get("/{request_id}", response_model=RequestResponse)
async def get_request(request_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific request by ID
    """
    result = await db.execute(select(Requests).where(Requests.id == request_id))
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with ID {request_id} not found"
        )
    
    # Get customer and ragpicker data
    customer_result = await db.execute(select(User).where(User.clerkId == request.customer_clerkId))
    customer = customer_result.scalars().first()
    
    ragpicker_result = await db.execute(select(User).where(User.clerkId == request.ragpicker_clerkId))
    ragpicker = ragpicker_result.scalars().first()
    
    customer_name = f"{customer.firstName} {customer.lastName}" if customer else "Customer"
    ragpicker_name = f"{ragpicker.firstName} {ragpicker.lastName}" if ragpicker else "Ragpicker"
    
    # Get customer address
    customer_address = None
    user_details_result = await db.execute(select(UserDetails).where(UserDetails.clerkId == request.customer_clerkId))
    user_details = user_details_result.scalars().first()
    if user_details:
        customer_address = user_details.address
    
    # Get wallet addresses if request is in ACCEPTED state
    customer_wallet = None
    ragpicker_wallet = None
    
    if request.status == "ACCEPTED":
        # Get customer wallet
        customer_details_result = await db.execute(select(CustomerDetails).where(CustomerDetails.clerkId == request.customer_clerkId))
        customer_details = customer_details_result.scalars().first()
        if customer_details:
            customer_wallet = customer_details.wallet_address
        
        # Get ragpicker wallet
        ragpicker_details_result = await db.execute(select(RagpickerDetails).where(RagpickerDetails.clerkId == request.ragpicker_clerkId))
        ragpicker_details = ragpicker_details_result.scalars().first()
        if ragpicker_details:
            ragpicker_wallet = ragpicker_details.wallet_address
    
    return RequestResponse(
        id=request.id,
        customer_clerkId=request.customer_clerkId,
        ragpicker_clerkId=request.ragpicker_clerkId,
        status=request.status,
        smart_contract_address=request.smart_contract_address,
        created_at=request.created_at,
        updated_at=request.updated_at,
        customer_name=customer_name,
        ragpicker_name=ragpicker_name,
        customer_address=customer_address,
        customer_wallet_address=customer_wallet,
        ragpicker_wallet_address=ragpicker_wallet
    ) 