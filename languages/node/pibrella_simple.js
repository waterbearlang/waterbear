
//PiBrella 
/*
gpio export 27 out
gpio export 17 out
gpio export 4 out
gpio export 22 out
gpio export 23 out
gpio export 24 out
gpio export 25 out
gpio export 18 out

gpio export 11 in
gpio export 9 in
gpio export 7 in
gpio export 8 in
gpio export 10 in

gpio -g mode 11 down
gpio -g mode 9 down
gpio -g mode 7 down
gpio -g mode 8 down
gpio -g mode 10 down

*/


wb.choiceLists.pibrellaoutnames = {"Red_LED":"Red LED", "Amber_LED":"Amber LED", "Green_LED":"Green LED", "Output_E":"Output E", "Output_F":"Output F", "Output_G":"Output G", "Output_H":"Output H"};
wb.choiceLists.pibrellaout = {27:"Red LED", 17:"Amber LED", 4:"Green LED", 22:"Output E", 23:"Output F", 24:"Output G", 25:"Output H", 18: "Buzzer"};

wb.choiceLists.pibrellainnames = {"Red_Button":"Red Button", "Input_A":"Input A", "Input_B":"Input B", "Input_C":"Input C", "Input_D":"Input D"};
wb.choiceLists.pibrellain = {11:"Red Button", 9:"Input A", 7:"Input B", 8:"Input C", 10:"Input D"};


wb.choiceLists.pibrellaedge = {'both': 'Change', 'rising':'Turn On', 'falling':'Turn Off'};

//PB_PIN_BUZZER = 18

wb.requiredjs.before.pibrella = 'var Gpio = require("onoff").Gpio;\n var PiBrella_output = {"Red_LED":new Gpio(27, "out"), "Amber_LED":new Gpio(17, "out"), "Green_LED":new Gpio(4, "out"), "Output_E":new Gpio(22, "out"), "Output_F":new Gpio(23, "out"), "Output_G":new Gpio(24, "out"), "Output_H":new Gpio(25, "out")};var PiBrella_input = {"Red_Button":new Gpio(11, "in"), "Input_A":new Gpio(9, "in"), "Input_B":new Gpio(7, "in"), "Input_C":new Gpio(8, "in"), "Input_D":new Gpio(10, "in")};';
wb.requiredjs.after.pibrella =  "";


/*Run the following commands to export GPIO #17 and #18:

gpio export 17 out
gpio export 18 in

Step 2 - Run the application

Now the application can be executed without superuser privileges. Note that unlike the initial led/button example, the applications exit function does not attempt to unexport the GPIOs when it terminates.

var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    process.exit();
}

process.on('SIGINT', exit);

Step 3 - Unxport GPIOs with gpio

After the application has terminated, run the following commands to unexport GPIO #17 and #18:

gpio unexport 17
gpio unexport 18

*/
