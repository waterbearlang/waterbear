(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sensing",
            "name": "Sensing",
            "help": "Sensing blocks are for getting information from the environment, like user responses, mouse clicks, keyboard presses, and the size of the drawing area.",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "916c79df-40f1-4280-a093-6d9dfe54d87e",
                    "script": "local.answer## = prompt({{1}});[[1]]",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "answer##"
                                }
                            ],
                            "type": "string",
                            "script": "local.answer##"
                        }
                    ],
                    "help": "Prompt the user for information",
                    "sockets": [
                        {
                            "name": "ask",
                            "type": "string",
                            "value": "What's your name?",
                            "suffix": "and wait"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2504cc6a-0053-4acc-8594-a00fa8a078cb",
                    "type": "number",
                    "script": "runtime.mouse_x",
                    "help": "The current horizontal mouse position",
                    "sockets": [
                        {
                            "name": "mouse x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "80600e66-f99e-4270-8c32-a2bb8d1dafe0",
                    "type": "number",
                    "script": "runtime.mouse_y",
                    "help": "the current vertical mouse position",
                    "sockets": [
                        {
                            "name": "mouse y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "ce1026a0-9acf-4d8f-a7c0-0759115af1ca",
                    "type": "boolean",
                    "script": "runtime.mouse_down",
                    "help": "true if the mouse is down, false otherwise",
                    "sockets": [
                        {
                            "name": "mouse down"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4321cef6-6365-4885-9a3c-1fd0db2b4eab",
                    "type": "boolean",
                    "script": "runtime.isKeyDown({{1}})",
                    "help": "is the given key down when this block is run?",
                    "sockets": [
                        {
                            "name": "key",
                            "type": "string",
                            "options": "keys",
                            "value": "a",
                            "suffix": "pressed?"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "048218dd-0b8d-4bc9-b310-480e93232665",
                    "type": "number",
                    "script": "runtime.stage_width",
                    "help": "width of the stage where scripts are run. This may change if the browser window changes",
                    "sockets": [
                        {
                            "name": "stage width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6f9031c6-579b-4e24-b5d1-f648aab6e0aa",
                    "type": "number",
                    "script": "runtime.stage_height",
                    "help": "height of the stage where scripts are run. This may change if the browser window changes.",
                    "sockets": [
                        {
                            "name": "stage height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f85d3bfd-b58c-458f-b4a9-68538302aa12",
                    "type": "number",
                    "script": "runtime.stage_center_x",
                    "help": "horizontal center of the stage",
                    "sockets": [
                        {
                            "name": "center x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "083bee4f-ee36-4a35-98df-587ed586d623",
                    "type": "number",
                    "script": "runtime.stage_center_y",
                    "help": "vertical center of the stage",
                    "sockets": [
                        {
                            "name": "center y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "76184edb-ac2c-4809-899d-7b105776ba12",
                    "type": "number",
                    "script": "randint(0,runtime.stage_width)",
                    "help": "return a number between 0 and the stage width",
                    "sockets": [
                        {
                            "name": "random x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8e749092-327d-4921-a50e-c87acefe7102",
                    "type": "number",
                    "script": "randint(0, runtime.stage_height)",
                    "help": "return a number between 0 and the stage height",
                    "sockets": [
                        {
                            "name": "random y"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6b924f28-9bba-4257-a80b-2f2a591128a5",
                    "script": "runtime.timer.reset();",
                    "help": "set the global timer back to zero",
                    "sockets": [
                        {
                            "name": "reset timer"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f04b0e0a-b591-4eaf-954d-dea412cbfd61",
                    "type": "number",
                    "script": "runtime.timer.value()",
                    "help": "seconds since the script began running",
                    "sockets": [
                        {
                            "name": "timer"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);