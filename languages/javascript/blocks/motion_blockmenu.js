(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "motion",
            "name": "Motion",
            "help": "Motion blocks are for detecting the motion of devices equipped with accelerometers",
            "blocks": [
                {
                	"blocktype": "expression",
                	"id": "f1a792df-9508-4ad5-90f8-aa9cd60d46bc",
                	"type": "string",
                	"script": "runtime.accelerometer.direction",
                	"help": "which way is the device moving?",
                	"sockets": [
                		{
                			"name": "tilt direction"
                		}
                	]
                },
                {
                	"blocktype": "eventhandler",
                	"id": "74f8f7c0-f2f9-4ea4-9888-49110785b26d",
                	"script": "runtime.accelerometer.whenTurned({{1}}, function(){[[1]]});",
                	"help": "handler for accelerometer events",
                	"sockets": [
                		{
                			"name": "when device turned",
                			"type": "string",
                			"options": "directions"
                		}
                	]
                }
            ]
        }
        
        
    );
})(wb);