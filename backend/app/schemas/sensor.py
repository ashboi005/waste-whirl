# schemas/sensor.py
from pydantic import BaseModel
from datetime import datetime

class SensorBase(BaseModel):
    sensor_id: str
    sensor_name: str
    location: str
    company_id: int | None = None

class SensorCreate(SensorBase):
    pass

class SensorResponse(SensorBase):
    sensor_status: bool
    
    class Config:
        orm_mode = True

class SensorLogBase(BaseModel):
    sensor_id: str
    sensor_status: bool

class SensorLogCreate(SensorLogBase):
    pass

class SensorLogResponse(SensorLogBase):
    id: int
    RFID: str | None
    timestamp: datetime
    
    class Config:
        orm_mode = True


class SensorStatusUpdate(BaseModel):
    sensor_id: str
    status: bool

class RFIDUpdate(BaseModel):
    sensor_id: str
    rfid: str