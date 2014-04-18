(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "boolean",
            "name": "Boolean",
            "help": "Booleans are true or false and expressions which evaluate to true or false",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "770756e8-3a10-4993-b02e-3d1333c98958",
                    "type": "boolean",
                    "script": "({{1}} && {{2}})",
                    "help": "both operands are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean"
                        },
                        {
                            "name": "and",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a56c0d03-5c5c-4459-9aaf-cbbea6eb3abf",
                    "type": "boolean",
                    "script": "({{1}} || {{2}})",
                    "help": "either or both operands are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean"
                        },
                        {
                            "name": "or",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "cb9ddee8-5ee1-423b-9559-6d2cbb379b80",
                    "type": "boolean",
                    "script": "({{1}} ? !{{2}} : {{2}})",
                    "help": "either, but not both, operands are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean"
                        },
                        {
                            "name": "xor",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "138a6840-37cc-4e2d-b44a-af32e673ba56",
                    "type": "boolean",
                    "script": "(! {{1}})",
                    "help": "operand is false",
                    "sockets": [
                        {
                            "name": "not",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "de9f5ebd-2408-4c72-9705-786b1eec2b14",
                    "type": "boolean",
                    "script": "!({{1}}%2)",
                    "help": "true when the parameter is even",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 2,
                            "suffix": "is even"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "0ac50ac9-2af6-4073-83cf-4f79b4bde163",
                    "type": "boolean",
                    "script": "!!({{1}}%2)",
                    "help": "true when the parameter is odd",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 1,
                            "suffix": "is odd"
                        }
                    ]
                }
        
            ]
        }
        
    );
})(wb);