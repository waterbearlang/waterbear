wb.choiceLists.pifacein = {0:'Pin 0', 1:'Pin 1', 2:'Pin 2', 3:'Pin 3', 4:'Pin 4', 5:'Pin 5', 6:'Pin 6', 7:'Pin 7'};
//wb.choiceLists.pifacein = [0, 1, 2, 3, 4, 5, 6, 7];
wb.choiceLists.pifacebutton = [0, 1, 2, 3];
wb.choiceLists.pifacerelays = [0, 1];
wb.choiceLists.pifaceout = [0, 1, 2, 3, 4, 5, 6, 7];
wb.choiceLists.pifaceonoff = [0, 1];



wb.requiredjs.before.piface = "var pfio = require('piface-node');\npfio.init();\n";
wb.requiredjs.after.piface =  "\nprocess.on('exit',function(){console.log(\"exit\");pfio.write_output(0);pfio.deinit();});";
