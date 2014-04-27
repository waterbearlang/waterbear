(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "piface",
            "name": "PiFace",
            "help": "Physical Input and Output for the Raspberry Pi using a PiFace board.",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "bd7cb398-f6ff-41fb-b1a4-0ffdaa6135c3",
                    "script": "pfio.digital_read({{1}})",
                    "type": "boolean",
                    "help": "Use a Pin as an Digital Input",
                    "sockets": [
                        {
                            "name": "Input",
                            "type": "number",
                            "options": "pifacein",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f6fee9db-64c8-42fc-9285-f8c99c069bfa",
                    "script": "pfio.read_input()",
                    "type": "number",
                    "help": "All 8 Pins as a Digital Input",
                    "sockets": [
                        {
                            "name": "Inputs as number"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "77bdb006-723d-4b9e-bb73-6673fcc8bed0",
                    "script": "pfio.digital_write({{1}},{{2}});",
                    "help": "Turn",
                    "sockets": [
                        {
                            "name": "Set output",
                            "type": "number",
                            "options": "pifaceout",
                            "value": 0
                        },
                        {
                            "name": "to",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "cd648a1f-4e16-473e-8716-e3b32d6046c8",
                    "script": "pfio.write_output({{1}});",
                    "help": "Turn",
                    "sockets": [
                        {
                            "name": "Set outputs to",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                
                {
                    "blocktype": "step",
                    "id": "c18294d2-8df0-4d3f-8f80-3f24f46b17c3",
                    "script": "output## = {{1}};",
                    "help": "Create a named pin set to output",
                    "sockets": [
                        {
                            "name": "Create output## using Output Pin",
                            "type": "number",
                            "options": "pifaceout",
                            "value": 0
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "step",
                            "sockets": [
                                {
                                    "name": "output##"
                                },
                                {
                                    "name": "=",
                                    "type": "boolean",
                                    "value": null
                                }
                            ],
                            "script": "pfio.digital_write(output##,{{1}});"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "353a7962-7318-470d-8b19-09c5568ba413",
                    "script": "input## = {{1}};",
                    "help": "Create a named pin set to input",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "input##"
                                }
                            ],
                            "script": "pfio.digital_read(input##)",
                            "help": "Is the digital input pin ON",
                            "type": "boolean"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Create input## using Input Pin",
                            "type": "number",
                            "options": "pifacein",
                            "value": 0
                        }
                    ]
                }
                
            ]
        }
    );
})(wb);