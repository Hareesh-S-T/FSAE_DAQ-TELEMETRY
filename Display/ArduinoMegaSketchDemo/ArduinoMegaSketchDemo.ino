const int gearPins[] = {2, 3, 4, 5, 6, 7};
#define coolantPin A0
#define fuelPin A1

int coolantTemp = 0;
int fuelLevel = 0;

void setup() {
  Serial1.begin(9600);
  Serial.begin(9600);
  for (int i = 0; i < 6; i++) {
    pinMode(gearPins[i], INPUT_PULLUP);
  }
}

void loop() {
  coolantTemp = 24.94 + 0.01287 * analogRead(coolantPin) + 0.0001056 * analogRead(coolantPin) * analogRead(coolantPin);

  Serial1.print("coolantTemp.val=");
  Serial1.print(coolantTemp);
  Serial1.write(0xff);
  Serial1.write(0xff);
  Serial1.write(0xff);

  fuelLevel = 1.96 * analogRead(fuelPin) - 10.72;

  Serial1.print("fuelLevel.val=");
  Serial1.print(fuelLevel);
  Serial1.write(0xff);
  Serial1.write(0xff);
  Serial1.write(0xff);

  String gear = readGear();
  Serial1.print("gear.txt=");
  Serial1.print("\"");
  Serial1.print(gear);
  Serial.print(gear);
  Serial1.print("\"");
  Serial1.write(0xff);
  Serial1.write(0xff);
  Serial1.write(0xff);

}

String readGear() {
  String res;
  for (int i = 0; i < 6; i++) {
    if (digitalRead(gearPins[i]) == LOW) {
      res = String(i+1);
          return res;
    }
  }
  return "N";
}
