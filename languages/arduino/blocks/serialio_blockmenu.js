(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "serialio",
            "name": "Serial I/O",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "11c7b422-0549-403e-9f2e-e1db13964f1b",
                    "script": "Serial.begin({{1}});",
                    "help": "Eanble serial communications at a chosen speed",
                    "sockets": [
                        {
                            "name": "Setup serial communication at",
                            "type": "number",
                            "options": "baud",
                            "value": "9600"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9ffc70c4-b0da-4d2c-a38a-f1ec2ec743ac",
                    "script": "Serial.println({{1}});",
                    "help": "Send a message over the serial connection followed by a line return",
                    "sockets": [
                        {
                            "name": "Send",
                            "type": "any",
                            "value": "Message"
                        },
                        {
                            "name": "as a line"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "40fb939a-a393-4d26-8902-93ee78bd01b0",
                    "script": "Serial.print({{1}});",
                    "help": "Send a message over the serial connection",
                    "sockets": [
                        {
                            "name": "Send",
                            "type": "any",
                            "value": "Message"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a1630959-fc16-4ba8-af98-4724edc636b4",
                    "type": "string",
                    "script": "Serial.read()",
                    "help": "Read a message from the serial connection",
                    "sockets": [
                        {
                            "name": "Message Value"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "43618563-c8a3-4330-bfef-89469a797a90",
                    "script": "Serial.end();",
                    "help": "Disable serial communications",
                    "sockets": [
                        {
                            "name": "End serial communication"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);