import RPi.GPIO as GPIO
import time
import subprocess

# === GPIO Setup ===
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Pin configuration
PIN_14 = 14
LED_PIN = 18  # Example output pin (optional)

# Setup GPIO
GPIO.setup(PIN_14, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(LED_PIN, GPIO.OUT)  # Optional status LED

# State machine
class States:
    READY = 0
    ACTIVE = 1

current_state = States.READY
last_edge_time = 0
debounce_delay = 0.2  # 200ms debounce period

def execute_task():
    """Function to handle the task execution"""
    print("🚀 Starting task execution...")
    GPIO.output(LED_PIN, GPIO.HIGH)  # Visual feedback
    try:
        subprocess.run(['python', 'capture_classification.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Task failed: {e}")
    finally:
        GPIO.output(LED_PIN, GPIO.LOW)
    print("✅ Task completed")

try:
    print("System READY - Waiting for GPIO 14 trigger...")
    GPIO.output(LED_PIN, GPIO.HIGH)  # Ready state indicator
    
    while True:
        current_input = GPIO.input(PIN_14)
        now = time.time()
        
        # State machine logic
        if current_state == States.READY:
            if current_input == GPIO.HIGH and (now - last_edge_time) > debounce_delay:
                print("⬆️ Rising edge detected - Transitioning to ACTIVE state")
                current_state = States.ACTIVE
                last_edge_time = now
                execute_task()
                
        elif current_state == States.ACTIVE:
            if current_input == GPIO.LOW and (now - last_edge_time) > debounce_delay:
                print("⬇️ Falling edge detected - Returning to READY state")
                current_state = States.READY
                last_edge_time = now
                GPIO.output(LED_PIN, GPIO.HIGH)  # Ready indicator
        
        time.sleep(0.01)  # 10ms polling interval

except KeyboardInterrupt:
    print("\n🛑 System shutdown by user")
finally:
    GPIO.cleanup()
    print("GPIO resources cleaned up")
