from picamera import PiCamera
from time import sleep

camera = PiCamera()
camera.resolution = (640, 480)

camera.start_preview()
sleep(2)  # let camera warm up
camera.capture('waste.jpg')
camera.stop_preview()

print("Image captured and saved as waste.jpg")
