#!/usr/bin/env python3
import serial
import time

# UART Configuration
UART_PORT = '/dev/serial0'  # GPIO serial
BAUD_RATE = 9600

def main():
    try:
        # Initialize UART
        uart = serial.Serial(
            port=UART_PORT,
            baudrate=BAUD_RATE,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=1
        )
        
        print(f"Listening on UART {UART_PORT} at {BAUD_RATE} baud...")
        print("Press Ctrl+C to exit")
        
        while True:
            if uart.in_waiting > 0:
                data = uart.readline().decode('utf-8').strip()
                if data:  # Only print non-empty lines
                    print(f"Received: {data}")
            time.sleep(0.01)  # Small delay to reduce CPU usage
    
    except serial.SerialException as e:
        print(f"UART error: {e}")
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        if 'uart' in locals() and uart.is_open:
            uart.close()
            print("UART connection closed")

if __name__ == "__main__":
    main()
