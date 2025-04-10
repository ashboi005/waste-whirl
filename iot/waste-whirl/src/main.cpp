#include <Arduino.h>
#include <NewPing.h>

// Pin definitions
#define TRIGGER_PIN  2  // Trigger pin connected to digital pin D2
#define ECHO_PIN     3  // Echo pin connected to digital pin D3
#define MAX_DISTANCE 200 // Maximum distance to measure (in cm)

// Create NewPing object
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

void setup() {
  // Start serial communication
  Serial.begin(9600);
  delay(200); // Wait for the sensor to stabilize
}

void loop() {
  // Get the distance from the ultrasonic sensor
  unsigned int distance = sonar.ping_cm();  // Measure distance in centimeters

  // If distance is valid (greater than 0), print it
  if (distance > 0) {
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");
  } else {
    Serial.println("Out of range");
  }

  // Wait for 1 second before taking another reading
  delay(500);
}
