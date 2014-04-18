(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "structure",
            "name": "Structure",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "1cf8132a-4996-45db-b482-4e3302003c1",
                    "script": "void setup(){[[1]]}",
                    "help": "Setup the Processing Canvas",
                    "sockets": [
                        {
                            "name": "setup"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1cf8132a-4996-45db-b482-4336198e3ca",
                    "script": "void draw(){[[1]]}",
                    "help": "Main draw loop",
                    "sockets": [
                        {
                            "name": "draw"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "71eb3271-6dc0-4a82-81cc-4c50d2ac19e7",
                    "script": "size({{1}}, {{2}});",
                    "help": "Set canvas size",
                    "sockets": [
                        {
                            "name": "size X",
                            "type": "number",
                            "value": "800"
                        },
                        {
                            "name": "Y",
                            "type": "number",
                            "value": "500"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "06723171-6d20-4a32-814c-2c50d8wcb9e7",
                    "script": "noLoop();",
                    "help": "Stops Processing from continuously executing the code within draw()",
                    "sockets": [
                        {
                            "name": "noLoop"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "06723171-6d20-4a32-814c-225038w4b9e7",
                    "script": "loop();",
                    "help": "Causes Processing to continuously execute the code within draw()",
                    "sockets": [
                        {
                            "name": "loop"
                        }
                    ]
                }
            ]
        }
        
        
    );
})(wb);