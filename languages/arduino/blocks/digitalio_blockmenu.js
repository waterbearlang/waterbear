(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "digitalio",
            "name": "Digital I/O",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "451eda35-be10-498f-a714-4a32f3bcbe53",
                    "script": "digital_output## = \"{{1}}\"; pinMode(digital_output##, OUTPUT);",
                    "help": "Create a named pin set to output",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "digital_output##"
                                }
                            ],
                            "script": "digital_output##",
                            "type": "string"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Create digital_output## on Pin",
                            "type": "number",
                            "options": "digitalpins",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d0a3d825-0d2d-4339-838f-b30d06441c23",
                    "script": "if({{2}} == HIGH)\n{\ndigitalWrite({{1}}, HIGH);\n}\nelse\n{\ndigitalWrite({{1}}, LOW);\n}\n",
                    "help": "Write a boolean value to given pin",
                    "sockets": [
                        {
                            "name": "Digital Pin",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "ON if",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "ef757ca5-053d-4cfd-8ed4-9345cefef569",
                    "script": "digital_input## = \"{{1}}\"; pinMode(digital_input##, INPUT);",
                    "help": "Create a named pin set to input",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "digital_input##"
                                }
                            ],
                            "script": "digital_input##",
                            "type": "string"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Create digital_input## on Pin",
                            "type": "number",
                            "options": "digitalpins",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "010020b8-4e76-4e56-9cd5-65541bf2dbc9",
                    "type": "boolean",
                    "script": "(digitalRead({{1}}) == HIGH)",
                    "help": "Is the digital input pin ON",
                    "sockets": [
                        {
                            "name": "Digital Pin",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "220caace-bd77-4e82-9f5d-0457a5bbfe9f",
                    "script": "analog_input## = \"{{1}}\"; pinMode(analog_input##, INPUT);",
                    "help": "Create a named pin set to input",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "analog_input##"
                                }
                            ],
                            "script": "analog_input##",
                            "type": "string"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Create analog_input## on Pin",
                            "type": "number",
                            "options": "analoginpins",
                            "value": "A0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5b76796a-7fa9-4d56-b532-5194bf5db20f",
                    "type": "int",
                    "script": "(analogRead({{1}}))",
                    "help": "Value of analog pin",
                    "sockets": [
                        {
                            "name": "Analog Pin",
                            "type": "string",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "4fa77d69-30fb-4734-8697-5ed56ba67433",
                    "script": "analog_output## = \"{{1}}\"; pinMode(analog_output##, OUTPUT);",
                    "help": "Create a named pin set to output",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "analog_output##"
                                }
                            ],
                            "script": "analog_output##",
                            "type": "string"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Create analog_output## on Pin",
                            "type": "number",
                            "options": "pwmpins",
                            "value": 3
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "4b29af90-96e0-4de9-a7d8-2c88a35e1f49",
                    "script": "analogWrite({{1}}, {{2}});",
                    "help": "Set value of a pwm pin",
                    "sockets": [
                        {
                            "name": "Analog",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "outputs",
                            "type": "int",
                            "value": "255"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);