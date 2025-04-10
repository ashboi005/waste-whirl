import RPi.GPIO as GPIO
import time

# Setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Define the GPIO pins to read
PIN_14 = 14
PIN_15 = 15

GPIO.setup(PIN_14, GPIO.IN)
GPIO.setup(PIN_15, GPIO.IN)

print("Reading GPIO pins 14 and 15. Press Ctrl+C to stop.")

try:
    while True:
        state_14 = GPIO.input(PIN_14)
        state_15 = GPIO.input(PIN_15)

        print(f"GPIO 14: {'HIGH' if state_14 else 'LOW'} | GPIO 15: {'HIGH' if state_15 else 'LOW'}")

        time.sleep(0.5)  # adjust as needed
except KeyboardInterrupt:
    print("\nStopped by user.")
finally:
    GPIO.cleanup()

