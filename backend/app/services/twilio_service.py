from twilio.rest import Client
from app.core.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class TwilioService:
    """
    Twilio service for sending SMS messages
    """
    def __init__(self):
        self.account_sid = TWILIO_ACCOUNT_SID
        self.auth_token = TWILIO_AUTH_TOKEN
        self.phone_number = TWILIO_PHONE_NUMBER
        self.client = Client(self.account_sid, self.auth_token)
    
    async def send_sms(self, to_phone: str, message: str) -> bool:
        """
        Send an SMS message using Twilio
        """
        try:
            # Format the phone number if needed
            if not to_phone.startswith('+'):
                to_phone = f"+{to_phone}"
            
            # Send the message
            sms = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"SMS sent to {to_phone}: {sms.sid}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            # Don't raise an exception, just return False
            # This is to prevent API failures if SMS sending fails
            return False
    
    async def send_notification(self, to_phone: str, notification_type: str, **kwargs) -> bool:
        """
        Send a predefined notification based on type
        """
        templates = {
            "request_created": "Your garbage collection request has been created. A ragpicker will respond soon.",
            "request_accepted": "Good news! Your garbage collection request has been accepted by {ragpicker_name}.",
            "request_rejected": "Your garbage collection request has been rejected. Please try booking another ragpicker.",
            "request_completed": "Your garbage collection request has been marked as completed. Thank you for using Waste Whirl!",
            "new_request": "New garbage collection request from {customer_name}. Please check your app to respond.",
            "tip_received": "You received a tip of ${amount} from {customer_name}. Thank you!",
            "balance_updated": "Your account balance has been updated. New balance: ${balance}."
        }
        
        if notification_type not in templates:
            logger.error(f"Unknown notification type: {notification_type}")
            return False
        
        # Format the message with provided kwargs
        try:
            message = templates[notification_type].format(**kwargs)
            return await self.send_sms(to_phone, message)
        
        except KeyError as e:
            logger.error(f"Missing parameter for notification template: {str(e)}")
            return False


# Singleton instance
twilio_service = TwilioService() 