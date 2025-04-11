#include <Arduino.h>
#include <NewPing.h>
#include <Servo.h>
//Pin definitions
#define TRIGGER_PIN_O  8  
#define ECHO_PIN_O     7 
#define TRIGGER_PIN_R  2  
#define ECHO_PIN_R     4  
#define MAX_DISTANCE 200 // Maximum distance to measure (in cm)

Servo myServo1;
Servo myServo2;
Servo myServo3;
const int irPin = 9;  // IR module OUT pin
int irState = 0;

const int inputPin1 = 12;  
const int inputPin2 = 13;  

const int outputPin1 = 14; 
const int outputPin2 = 15;
const int outputPin3 = 16;

NewPing sonar_R(TRIGGER_PIN_R, ECHO_PIN_R, MAX_DISTANCE);
NewPing sonar_O(TRIGGER_PIN_O, ECHO_PIN_O, MAX_DISTANCE);

void setup() {
  pinMode(irPin, INPUT);
  Serial.begin(9600);
  myServo1.attach(3); 
  myServo2.attach(5);
  myServo3.attach(6);

  myServo1.write(90);
  myServo2.write(90);
  myServo3.write(90);
}

void loop() {
  irState = digitalRead(irPin);
  int inputState1 = digitalRead(inputPin1);
  int inputState2 = digitalRead(inputPin2);

  if (irState == LOW) {
    // IR beam is reflected (obstacle detected)
    Serial.println("Object Detected");
    myServo3.write(0);
    digitalWrite(outputPin1, LOW);
  } else if (irState == HIGH) {
    // No reflection (no object)
    Serial.println("No Object");
    myServo3.write(90);
    digitalWrite(outputPin1, HIGH);
  }

  unsigned int distance_R = sonar_R.ping_cm();  // Measure distance in centimeters
  unsigned int distance_O = sonar_O.ping_cm();  // Measure distance in centimeters
 
  if (distance_R > 6) {
    Serial.print("Distance_R: ");
    Serial.print(distance_R);
    Serial.print(" cm   ||  ");
    digitalWrite(outputPin2, HIGH);
  } else if(distance_R < 6) {
    Serial.print("Out of range  ||  ");
    digitalWrite(outputPin2, LOW);
  }
  if (distance_O > 6) {
    Serial.print("Distance_O: ");
    Serial.print(distance_O);
    Serial.println(" cm   ||  ");
    digitalWrite(outputPin2, HIGH);
  } else if(distance_O < 6) {
    digitalWrite(outputPin2, LOW);
  }

  if (inputState1 == LOW) {
    myServo1.write(0); 
  } else(inputState1 == HIGH) {
    myServo1.write(90); 
  }

  if (inputState2 == LOW) {
    myServo2.write(0); 
  } else(inputState2 == HIGH) {
    myServo2.write(90); 
  }

  delay(200); // delay for readability
}
