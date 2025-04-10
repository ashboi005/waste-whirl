from pydantic import BaseModel
from typing import Optional


class CustomerDetailsBase(BaseModel):
    wallet_address: Optional[str] = None


class CustomerDetailsCreate(CustomerDetailsBase):
    pass


class CustomerDetailsResponse(CustomerDetailsBase):
    clerkId: str

    class Config:
        from_attributes = True


class CustomerBalanceResponse(BaseModel):
    clerkId: str
    balance: float

    class Config:
        from_attributes = True 