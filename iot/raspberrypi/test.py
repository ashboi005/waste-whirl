import RPi.GPIO as GPIO
import time
import requests

# Configuration
GPIO_PIN = 15                  # GPIO pin for ultrasonic sensor
BIN_ID = "Bin1"                # Your bin identifier
BACKEND_URL = "https://pleasant-mullet-unified.ngrok-free.app/sensors/update-status"
UPDATE_INTERVAL = 0.5          # Seconds between checks

# GPIO Setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)        # Disable GPIO warnings
GPIO.setup(GPIO_PIN, GPIO.IN)  # Ultrasonic sensor input

def send_bin_status(is_full):
    """Send status to backend with the exact required parameters"""
    payload = {
        "sensor_id": BIN_ID,
        "status": bool(is_full)  # Ensure boolean type
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload)
        if response.status_code == 200:
            print(f"✓ Success | Bin {'FULL' if is_full else 'EMPTY'}")
        else:
            print(f"✗ Failed (HTTP {response.status_code}) | Response: {response.text}")
    except Exception as e:
        print(f"! Connection Error: {str(e)}")

def main():
    last_state = None
    print(f"🚀 Starting Smart Bin Monitor (ID: {BIN_ID})...")
    
    try:
        while True:
            current_state = GPIO.input(GPIO_PIN)
            
            # Only send update when state changes
            if current_state != last_state:
                send_bin_status(current_state)
                last_state = current_state
            
            time.sleep(UPDATE_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n🛑 Program stopped")
    finally:
        GPIO.cleanup()

if __name__ == "__main__":
    main()
