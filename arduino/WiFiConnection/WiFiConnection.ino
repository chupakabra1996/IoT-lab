#include <LiquidCrystal.h>
#include <SPI.h>
#include <WiFi.h>

LiquidCrystal lcd(4, 5, 10, 11, 12, 13);
WiFiClient client;

//connection params
unsigned long lastConnection = 0UL; //ms
const unsigned long requestInterval = (10L * 1000L); //10_000 ms or 10 seconds


const IPAddress server (192, 168, 1, 33); //PC's private ip address
const char ssid[] = "Keenetic-3543";
const char pass[] = "qazwsx1234";
const int port = 3000;

int wiFiStatus = WL_IDLE_STATUS;

void setup()
{
  Serial.begin(19200);
  setupLcd();
  setupWiFi();
}


void loop()
{

  readResponse();

  if (millis() - lastConnection > requestInterval) 
  {
    doRequest();  
  }
}

void doRequest()
{
  client.stop();

  if (client.connect(server, port))
  {
    Serial.println("Connected to server");
    client.println("GET /data HTTP/1.1");
    client.println("Connection : close");
    client.println();

    lastConnection = millis();
  } else {
    Serial.println("Connection failed");
  }
}

void readResponse() 
{
  while(client.available())
  {
    char ch = client.read();
    Serial.write(ch);
  }  
}

void setupLcd()
{
  lcd.begin(16, 2);
  lcd.print("Display is on");
  lcd.setCursor(0, 1);
  lcd.print("Good day!");
}

void setupWiFi()
{
  if (WiFi.status() == WL_NO_SHIELD)
  {
    Serial.println("WiFi shield not present");
    while(true);
  }

  while (wiFiStatus != WL_CONNECTED)
  {
    Serial.println("Attempting to connect to wi-fi");
    wiFiStatus = WiFi.begin(ssid, pass);
    delay(7000);
  }

  Serial.println("Connected to wi-fi");
}
