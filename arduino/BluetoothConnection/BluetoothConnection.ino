#include <SoftwareSerial.h>

const byte RxD = 6;
const byte TxD = 7;

#define DEBUG_ENABLED 1

SoftwareSerial bluetoothSerial(RxD, TxD);



void setup()
{
  Serial.begin(19200);
  setupBluetooth();
}



void loop()
{
  sendData();

  readData();
}

void readData()
{
  while(bluetoothSerial.available())
  {
    char ch = bluetoothSerial.read();
    Serial.write(ch);
  }
}

void sendData()
{
  while(Serial.available())
  {
    char ch = Serial.read();
    if (ch == '!')
    {
      //stop sending data
      bluetoothSerial.write('\n');
      Serial.flush();
      return;
    }
    bluetoothSerial.write(ch);
  }
}


void setupBluetooth()
{
  pinMode(RxD, INPUT);
  pinMode(TxD, OUTPUT);

  bluetoothSerial.begin(38400);
  bluetoothSerial.print("\r\n+STWMOD=0\r\n"); //slave mode
  bluetoothSerial.print("\r\n+STNA=Arduino-Uno\r\n"); //BT name
  bluetoothSerial.print("\r\n+STOAUT=1\r\n"); //permit paired device to connect
  bluetoothSerial.print("\r\n+STAUTO=0\r\n"); //auto-connection false
  delay(2000);
  bluetoothSerial.print("\r\n+INQ=1\r\n"); //make it inquirable
  Serial.println("The BT is inquirable");
  delay(2000);
  bluetoothSerial.flush();
}

