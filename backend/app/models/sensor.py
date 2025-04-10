from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Integer
from sqlalchemy.sql import func
from app.db.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    sensor_id = Column(String, primary_key=True, index=True)
    sensor_name = Column(String)
    location = Column(String)
    sensor_status = Column(Boolean, default=False)
    company_id = Column(Integer, ForeignKey("company_balances.id"), nullable=True)


class SensorLog(Base):
    __tablename__ = "sensor_logs"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey("sensors.sensor_id"))
    RFID = Column(String, nullable=True)
    sensor_status = Column(Boolean)
    timestamp = Column(DateTime(timezone=True), server_default=func.now()) 