(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "mccamera",
            "name": "Minecraft Camera",
            "help": "Manipulating the Minecraft Camera",
            "blocks": [
              
              
                {
                    "blocktype": "step",
                    "id": "87a5c7ab-8381-4e9b-8038-fbb6e9b787a4",
                    "sockets": [
                        {
                            "name": "set camera mode to",
                            "type": "string",
                            "options": "cameramode",
                            "value": ""
                        }
                        
                    ],
                    "script": "client.setCameraMode({{1}});",
                    "help": "set camera mode"
                },
                {
                    "blocktype": "step",
                    "id": "aa7f5980-fe60-41cc-94e0-094eb7df7043",
                    "sockets": [
                        {
                            "name": "set camera position to",
                            "type": "position"
                        }
                    ],
                    "script": "client.setCameraPosition({{1}}.x, {{1}}.y, {{1}}.z);",
                    "help": "set camera position to a position"
                }
            ]
        }
        
    );
})(wb);