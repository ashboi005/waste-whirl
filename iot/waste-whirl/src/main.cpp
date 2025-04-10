#include <Arduino.h>
#include <NewPing.h>

// Pin definitions
#define TRIGGER_PIN_LID 12  // Trigger pin connected to digital pin D2
#define ECHO_PIN_LID    13  // Echo pin connected to digital pin D3
#define TRIGGER_PIN_O  7  // Trigger pin connected to digital pin D2
#define ECHO_PIN_O     8  // Echo pin connected to digital pin D3
#define TRIGGER_PIN_R  2  // Trigger pin connected to digital pin D2
#define ECHO_PIN_R     4  // Echo pin connected to digital pin D3
#define MAX_DISTANCE 200 // Maximum distance to measure (in cm)

// Create NewPing object
NewPing sonar_R(TRIGGER_PIN_R, ECHO_PIN_R, MAX_DISTANCE);
NewPing sonar_O(TRIGGER_PIN_O, ECHO_PIN_O, MAX_DISTANCE);
NewPing sonar_LID(TRIGGER_PIN_LID, ECHO_PIN_LID, MAX_DISTANCE);

void setup() {
  // Start serial communication
  Serial.begin(9600);
  delay(200); // Wait for the sensor to stabilize
}

void loop() {
  // Get the distance from the ultrasonic sensor
  unsigned int distance_R = sonar_R.ping_cm();  // Measure distance in centimeters
  unsigned int distance_O = sonar_O.ping_cm();  // Measure distance in centimeters
  unsigned int distance_LID = sonar_LID.ping_cm();  // Measure distance in centimeters
  // If distance is valid (greater than 0), print it
  if (distance_R > 0) {
    Serial.print("Distance_R: ");
    Serial.print(distance_R);
    Serial.print(" cm   ||  ");
  } else {
    Serial.print("Out of range  ||  ");
  }
  if (distance_O > 0) {
    Serial.print("Distance_O: ");
    Serial.print(distance_O);
    Serial.print(" cm   ||  ");
  } else {
    Serial.print("Out of range  ||  ");
  }
  if (distance_LID > 0) {
    Serial.print("Distance_LID: ");
    Serial.print(distance_LID);
    Serial.println(" cm");
  } else {
    Serial.println("Out of range");
  }


  // Wait for 1 second before taking another reading
  delay(500);
}
