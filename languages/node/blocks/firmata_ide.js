//arduino firmata  https://npmjs.org/search?q=firmata


wb.choiceLists.highlow = ['HIGH', 'LOW'];
wb.choiceLists.inoutput= ['INPUT', 'OUTPUT'];
wb.choiceLists.onoff = ['ON', 'OFF'];
wb.choiceLists.logic = ['true', 'false'];
wb.choiceLists.digitalpins = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,'A0','A1','A2','A3','A4','A5'];
wb.choiceLists.analoginpins = ['A0','A1','A2','A3','A4','A5'];
wb.choiceLists.pwmpins = [3, 5, 6, 9, 10, 11];
wb.choiceLists.baud = [9600, 300, 1200, 2400, 4800, 14400, 19200, 28800, 38400, 57600, 115200];
wb.choiceLists.analogrefs = ['DEFAULT', 'INTERNAL', 'INTERNAL1V1', 'INTERNAL2V56', 'EXTERNAL'];

wb.requiredjs.before.firmata = "var ArduinoFirmata = require('arduino-firmata');var arduino = new ArduinoFirmata();";
wb.requiredjs.after.firmata =  "";
