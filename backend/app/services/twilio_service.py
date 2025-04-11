from twilio.rest import Client
from app.core.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
from fastapi import HTTPException
import logging
from app.core.config import ENVIRONMENT

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
    
    async def send_sms(self, message: str) -> bool:
        """
        Send an SMS message using Twilio
        """
        try:
            to_phone = "+917696763029"
            
            if ENVIRONMENT != "production":
                print(f"SMS: {message}")
                return True
            else:
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
    
    async def send_notification(self, notification_type: str, **kwargs) -> bool:
        """
        Send a predefined notification based on type
        """
        templates = {
            # Customer notifications
            "request_created": "Your garbage collection request has been created. A ragpicker will respond soon.",
            "request_accepted": "Good news! Your garbage collection request #{request_id} has been accepted by {ragpicker_name}. They will arrive at {customer_address} soon.",
            "request_rejected": "Your garbage collection request #{request_id} has been rejected by {ragpicker_name}. Please try booking another ragpicker.",
            "request_completed_customer": "Your garbage collection request #{request_id} with {ragpicker_name} has been marked as completed. {amount} tokens have been transferred. Your new balance: {new_balance} tokens. Thank you for using Waste Whirl!",
            
            # Ragpicker notifications
            "new_request": "New garbage collection request #{request_id} from {customer_name} at {customer_address}. Please check your app to respond.",
            "request_completed_ragpicker": "Request #{request_id} from {customer_name} has been marked as completed. You received {amount} tokens. Your new balance: {new_balance} tokens.",
            "tip_received": "You received a tip of {amount} tokens from {customer_name}. Thank you!",
            "balance_updated": "Your account balance has been updated. New balance: {balance} tokens."
        }
        
        if notification_type not in templates:
            logger.error(f"Unknown notification type: {notification_type}")
            return False
        
        # Format the message with provided kwargs
        try:
            message = templates[notification_type].format(**kwargs)
            logger.info(f"Sending notification of type '{notification_type}': {message}")
            return await self.send_sms(message)
        
        except KeyError as e:
            logger.error(f"Missing parameter for notification template: {str(e)}")
            return False


# Singleton instance
twilio_service = TwilioService() 