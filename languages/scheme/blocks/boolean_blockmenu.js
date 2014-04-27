(function(wb){
    'use strict';
    wb.menu({
        "sectionkey": "boolean",
        "name": "Boolean",
        "help": "Booleans are true or false and expressions which evaluate to true or false",
        "blocks": [
            {
                "blocktype": "expression",
                "type" : "boolean",
                "id": "eec0910c-be04-407f-9536-f246a65222b5",
                "script": "(and {{1}} {{2}})",
                "help": "both operands are true",
                "sockets": [
                    {
                        "name": "",
                        "type": "any"
                    },
                    {
                        "name": "and",
                        "type": "any"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "type":"boolean",
                "id": "43e8d463-0048-473c-8f15-a504455a4849",
                "script": "(or {{1}} {{2}})",
                "help": "either or both operands are true",
                "sockets": [
                    {
                        "name": "",
                        "type": "any"
                    },
                    {
                        "name": "or",
                        "type": "any"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "37756b6e-7ed3-4aff-9e07-c3bb75cb8b9e",
                "type": "boolean",
                "script": "(and (or {{1}} {{2}}) (not (and {{1}} {{2}})))",
                "help": "either, but not both, operands are true",
                "sockets": [
                    {
                        "name": "",
                        "type": "any"
                    },
                    {
                        "name": "xor",
                        "type": "any"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "39ea95e2-2874-4b3c-a2ef-c7ae30e03e34",
                "type": "boolean",
                "script": "(not {{1}})",
                "help": "operand is false",
                "sockets": [
                    {
                        "name": "not",
                        "type": "any"
                    }
                ]
            }
        ]
    })
})(wb);