(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "control",
            "name": "Control",
            "help": "Contains control flow, variables, setters, and messaging blocks.",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "d36cd27a-98d9-4574-8e68-db267b7a2bb4",
                    "script": "[[1]]",
                    "help": "this trigger will run its scripts once when the program starts",
                    "sockets": [
                        {
                            "name": "When program runs"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "771a7f8f-ed82-4a92-b255-2f9c4b6fa614",
                    "script": "if({{1}}){[[1]]}",
                    "help": "run the following blocks only if the condition is true",
                    "sockets": [
                        {
                            "name": "If",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "9bcb76ff-0965-4bdb-9ead-fcad46bbbd1f",
                    "script": "if( ! {{1}} ){ [[1]]} }",
                    "help": "run the  blocks if the condition is not true",
                    "sockets": [
                        {
                            "name": "If not",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "7972f6ee-f653-486c-aa99-81d8930a4d35",
                    "script": "while(!({{1}})){[[1]]}",
                    "help": "repeat forever until condition is true",
                    "sockets": [
                        {
                            "name": "Repeat until",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "c671ef3f-a7d0-4921-825d-c879e70999de",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "count##",
                            "type": "number"
                        }
                    ],
                    "script": "var count##=0;(function(){setInterval(function(){count##++;[[1]]},1000/{{1}})})();",
                    "help": "this trigger will run the attached blocks periodically",
                    "sockets": [
                        {
                            "name": "Repeat",
                            "type": "number",
                            "value": "2",
                            "suffix": "times a second"
                        }
                    ]
                },
                
                
                
                {
                    "blocktype": "context",
                    "id": "89d08188-64e0-48a1-87ff-47719e35d0bb",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "count##",
                            "type": "number"
                        }
                    ],
                    "script": "var count##=0;(function(){setInterval(function(){count##++;[[1]]},1000*{{1}})})();",
                    "help": "this trigger will run the attached blocks periodically",
                    "sockets": [
                        {
                            "name": "Repeat every",
                            "type": "number",
                            "value": "10",
                            "suffix": "seconds"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1a1cee1b-fd60-4c4f-87ca-09e394fe8f67",
                    "script": "variable## = {{1}};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "script": "variable##",
                            "type": "any",
                            "sockets": [
                                {
                                    "name": "variable##"
                                }
                            ]
                        }
                    ],
                    "help": "create a reference to re-use the any",
                    "sockets": [
                        {
                            "name": "Variable",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "ece22a99-cbf3-48d8-bab8-4d93ae8a6712",
                    "script": "{{1}} = {{2}};",
                    "help": "first argument must be a variable",
                    "sockets": [
                        {
                            "name": "Set variable",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "to",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "9a148b21-c609-4f98-9ae3-19d2e4e1ddef",
                    "script": "setTimeout(function(){[[1]]},1000*{{1}});",
                    "help": "pause before running the following blocks",
                    "sockets": [
                        {
                            "name": "Wait",
                            "type": "number",
                            "value": "1",
                            "suffix": "secs"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "2adb5300-2c32-41a2-907f-4cf7ecbf7eac",
                    "script": "for(count## = 1; count## <= {{1}}; count## ++){[[1]]}",
                    "help": "repeat the contained blocks so many times",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "count##",
                            "type": "number"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Repeat",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "c457444d-c599-4241-bead-5dc9d6e649a4",
                    "script": "while({{1}}){[[1]]}",
                    "help": "repeat until the condition is false",
                    "sockets": [
                        {
                            "name": "Repeat While",
                            "type": "boolean",
                            "value": "false"
                        }
                    ]
                }
            ]
        }
    );
})(wb);