import RPi.GPIO as GPIO
import time
import requests

# Set up GPIO mode
GPIO.setmode(GPIO.BCM)

# Define the GPIO pin to read from (GPIO 15)
GPIO_PIN = 15
GPIO.setup(GPIO_PIN, GPIO.IN)  # Set GPIO 15 as input

# Define your backend URL where the data should be sent
backend_url = "https://ohmsi5xapc.execute-api.ap-south-1.amazonaws.com/Prod/sensors/update-status"  # Replace with your URL

# Initialize previous state as None (no state set initially)
previous_state = None

# Function to send data to your backend
def send_data_to_backend(state):
    # Create the payload in JSON format with sensor_id and status
    payload = {
        "sensor_id": "Bin1",
        "status": state
    }
    
    try:
        # Send a POST request to the backend URL
        response = requests.post(backend_url, json=payload)
        
        # Check the response status
        if response.status_code == 200:
            print(f"Successfully sent {state} to backend.")
        else:
            print(f"Failed to send data. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending data: {e}")

# Print the state only when it changes
try:
    while True:
        # Read the state of GPIO 15
        current_state = GPIO.input(GPIO_PIN)

        # If state changes, send data to backend
        if current_state != previous_state:
            # Print state change for debugging
            if current_state == GPIO.HIGH:
                print("GPIO 15 is HIGH (Sending True to backend)")
                send_data_to_backend(True)  # Send 'True' to the backend
            else:
                print("GPIO 15 is LOW (Sending False to backend)")
                send_data_to_backend(False)  # Send 'False' to the backend
            
            # Update previous_state with the current state
            previous_state = current_state

        time.sleep(0.5)  # Wait for 0.5 seconds before checking again

except KeyboardInterrupt:
    print("Program interrupted by User")
    GPIO.cleanup()  # Clean up GPIO setup when the program is stopped

