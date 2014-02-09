   

wb.requiredjs.before.minecraftgame = "var Minecraft = require('./minecraft-pi/lib/minecraft.js');\nrequire('./waterbear/dist/minecraftjs_runtime.js');";

wb.requiredjs.after.minecraftgame =  "\nprocess.on('SIGINT',function(){console.log(\"Caught SIGINT\");client.end(); process.exit();});process.on('exit',function(){console.log(\"Caught exit\");client.end();});";

