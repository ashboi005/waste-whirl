from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
from tflite_runtime.interpreter import Interpreter
from PIL import Image
import io

app = FastAPI()

# Load the TFLite model
interpreter = Interpreter(model_path="waste_classification_model_quantized.tflite")
interpreter.allocate_tensors()

# Get input and output tensors
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Prediction function
def predict(image: np.ndarray):
    # Resize and normalize the image to match the input tensor shape
    image = image.resize((180,180))
    image = np.array(image, dtype=np.float32) / 255.0
    image = np.expand_dims(image, axis=0)


    # Set input tensor and run inference
    interpreter.set_tensor(input_details[0]['index'], image)
    interpreter.invoke()

    # Get the result from the output tensor
    output_data = interpreter.get_tensor(output_details[0]['index'])

    # Get the predicted class and probability
    prediction = np.argmax(output_data)
    probability = np.max(output_data)
    
    return prediction, probability

@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Read the uploaded image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # Run prediction
        prediction, probability = predict(image)

        # Return the prediction result
        category = "Organic Waste" if prediction == 0 else "Recycle Waste"
        return JSONResponse(content={
            "category": category,
            "probability": float(probability)
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("SmartBinBackend:app", host="0.0.0.0", port=8000, reload=True)

