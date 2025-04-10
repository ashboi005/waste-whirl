from mfrc522 import SimpleMFRC522
import time

reader = SimpleMFRC522()

print("Place your RFID tag near the reader...")

try:
    while True:
        id, text = reader.read()
        print(f"RFID Tag ID: {id}")
        print(f"Text (if any): {text.strip()}")
        time.sleep(1)

except KeyboardInterrupt:
    print("Stopping RFID reader")

finally:
    print("Cleaning up GPIO")
    import RPi.GPIO as GPIO
    GPIO.cleanup()

