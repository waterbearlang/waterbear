(function(wb){
'use strict';
    wb.menu(
        Use http://nodejs.org/api/events.html 
        
        
        
        {
                    "blocktype": "step",
                    "id": "b7079d91-f76d-41cc-a6aa-43fc2749429c",
                    "script": "global.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}));",
                    "help": "send this message to any listeners",
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
                    "blocktype": "step",
                    "id": "d175bd7d-c7fd-4465-8b1f-c82687f35577",
                    "script": "global.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}, {detail: {{2}}}));",
                    "help": "send this message with an object argument to any listeners",
                    "sockets": [
                        {
                            "name": "broadcast",
                            "type": "string",
                            "value": "ping"
                        },
                        {
                            "name": "message with data",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "3931a20c-f510-45e4-83d2-4005983d5cae",
                    "script": "global.stage.addEventListener(\"wb_\" + {{1}}, function(){[[1]]});",
                    "help": "add a listener for the given message, run these blocks when it is received",
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
                    "blocktype": "eventhandler",
                    "id": "a0496339-c405-4d1c-8185-9bc211bf5a56",
                    "script": "global.stage.addEventListener(\"wb_\" + {{1}}, function(event){local.data##=event.detail;[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "data##"
                                }
                            ],
                            "script": "local.data##",
                            "type": "any"
                        }
                    ],
                    "help": "add a listener for the given message which receives data, run these blocks when it is received",
                    "sockets": [
                        {
                            "name": "when I receive",
                            "type": "string",
                            "value": "ping"
                        },
                        {
                            "name": "message with data"
                        }
                    ]
                },
                
        
    );
})(wb);