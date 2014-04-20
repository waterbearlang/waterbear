(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "rpigpio",
            "name": "RPi_GPIO",
            "help": "Physical Input and Output for the Raspberry Pi using RPi_GPIO.",
            "id": "63b8ffcc-9b51-4a5e-b687-634945bfb9b8",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "58384296-5b10-4a5f-8a6e-8f1004b4e88b",
                    "script": "int digital_input##_pin = {{1}}; pinMode(digital_input##_pin, INPUT);",
                    "help": "Use a Pin as an Digital Input",
                    "sockets": [
                        {
                            "name": "Create Digital Input ##"
                        },
                        {
                            "name": "on",
                            "type": "string",
                            "options": "digitalinputpins",
                            "value": null
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "expression",
                            "type": "boolean",
                            "script": "digitalRead(digital_input##_pin) == HIGH",
                            "help": "Value of Input (boolean)",
                            "sockets": [
                                {
                                    "name": "Value of Digital Input ##"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);