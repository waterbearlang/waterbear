(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "controls",
            "name": "Controls",
            "help": "Contains control flow, variables, setters, and messaging blocks.",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "1cf8132a-4996-47db-b482-4e336200e3ca",
                    "script": [
                        "(function(){",
                        "    [[1]]",
                        "})();"
                    ],
                    "help": "this trigger will run its scripts once when the program starts",
                    "sockets": [
                        {
                            "name": "when program runs"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "f4a604cd-f0b5-4133-9f91-4e1abe48fb6a",
                    "script": "document.addEventListener('keydown', function(event){ if (runtime.keyForEvent(event) === {{1}}){[[1]];}});",
                    "help": "this trigger will run the attached blocks every time this key is pressed",
                    "sockets": [
                        {
                            "name": "when",
                            "type": "string",
                            "options": "keys",
                            "value": "a",
                            "suffix": "key pressed"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "f13fcf60-a7e4-4672-9ff8-06197a65af94",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "event##"
                                }
                            ],
                            "script": "local.event##",
                            "type": "object"
                        }
                    ],
                    "script": "document.addEventListener({{1}}, function(event){local.event##=event;[[1]]; });",
                    "help": "this trigger will run the attached blocks every time the chosen mouse event happens",
                    "sockets": [
                        {
                            "name": "when",
                            "type": "string",
                            "options": "pointerEvents",
                            "value": ""
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "cfea9087-3d7c-46ad-aa41-579bba2f4709",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "local.count##",
                            "type": "number"
                        }
                    ],
                    "script": "(function(){local.count##=0;requestAnimationFrame(function eachFrame(){local.count##++;[[1]];requestAnimationFrame(eachFrame);})})();",
                    "help": "this trigger will run the attached blocks periodically",
                    "sockets": [
                        {
                            "name": "each frame"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "47AA31E2-5A90-4AF1-8F98-5FDD437561B6",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "local.count##",
                            "type": "number"
                        }
                    ],
                    "script": "(function(){local.count##=0;local.timerid##=setInterval(function(){local.count##++;if({{2}}){clearInterval(local.timerid##);return;}[[1]]},1000/{{1}});})();",
                    "help": "this trigger will run the attached blocks periodically",
                    "sockets": [
                        {
                            "name": "repeat",
                            "type": "number",
                            "value": 30,
                            "min": 0
                        },
                        {
                            "name": "times a second until",
                            "type": "boolean",
                            "value": true
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "079b2b89-41c2-4d00-8e21-bcb86574bf80",
                    "script": "local.variable## = {{1}};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "script": "local.variable##",
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
                            "name": "variable variable##",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b4036693-8645-4852-a4de-9e96565f9aec",
                    "script": "{{1}} = {{2}};",
                    "help": "first argument must be a variable",
                    "sockets": [
                        {
                            "name": "set variable",
                            "type": "any"
                        },
                        {
                            "name": "to",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9AED48C9-A90B-49FB-9C1A-FD632F0388F5",
                    "script": "{{1}} += {{2}};",
                    "help": "first argument must be a variable",
                    "sockets": [
                        {
                            "name": "increment variable",
                            "type": "any"
                        },
                        {
                            "name": "by",
                            "type": "any",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "66b33236-c9ce-4b6c-9b69-e8c4fdadbf52",
                    "script": "setTimeout(function(){[[1]]},1000*{{1}});",
                    "help": "pause before running the following blocks",
                    "sockets": [
                        {
                            "name": "schedule in",
                            "type": "number",
                            "value": 1,
                            "min": 0
                        },
                        {
                            "name": "secs"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "aa146082-9a9c-4ae7-a409-a89e84dc113a",
                    "script": "range({{1}}).forEach(function(idx, item){local.count## = idx;[[1]]});",
                    "help": "repeat the contained blocks so many times",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "local.count##",
                            "type": "number"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "repeat",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b7079d91-f76d-41cc-a6aa-43fc2749429c",
                    "script": "runtime.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}));",
                    "help": "send this message to any listeners",
                    "sockets": [
                        {
                            "name": "broadcast",
                            "type": "string",
                            "value": "ack",
                            "suffix": "message"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d175bd7d-c7fd-4465-8b1f-c82687f35577",
                    "script": "runtime.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}, {detail: {{2}}}));",
                    "help": "send this message with an object argument to any listeners",
                    "sockets": [
                        {
                            "name": "broadcast",
                            "type": "string",
                            "value": "ping"
                        },
                        {
                            "name": "message with data",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "3931a20c-f510-45e4-83d2-4005983d5cae",
                    "script": "runtime.stage.addEventListener(\"wb_\" + {{1}}, function(){[[1]]});",
                    "help": "add a listener for the given message, run these blocks when it is received",
                    "sockets": [
                        {
                            "name": "when I receive",
                            "type": "string",
                            "value": "ack",
                            "suffix": "message"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "a0496339-c405-4d1c-8185-9bc211bf5a56",
                    "script": "runtime.stage.addEventListener(\"wb_\" + {{1}}, function(event){local.data##=event.detail;[[1]]});",
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
                            "value": "ping",
                            "suffix": "message with data"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "b1e43170-800a-4e9b-af82-0ed5c62c47a0",
                    "script": "while({{1}}){[[1]]}",
                    "help": "repeat until the condition is false",
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
                    "id": "20ba3e08-74c0-428e-b612-53545de63ce0",
                    "script": "if({{1}}){[[1]]}",
                    "help": "run the following blocks only if the condition is true",
                    "sockets": [
                        {
                            "name": "if",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "6dddaf61-caf0-4976-a3f1-9d9c3bbbf5a4",
                    "script": "if( ! {{1}} ){ [[1]] }",
                    "help": "run the  blocks if the condition is not true",
                    "sockets": [
                        {
                            "name": "if not",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "AB5EB656-EF22-4DD3-9B5B-9A5187DF2F2F",
                    "script": "(({{1}}) ? ({{2}}) : ({{3}}))",
                    "help": "select a result based on a condition",
                    "type": "any",
                    "sockets": [
                        {
                            "name": "if",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "then",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "else",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "5a09e58a-4f45-4fa8-af98-84de735d0fc8",
                    "script": "while(!({{1}})){[[1]]}",
                    "help": "repeat forever until condition is true",
                    "sockets": [
                        {
                            "name": "repeat until",
                            "type": "boolean"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);