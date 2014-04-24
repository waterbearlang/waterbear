(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "controls",
            "name": "Controls",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "25339ea4-1bc2-4c66-bde8-c455b9a3d1cd",
                    "script": "void setup()\n{\n[[1]]\n}\n",
                    "help": "Start scripts when program starts",
                    "sockets": [
                        {
                            "name": "Setup - When program starts"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "fb958a3d-0372-4ab7-95c1-70dd9c454d19",
                    "script": "void loop()\n{\n[[1]]\n}\n",
                    "help": "Trigger for main loop",
                    "sockets": [
                        {
                            "name": "Main loop"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1e4b61cf-c4ce-4b08-9944-7ea1ebf54775",
                    "script": "/*Global Settings*/\n\n[[1]]\n\n",
                    "help": "Trigger for blocks in global setup",
                    "sockets": [
                        {
                            "name": "Global Settings"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b54a3daa-3dfa-4885-afc4-9592944296df",
                    "script": "{{1}}();",
                    "help": "Send a message to all listeners",
                    "sockets": [
                        {
                            "name": "broadcast",
                            "type": "string",
                            "value": "ack"
                        },
                        {
                            "name": "message"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "64fd2a90-a689-4ffd-bd66-bc8c61775cd4",
                    "script": "function {{1}}(){\n[[next]]\n}",
                    "help": "Trigger for blocks to run when message is received",
                    "sockets": [
                        {
                            "name": "when I receive",
                            "type": "string",
                            "value": "ack"
                        },
                        {
                            "name": "message"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "c79f205e-eab3-4ebd-9c72-2e6a54209593",
                    "script": "while({{1}}){\n[[1]]\n}",
                    "help": "loop until condition fails",
                    "sockets": [
                        {
                            "name": "forever if",
                            "type": "boolean",
                            "value": "false"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "0a313a7a-1187-4619-9819-fbfd7a32f6a6",
                    "script": "if({{1}}){\n[[1]]\n}",
                    "help": "only run blocks if condition is true",
                    "sockets": [
                        {
                            "name": "if",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "dc724c8c-27b3-4c93-9420-050dd2466c43",
                    "script": "if(! {{1}} ){\n[[1]]\n}",
                    "help": "run blocks if condition is not true",
                    "sockets": [
                        {
                            "name": "if not",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "a11f426a-9a48-4e0f-83f5-cff4ec5b4154",
                    "script": "while(!({{1}})){\n[[1]]\n}",
                    "help": "loop until condition is true",
                    "sockets": [
                        {
                            "name": "repeat until",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);