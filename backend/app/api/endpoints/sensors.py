from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.sensor import Sensor, SensorLog
from app.schemas.sensor import SensorCreate, SensorResponse, SensorLogCreate, SensorLogResponse, SensorStatusUpdate, RFIDUpdate
from typing import List
from sqlalchemy import select

router = APIRouter()

@router.post("/", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def create_sensor(sensor_data: SensorCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new sensor entry in the database
    """
    # Check if sensor already exists
    existing_sensor = await db.execute(
        select(Sensor).where(Sensor.sensor_id == sensor_data.sensor_id)
    )
    if existing_sensor.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sensor with this ID already exists"
        )

    # Create new sensor
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
    """
    Retrieve all sensors from the database
    """
    result = await db.execute(select(Sensor))
    sensors = result.scalars().all()
    return sensors

@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a specific sensor by ID
    """
    result = await db.execute(
        select(Sensor).where(Sensor.sensor_id == sensor_id)
    )
    sensor = result.scalar_one_or_none()
    
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    return sensor

@router.get("/logs/{sensor_id}", response_model=List[SensorLogResponse])
async def get_sensor_logs(
    sensor_id: str, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    """
    Get logs for a specific sensor with limit parameter
    """
    # Check if sensor exists
    sensor_exists = await db.execute(
        select(Sensor).where(Sensor.sensor_id == sensor_id)
    )
    if not sensor_exists.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Get logs
    result = await db.execute(
        select(SensorLog)
        .where(SensorLog.sensor_id == sensor_id)
        .order_by(SensorLog.timestamp.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    return logs


@router.post("/update-status", status_code=status.HTTP_200_OK)
async def update_sensor_status(
    data: SensorStatusUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update sensor status and handle payments when bin is emptied
    1. Toggle status if received status matches current status
    2. Create log entry
    3. Process payment when status changes to False
    """
    # Get sensor
    sensor = await db.get(Sensor, data.sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    # Determine new status
    new_status = data.status
    if sensor.sensor_status and data.status:
        new_status = False

    # Update sensor status
    sensor.sensor_status = new_status
    db.add(sensor)
    
    # Create log entry
    log = SensorLog(
        sensor_id=data.sensor_id,
        sensor_status=new_status,
        RFID=None
    )
    db.add(log)
    
    await db.commit()
    await db.refresh(sensor)

    # Process payment only when bin is emptied (status=False)
    if not new_status:
        # Find latest successful RFID log
        rfid_log = await db.execute(
            select(SensorLog)
            .where(
                SensorLog.sensor_id == data.sensor_id,
                SensorLog.sensor_status == True,
                SensorLog.RFID.isnot(None)
            )
            .order_by(SensorLog.timestamp.desc())
            .limit(1)
        )
        rfid_log = rfid_log.scalar_one_or_none()

        if rfid_log:
            # Get associated ragpicker
            ragpicker = await db.execute(
                select(RagpickerDetails)
                .where(RagpickerDetails.RFID == rfid_log.RFID)
            )
            ragpicker = ragpicker.scalar_one_or_none()

            if ragpicker:
                # Get company balance
                company = await db.execute(
                    select(CompanyBalances)
                    .where(CompanyBalances.id == sensor.company_id)
                )
                company = company.scalar_one_or_none()

                if company and company.balance >= 60:
                    # Update balances
                    company.balance -= 60
                    
                    # Update ragpicker balance
                    ragpicker_balance = await db.execute(
                        select(Balances)
                        .where(Balances.clerkId == ragpicker.clerkId)
                    )
                    ragpicker_balance = ragpicker_balance.scalar_one_or_none()
                    
                    if ragpicker_balance:
                        ragpicker_balance.balance += 60
                    else:
                        db.add(Balances(
                            clerkId=ragpicker.clerkId, 
                            balance=60
                        ))
                    
                    await db.commit()

    return {"message": "Status updated successfully"}



@router.post("/rfid", status_code=status.HTTP_200_OK)
async def update_rfid(
    data: RFIDUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update RFID for the latest active log entry
    1. Verify RFID exists in system
    2. Find latest open log entry
    3. Update RFID information
    """
    # Verify RFID exists
    ragpicker = await db.execute(
        select(RagpickerDetails)
        .where(RagpickerDetails.RFID == data.rfid)
    )
    ragpicker = ragpicker.scalar_one_or_none()
    
    if not ragpicker:
        raise HTTPException(
            status_code=400, 
            detail="Invalid RFID - not registered"
        )

    # Find latest eligible log
    log_entry = await db.execute(
        select(SensorLog)
        .where(
            SensorLog.sensor_id == data.sensor_id,
            SensorLog.sensor_status == True,
            SensorLog.RFID.is_(None)
        )
        .order_by(SensorLog.timestamp.desc())
        .limit(1)
    )
    log_entry = log_entry.scalar_one_or_none()

    if not log_entry:
        raise HTTPException(
            status_code=404,
            detail="No active log entry found for this sensor"
        )

    # Update RFID
    log_entry.RFID = data.rfid
    db.add(log_entry)
    await db.commit()

    return {"message": "RFID updated successfully"}