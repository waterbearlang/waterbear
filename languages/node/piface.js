//wb.choiceLists.digitalinputpins = {"0":'Pin 0',"1":'Pin 1',"2":'Pin 2',"3":'Pin 3',"4":'Pin 4',"5":'Pin 5',"6":'Pin 6',"7":'Pin 7',"8":'Pin 8',"9":'Pin 9',"10":'Pin 10',"11":'Pin 11',"12":'Pin 12','A0':'Pin A0','A1':'Pin A1','A2':'Pin A2','A3':'Pin A3','A4':'Pin A4','A5':'A5'};
wb.choiceLists.pifacein = ["0","1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7"];
wb.choiceLists.pifacebutton = [0,1 ,2 ,3];
wb.choiceLists.pifacerelays = [0,1 ];
wb.choiceLists.pifaceout = ["0", 1 ,2 ,3 ,4 ,5 ,6 ,7];
wb.choiceLists.pifaceonoff = ["0", "1"];



wb.requiredjs.before.piface = "var pfio = require('piface-node');\npfio.init();\n";
wb.requiredjs.after.piface =  "\nprocess.on('SIGINT',function(){console.log(\"Caught SIGINT\");pfio.write_output(0);pfio.deinit(); process.exit();});process.on('exit',function(){console.log(\"exit\");pfio.write_output(0);pfio.deinit();});";


/*wb.prettyScript = function(elements){
    var script = js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    script = "var pfio = require('piface-node');\npfio.init();\n"+script+"\nprocess.on('SIGINT',function(){console.log(\"Caught SIGINT\");pfio.write_output(0);pfio.deinit(); process.exit();});process.on('exit',function(){console.log(\"exit\");pfio.write_output(0);pfio.deinit();});";
    return script;
};*/