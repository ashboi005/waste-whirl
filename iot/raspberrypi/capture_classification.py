import numpy as np
from tflite_runtime.interpreter import Interpreter
from PIL import Image
import io
from picamera import PiCamera
from time import sleep

# Initialize the camera
camera = PiCamera()
camera.resolution = (640, 480)

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
    camera.start_preview()
    sleep(2)  # Let the camera warm up
    camera.capture('waste.jpg')
    camera.stop_preview()
    print("Image captured and saved as waste.jpg")

    # Process the captured image
    image = Image.open('waste.jpg')

    # Run prediction on the captured image
    prediction, probability = predict(image)

    # Classify the waste
    category = "Organic Waste" if prediction == 0 else "Recycle Waste"
    print(f"Prediction: {category} with a probability of {probability:.2f}")

if __name__ == "__main__":
    capture_image()

