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
                    "id": "2ef48097-a439-42aa-9fe3-be6fb14ef3a7",
                    "type": "boolean",
                    "script": "({{1}} && {{2}})",
                    "help": "both operands are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "AND",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d10041ac-027e-4a11-b4f9-941d2e538aa7",
                    "type": "boolean",
                    "script": "({{1}} || {{2}})",
                    "help": "either or both operands are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "OR",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d121063d-83c9-4fd6-b738-27b31c995323",
                    "type": "boolean",
                    "script": "({{1}} ? !{{2}} : {{2}})",
                    "help": "either, but not both, operands are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "XOR",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4de248e4-e41f-44ca-a869-edd9b0a048b2",
                    "type": "boolean",
                    "script": "(! {{1}})",
                    "help": "operand is false",
                    "sockets": [
                        {
                            "name": "NOT",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                }
            ]
        }
    );
})(wb);