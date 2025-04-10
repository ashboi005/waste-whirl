from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SensorBase(BaseModel):
    sensor_name: str
    location: str
    sensor_status: bool = False


class SensorCreate(SensorBase):
    sensor_id: str


class SensorResponse(SensorBase):
    sensor_id: str

    class Config:
        from_attributes = True


class SensorLogBase(BaseModel):
    sensor_id: str
    RFID: Optional[str] = None
    sensor_status: bool


class SensorLogCreate(SensorLogBase):
    pass


class SensorLogResponse(SensorLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class SensorStatusUpdate(BaseModel):
    sensor_id: str
    status: bool


class SensorRFIDUpdate(BaseModel):
    sensor_id: str
    rfid: str 