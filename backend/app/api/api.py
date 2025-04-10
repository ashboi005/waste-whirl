from fastapi import APIRouter
from app.api.endpoints import users, customers, ragpickers, requests, reviews, sensors

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(ragpickers.router, prefix="/ragpickers", tags=["ragpickers"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(sensors.router, prefix="/sensors", tags=["sensors"]) 