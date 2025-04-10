import RPi.GPIO as GPIO
import time

# Set GPIO mode
GPIO.setmode(GPIO.BCM)

TRIG = 23
ECHO = 24

GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)

def get_distance():
    # Trigger pulse
    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    # Wait for echo start
    while GPIO.input(ECHO) == 0:
        start_time = time.time()

    # Wait for echo end
    while GPIO.input(ECHO) == 1:
        end_time = time.time()

    # Time difference
    duration = end_time - start_time

    # Speed of sound: 34300 cm/s
    distance = (duration * 34300) / 2

    return round(distance, 2)

try:
    while True:
        dist = get_distance()
        print(f"Distance: {dist} cm")
        time.sleep(1)

except KeyboardInterrupt:
    GPIO.cleanup()

