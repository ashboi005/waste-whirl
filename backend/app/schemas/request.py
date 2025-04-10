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


class SmartContractUpdate(BaseModel):
    smart_contract_address: str


class RequestResponse(RequestBase):
    id: int
    status: str
    smart_contract_address: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Include customer and ragpicker names from joined queries
    customer_name: Optional[str] = None
    ragpicker_name: Optional[str] = None
    customer_address: Optional[str] = None  # Physical address
    
    # Wallet addresses for blockchain integration
    customer_wallet_address: Optional[str] = None
    ragpicker_wallet_address: Optional[str] = None

    class Config:
        from_attributes = True 