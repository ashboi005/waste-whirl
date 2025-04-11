import numpy as np
from tflite_runtime.interpreter import Interpreter
from PIL import Image
import io
from picamera import PiCamera
from time import sleep
import RPi.GPIO as GPIO 
import time
import requests
from mfrc522 import SimpleMFRC522

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

PIN_14 = 14
PIN_15 = 15

GPIO.setup(PIN_14, GPIO.IN)
GPIO.setup(PIN_15, GPIO.IN)

backend_url = "https://pleasant-mullet-unified.ngrok-free.app/sensors/update-status"  # Replace with your URL

previous_state_bin = None

previous_state_classification = None


# Initialize the camera (open once)
camera = PiCamera()
camera.resolution = (640, 480)
camera.start_preview()  # Start preview once

# Load the TFLite model
interpreter = Interpreter(model_path="waste_classification_model_quantized.tflite")
interpreter.allocate_tensors()

# Get input and output tensors
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Function to predict the waste category
def predict(image: np.ndarray):
    # Resize and normalize the image to match the input tensor shape
    image = image.resize((180, 180))
    image = np.array(image, dtype=np.float32) / 255.0
    image = np.expand_dims(image, axis=0)

    # Set input tensor and run inference
    interpreter.set_tensor(input_details[0]['index'], image)
    interpreter.invoke()

    # Get the result from the output tensor
    output_data = interpreter.get_tensor(output_details[0]['index'])

    # Get the predicted class and probability
    prediction = np.argmax(output_data)
    probability =float(np.max(output_data))

    return prediction, probability

# Capture image from the camera
def capture_image():
    # Only capture image once, no preview restart
    sleep(2)  # Let the camera warm up
    camera.capture('waste.jpg')
    print("Image captured and saved as waste.jpg")

    # Process the captured image
    image = Image.open('waste.jpg')

    # Run prediction on the captured image
    prediction, probability = predict(image)

    # Classify the waste
    category = "Organic Waste" if prediction == 0 else "Recycle Waste"
    print(f"Prediction: {category} with a probability of {probability:.2f}")

def send_data_to_backend(state):
    # Create the payload in JSON format with sensor_id and status
    payload = {
        "status": state,
        "sensor_id": "Bin1"
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


if __name__ == "__main__":
    try:
        while True:
            print("Reading GPIO pins 14 and 15. Press Ctrl+C to stop.")

            state_14 = GPIO.input(PIN_14)
            state_15 = GPIO.input(PIN_15)
            
            current_state_Bin = state_15
            current_state_classification = state_14
            
            print(f"GPIO 14: {'HIGH' if state_14 else 'LOW'} | GPIO 15: {'HIGH' if state_15 else 'LOW'}")
            
            if (current_state_classification == GPIO.HIGH and previous_state_classification == GPIO.LOW):
                capture_image()

            if (current_state_Bin != previous_state_bin):
                # Print state change for debugging
                if (current_state_Bin == GPIO.HIGH):
                    print("GPIO 15 is HIGH (Sending True to backend)")
                    send_data_to_backend(True)  # Send 'True' to the backend
                else:
                    print("GPIO 15 is LOW (Sending False to backend)")
                    send_data_to_backend(False)  # Send 'False' to the backend
               
                # Update previous_state with the current state
                previous_state_bin = current_state_Bin

                previous_state_classification = current_state_classification
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\nStopped by user.")
    finally:
        GPIO.cleanup()
        camera.stop_preview()  # Stop preview properly to avoid heat up
        camera.close()  # Close the camera to release resources
        print("Camera and GPIO cleaned up.")
 