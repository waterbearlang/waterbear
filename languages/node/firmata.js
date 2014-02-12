//arduino firmata  https://npmjs.org/search?q=firmata


//wb.choiceLists.digitalinputpins = {"0":'Pin 0',"1":'Pin 1',"2":'Pin 2',"3":'Pin 3',"4":'Pin 4',"5":'Pin 5',"6":'Pin 6',"7":'Pin 7',"8":'Pin 8',"9":'Pin 9',"10":'Pin 10',"11":'Pin 11',"12":'Pin 12','A0':'Pin A0','A1':'Pin A1','A2':'Pin A2','A3':'Pin A3','A4':'Pin A4','A5':'A5'};
wb.choiceLists.firmatain = ["0","1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7"];
wb.choiceLists.firmatabutton = [0,1 ,2 ,3];
wb.choiceLists.firmatarelays = [0,1 ];
wb.choiceLists.firmataout = ["0", 1 ,2 ,3 ,4 ,5 ,6 ,7];
wb.choiceLists.firmataonoff = ["0", "1"];

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
