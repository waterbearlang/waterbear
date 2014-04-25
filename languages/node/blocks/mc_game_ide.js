   

wb.requiredjs.before.mcgame = "var Minecraft = require('minecraft-pi-vec3');\nvar v= require('vec3');";

wb.requiredjs.after.mcgame =  "\nprocess.on('exit',function(){console.log(\"Caught exit\");client.end();});";


// TODO : fix blocktypes to number or text not both
// TODO : find direction code and loops
// TODO : find distance code
// TODO : write in area detect
// TODO : research the eventsBlockHits
