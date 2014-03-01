   

wb.requiredjs.before.minecraftgame = "var Minecraft = require('./minecraft-pi/lib/minecraft.js');\nvar v= require('vec3');";

wb.requiredjs.after.minecraftgame =  "\nprocess.on('SIGINT',function(){console.log(\"Caught SIGINT\");client.end(); process.exit();});process.on('exit',function(){console.log(\"Caught exit\");client.end();});";


// TODO : fix blocktypes to number or text not both
// TODO : find direction code and loops
// TODO : find distance code
// TODO : write in area detect
// TODO : research the eventsBlockHits
