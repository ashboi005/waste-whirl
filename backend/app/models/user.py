from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Integer, Enum
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class User(Base):
    __tablename__ = "users"

    clerkId = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    firstName = Column(String)
    lastName = Column(String)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String)  # Either 'Customer' or 'Ragpicker'


class UserDetails(Base):
    __tablename__ = "user_details"

    clerkId = Column(String, ForeignKey("users.clerkId"), primary_key=True)
    phone = Column(String)
    address = Column(String)
    bio = Column(String)
    profile_pic_url = Column(String)


class CustomerDetails(Base):
    __tablename__ = "customer_details"

    clerkId = Column(String, ForeignKey("users.clerkId"), primary_key=True)
    wallet_address = Column(String)


class RagpickerDetails(Base):
    __tablename__ = "ragpicker_details"

    clerkId = Column(String, ForeignKey("users.clerkId"), primary_key=True)
    wallet_address = Column(String)
    RFID = Column(String, nullable=True)
    average_rating = Column(Float, default=0.0)


class Balances(Base):
    __tablename__ = "balances"

    clerkId = Column(String, ForeignKey("users.clerkId"), primary_key=True)
    balance = Column(Float, default=0.0)


class CompanyBalances(Base):
    __tablename__ = "company_balances"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    company_password = Column(String)
    balance = Column(Float, default=0.0)


class Reviews(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_clerkId = Column(String, ForeignKey("users.clerkId"))
    ragpicker_clerkId = Column(String, ForeignKey("users.clerkId"))
    rating = Column(Float)
    review = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Requests(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    customer_clerkId = Column(String, ForeignKey("users.clerkId"))
    ragpicker_clerkId = Column(String, ForeignKey("users.clerkId"))
    status = Column(String)  # PENDING, ACCEPTED, REJECTED, COMPLETED
    smart_contract_address = Column(String, nullable=True)  # Added for blockchain integration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ApplicationStatus(enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class RagpickerApplication(Base):
    __tablename__ = "ragpicker_applications"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, ForeignKey("users.clerkId"))
    document_url = Column(String)  # S3 URL for the uploaded PDF
    notes = Column(String)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 