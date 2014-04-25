(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "mcgame",
            "name": "Minecraft Game",
            "help": "Blocks which connect to and manipulate Minecraft Pi Edition",
            "blocks": [
                
                {
                    "blocktype": "context",
                    "id": "72725388-7c3f-49ba-9b77-f71b1d2eb3d5",
                    "sockets": [
                            {
                                "name": "Connect To Minecraft"
                            }
                        ],
                    "script": "var client = new Minecraft('localhost', 4711, function() {[[1]]});",
                    "help": "All Minecraft things in here"
                },
                {
                    "blocktype": "step",
                    "id": "9161dad6-2d90-4d70-b447-5cc61130350c",
                    "sockets": [
                        {
                            "name": "Say",
                            "type": "string",
                            "value": "hi",
                            "suffix": "in chat"
                        }
                    ],
                    "script": "client.chat({{1}});",
                    "help": "Send a message as chat"
                },
                {
                    "blocktype": "step",
                    "id": "aded8d3e-9815-41f2-8988-dec3cca30c72",
                    "sockets": [
                        {
                            "name": "Send data to chat",
                            "type": "any",
                            "value": "0"
                        }
                    ],
                    "script": "client.chat({{1}}.toString());",
                    "help": "Send data to chat (will try to convert it to text first)"
                },
                
                {
                    "blocktype": "step",
                    "id": "de9bb25d-481d-43e8-88b1-c9f56160f85e",
                    "sockets": [
                        {
                            "name": "Save Checkpoint"
                        }
                    ],
                    "script": "client.saveCheckpoint();",
                    "help": "Save Checkpoint"
                },
                
                
                {
                    "blocktype": "step",
                    "id": "e5aa0ed8-035c-4349-bfdb-405ea9e72eec",
                    "sockets": [
                        {
                            "name": "Restore Checkpoint"
                        }
                    ],
                    "script": "client.restoreCheckpoint();",
                    "help": "Restore Last Checkpoint"
                }
            ]
        }
        
    );
})(wb);