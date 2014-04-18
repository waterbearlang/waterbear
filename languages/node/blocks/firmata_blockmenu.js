(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "firmata",
            "name": "Firmata",
            "help": "Physical Input and Output for the Raspberry Pi using an Arduino loaded with Firmata.",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "0cadc709-e4eb-4aa4-9e1e-374fdf71dac3",
                    "sockets": [
                        {
                            "name": "Connect To Firmata"
                        }
                    ],
                    "script": "arduino.connect();arduino.on('connect', function(){[[1]]});",
                    "help": "All Firmata things in here"
                },
                {
                    "blocktype": "step",
                    "id": "a7096d17-06bd-4986-a6de-4eeffc68ec88",
                    "script": "digital_output## = {{1}}; arduino.pinMode(digital_output##, ArduinoFirmata.OUTPUT);",
                    "help": "Create a named pin set to output",
                    "sockets": [
                        {
                            "name": "Create digital_output## on Pin",
                            "type": "number",
                            "options": "digitalpins",
                            "value": 0
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "step",
                            "sockets": [
                                {
                                    "name": "digital_output##"
                                },
                                {
                                    "name": "to",
                                    "type": "boolean",
                                    "value": null
                                }
                            ],
                            "script": "arduino.digitalWrite(digital_output##, {{1}}, function(){});"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "0ff728fe-e833-4887-8c1c-16380100d007",
                    "script": "digital_input## = {{1}}; pinMode(digital_input##, INPUT);",
                    "help": "Create a named pin set to input",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "digital_input##"
                                }
                            ],
                            "script": "arduino.digitalRead(digital_input##)",
                            "help": "Is the digital input pin ON",
                            "type": "boolean"
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
                    "blocktype": "step",
                    "id": "5501b22e-e6ae-4a86-8c67-b8d3e60d7fff",
                    "script": "analog_output## = {{1}}; arduino.pinMode(analog_output##, ArduinoFirmata.OUTPUT);",
                    "help": "Create a named pin set to output",
                    "sockets": [
                        {
                            "name": "Create analog_output## on Pin",
                            "type": "number",
                            "options": "pwmpins",
                            "value": 3
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "step",
                            "sockets": [
                                {
                                    "name": "analog_output##"
                                },
                                {
                                    "name": "to",
                                    "type": "int",
                                    "value": null
                                }
                            ],
                            "script": "arduino.analogWrite(analog_output##, {{1}}, function(){});"
                        }
                    ]
                },
                
                {
                    "blocktype": "step",
                    "id": "b335d921-f23c-4a2c-b35a-9407ccd6d60c",
                    "script": "servo## = {{1}}; arduino.pinMode(servo##, ArduinoFirmata.OUTPUT);",
                    "help": "Create a named pin set to servo",
                    "sockets": [
                        {
                            "name": "Create servo## on Pin",
                            "type": "number",
                            "options": "pwmpins",
                            "value": 3
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "step",
                            "sockets": [
                                {
                                    "name": "servo##"
                                },
                                {
                                    "name": "to angle",
                                    "type": "int",
                                    "value": null
                                }
                            ],
                            "script": "arduino.servoWrite(servo##, {{1}}, function(){});"
                        }
                    ]
                },
                
                {
                    "blocktype": "step",
                    "id": "9d686235-2644-475d-a21a-b5c1df89185f",
                    "script": "analog_input## = {{1}}; pinMode(analog_input##, INPUT);",
                    "help": "Create a named pin set to input",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "analog_input##"
                                }
                            ],
                            "script": "arduino.analogRead(analog_input##)",
                            "help": "The value on analog input pin",
                            "type": "int"
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
                }
                
            ]
        }
    );
})(wb);