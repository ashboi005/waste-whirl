import RPi.GPIO as GPIO
import time
import requests
from mfrc522 import SimpleMFRC522

# Define your backend URL where the data should be sent
backend_url = "https://jrwbl2n7-8000.inc1.devtunnels.ms/sensors/rfid"  # Replace with your URL

# Function to send data to your backend
def send_data_to_backend(rfid_data):
    # Create the payload in JSON format with sensor_id and RFID
    payload = {
        "sensor_id": "Bin1",  # Replace with your sensor ID
        "rfid": rfid_data
    }

    try:
        # Send a POST request to the backend URL
        response = requests.post(backend_url, json=payload)

        # Check the response status
        if response.status_code == 200:
            print(f"Successfully sent RFID {rfid_data} to backend.")
        else:
            print(f"Failed to send RFID data. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending data: {e}")

# Initialize the RFID reader
reader = SimpleMFRC522()

# Initialize last RFID to None
last_rfid = None

try:
    print("Scan your RFID tag")
    while True:
        # Scan RFID tag
        id, text = reader.read()

        # Print the UID and associated text (if any)
        print(f"RFID UID: {id}")
        print(f"Text: {text}")

        # Send the scanned RFID UID to the backend only if it's a new tag
        if id != last_rfid:
            send_data_to_backend(str(id))  # Send the new RFID UID to the backend
            last_rfid = id  # Update last RFID with the current one

        time.sleep(1)  # Wait 1 second before scanning again

except KeyboardInterrupt:
    print("Program interrupted by User")
    GPIO.cleanup()  # Clean up GPIO setup when the program is stopped

