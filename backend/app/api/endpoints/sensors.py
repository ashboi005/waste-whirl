from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from app.db.database import get_db
from app.models.sensor import Sensor, SensorLog
from app.models.user import User, UserDetails, RagpickerDetails, CompanyBalances, Balances
from app.schemas.sensor import (
    SensorCreate, 
    SensorResponse,
    SensorLogResponse,
    SensorStatusUpdate,
    RFIDUpdate
)
from typing import List
import os
from datetime import datetime
from app.services.twilio_service import TwilioService

router = APIRouter()
twilio_service = TwilioService()

# Sensor CRUD Endpoints
@router.post("/", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def create_sensor(
    sensor_data: SensorCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Create a new sensor"""
    existing_sensor = await db.execute(
        select(Sensor).where(Sensor.sensor_id == sensor_data.sensor_id)
    )
    if existing_sensor.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sensor with this ID already exists"
        )

    new_sensor = Sensor(
        sensor_id=sensor_data.sensor_id,
        sensor_name=sensor_data.sensor_name,
        location=sensor_data.location,
        company_id=sensor_data.company_id
    )

    db.add(new_sensor)
    await db.commit()
    await db.refresh(new_sensor)
    return new_sensor

@router.get("/", response_model=List[SensorResponse])
async def get_sensors(db: AsyncSession = Depends(get_db)):
    """Get all sensors"""
    result = await db.execute(select(Sensor))
    return result.scalars().all()

@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: str, db: AsyncSession = Depends(get_db)):
    """Get sensor by ID"""
    sensor = await db.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.get("/logs/{sensor_id}", response_model=List[SensorLogResponse])
async def get_sensor_logs(
    sensor_id: str, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    """Get sensor logs"""
    sensor = await db.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    result = await db.execute(
        select(SensorLog)
        .where(SensorLog.sensor_id == sensor_id)
        .order_by(SensorLog.timestamp.desc())
        .limit(limit)
    )
    return result.scalars().all()

# Sensor Operation Endpoints
@router.post("/update-status", status_code=status.HTTP_200_OK)
async def update_sensor_status(
    data: SensorStatusUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update sensor status with strict RFID validation"""
    # Get sensor
    sensor = await db.get(Sensor, data.sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    # Prevent redundant status changes
    if sensor.sensor_status == data.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sensor already in {data.status} state"
        )

    new_status = data.status

    if new_status:
        # Check for existing active log
        existing_log = await db.execute(
            select(SensorLog)
            .where(
                and_(
                    SensorLog.sensor_id == data.sensor_id,
                    SensorLog.sensor_status == True
                )
            )
            .limit(1)
        )
        if existing_log.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Active log already exists"
            )

        # Create new log entry for "full" status
        log = SensorLog(
            sensor_id=data.sensor_id,
            sensor_status=True,
            RFID=None
        )
        db.add(log)
    else:
        # Find active log with RFID to mark as emptied
        active_log = await db.execute(
            select(SensorLog)
            .where(
                and_(
                    SensorLog.sensor_id == data.sensor_id,
                    SensorLog.sensor_status == True,
                    SensorLog.RFID.isnot(None)
                )
            )
            .order_by(SensorLog.timestamp.desc())
            .limit(1)
        )
        active_log = active_log.scalar_one_or_none()

        if not active_log:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFID not scanned for current active log"
            )

        # Update existing log entry
        active_log.sensor_status = False
        active_log.timestamp = datetime.utcnow()
        db.add(active_log)

    # Update sensor status
    sensor.sensor_status = new_status
    db.add(sensor)
    
    await db.commit()
    await db.refresh(sensor)

    # Handle notifications
    if new_status:
        try:
            company_number = os.getenv("TWILIO_PHONE_NUMBER")
            message = f"🚨 Alert: Bin {sensor.sensor_id} at {sensor.location} is full!"
            await twilio_service.send_sms(message)
        except Exception as e:
            print(f"Failed to send full notification: {str(e)}")
    else:
        await process_payment(data.sensor_id, db, sensor)

    return {"message": "Status updated successfully"}

async def process_payment(sensor_id: str, db: AsyncSession, sensor: Sensor):
    """Process payment for emptied bin"""
    # Get the updated log entry
    log_entry = await db.execute(
        select(SensorLog)
        .where(
            and_(
                SensorLog.sensor_id == sensor_id,
                SensorLog.sensor_status == False
            )
        )
        .order_by(SensorLog.timestamp.desc())
        .limit(1)
    )
    log_entry = log_entry.scalar_one_or_none()

    if not log_entry or not log_entry.RFID:
        return

    # Get ragpicker details
    ragpicker = await db.execute(
        select(RagpickerDetails)
        .where(RagpickerDetails.RFID == log_entry.RFID)
    )
    ragpicker = ragpicker.scalar_one_or_none()

    if not ragpicker:
        return

    # Verify company balance
    company = await db.execute(
        select(CompanyBalances)
        .where(CompanyBalances.id == sensor.company_id)
    )
    company = company.scalar_one_or_none()

    if not company or company.balance < 60:
        return

    # Update balances
    company.balance -= 60
    
    ragpicker_balance = await db.execute(
        select(Balances)
        .where(Balances.clerkId == ragpicker.clerkId)
    )
    ragpicker_balance = ragpicker_balance.scalar_one_or_none()
    
    if ragpicker_balance:
        ragpicker_balance.balance += 60
    else:
        db.add(Balances(clerkId=ragpicker.clerkId, balance=60))
    
    await db.commit()

    # Send payment notification
    try:
        user_details = await db.execute(
            select(UserDetails)
            .join(User, UserDetails.clerkId == User.clerkId)
            .where(User.clerkId == ragpicker.clerkId)
        )
        user_details = user_details.scalar_one_or_none()
        
        if user_details and user_details.phone:
            message = f"💸 Payment: ₹60 credited for emptying bin {sensor_id}"
            await twilio_service.send_sms(message)
    except Exception as e:
        print(f"Failed to send payment SMS: {str(e)}")

@router.post("/rfid", status_code=status.HTTP_200_OK)
async def update_rfid(
    data: RFIDUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update RFID for the active log entry"""
    # Verify RFID exists
    ragpicker = await db.execute(
        select(RagpickerDetails)
        .where(RagpickerDetails.RFID == data.rfid)
    )
    ragpicker = ragpicker.scalar_one_or_none()
    
    if not ragpicker:
        raise HTTPException(status_code=400, detail="Invalid RFID")

    # Find active log entry
    active_log = await db.execute(
        select(SensorLog)
        .where(
            and_(
                SensorLog.sensor_id == data.sensor_id,
                SensorLog.sensor_status == True,
                SensorLog.RFID.is_(None)
            )
        )
        .order_by(SensorLog.timestamp.desc())
        .limit(1)
    )
    active_log = active_log.scalar_one_or_none()

    if not active_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active log entry found"
        )

    # Update RFID in existing log
    active_log.RFID = data.rfid
    db.add(active_log)
    await db.commit()

    return {"message": "RFID updated successfully"}