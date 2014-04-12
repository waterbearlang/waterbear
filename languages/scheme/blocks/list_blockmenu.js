(function(wb){
    'use strict';
    wb.menu({
        "sectionkey": "lists",
        "name": "Lists",
        "help": "Arrays are lists of items. Items can be added and removed, located, sorted and more.",
        "blocks": [
            {
                "blocktype": "expression",
                "type": "array",
                "id": "be0fb2db-fd62-4817-9b11-bee7ce44acd7",
                "script": "(cons {{1}} {{2}})",
                "help": "prepend argument 1 to argument 2",
                "sockets": [
                    {
                        "name": "",
                        "type": "any"
                    },
                    {
                        "name": "prepended to",
                        "type": "array",
                        "value": "( )"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "type": "any",
                "id": "fd90f624-c14f-41fe-8459-628da33f2226",
                "script": "(car {{1}})",
                "help": "the head element of a list",
                "sockets": [
                    {
                        "name": "head of",
                        "type": "array"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "type": "any",
                "id": "85e9a7f8-a0ea-43ca-807d-83544372bae3",
                "script": "(cdr {{1}})",
                "help": "the head element of a list",
                "sockets": [
                    {
                        "name": "tail of",
                        "type": "array"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "840b188f-c890-47d3-8c9b-777efa1f372b",
                "script": "(length {{1}})",
                "type": "number",
                "help": "get the length of an array",
                "sockets": [
                    {
                        "name": "length of",
                        "type": "array"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "78b4c7d8-c525-4a53-8a61-629576f00d03",
                "script": "(list? {{1}})",
                "type": "boolean",
                "help": "Returns true if and only if the argument is a list",
                "sockets": [
                    {
                        "name": "list?",
                        "type": "any"
                    }
                ]
            }
        ]
    });
})(wb);