import RPi.GPIO as GPIO
import time

# Set up GPIO mode
GPIO.setmode(GPIO.BCM)

# Define GPIO pins for HC-SR04
TRIG = 23  # GPIO pin for Trigger
ECHO = 24  # GPIO pin for Echo

# Set up the Trigger and Echo pins
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)

# Function to measure distance
def measure_distance():
    # Ensure the Trigger pin is low initially
    GPIO.output(TRIG, GPIO.LOW)
    time.sleep(0.1)

    # Send a 10us pulse to trigger the sensor
    GPIO.output(TRIG, GPIO.HIGH)
    time.sleep(0.00001)
    GPIO.output(TRIG, GPIO.LOW)

    # Measure the pulse duration from the Echo pin
    while GPIO.input(ECHO) == GPIO.LOW:
        pulse_start = time.time()

    while GPIO.input(ECHO) == GPIO.HIGH:
        pulse_end = time.time()

    # Calculate the distance in cm
    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150  # Speed of sound is 34300 cm/s, divide by 2 for round trip
    distance = round(distance, 2)

    return distance

# Main loop to repeatedly measure distance
try:
    while True:
        distance = measure_distance()
        print(f"Distance: {distance} cm")
        time.sleep(1)

except KeyboardInterrupt:
    print("Measurement stopped by User")
    GPIO.cleanup()  # Clean up GPIO settings when the program is stopped

