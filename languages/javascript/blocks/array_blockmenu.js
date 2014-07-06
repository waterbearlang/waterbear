(function(wb){
    'use strict';
    wb.menu(
    {
        "sectionkey": "arrays",
        "name": "Arrays",
        "help": "Arrays are lists of items. Items can be added and removed, located, sorted and more.",
        "blocks": [
        {
            "blocktype": "step",
            "id": "e6a297e9-1255-4701-91d8-80548489ee9a",
            "script": "local.array## = [];",
            "help": "Create an empty array",
            "locals": [
            {
                "blocktype": "expression",
                "sockets": [
                {
                    "name": "array##"
                }
                ],
                "script": "local.array##",
                "type": "array"
            }
            ],
            "sockets": [
            {
                "name": "new array##"
            }
            ]
        },
        {
            "blocktype": "step",
            "id": "83d67170-4ba7-45ac-95ae-bb2f314c3ae0",
            "script": "local.array## = {{1}}.slice();",
            "help": "create a new array with the contents of another array",
            "locals": [
            {
                "blocktype": "expression",
                "sockets": [
                {
                    "name": "array##"
                }
                ],
                "script": "local.array##",
                "type": "array"
            }
            ],
            "sockets": [
            {
                "name": "new array with array##",
                "type": "array"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "3e56f9c1-29b9-4d0c-99bd-05ccabfa29c2",
            "script": "{{1}}[{{2}}]",
            "type": "any",
            "help": "get an item from an index in the array",
            "sockets": [
            {
                "name": "array",
                "type": "array"
            },
            {
                "name": "item",
                "type": "number",
                "value": 0,
                "min": 0
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5b1cc330-b9b1-4062-b8d4-e5032c7a5776",
            "script": "{{1}}.join({{2}})",
            "type": "string",
            "help": "join items of an array into a string, each item separated by given string",
            "sockets": [
            {
                "name": "array",
                "type": "array"
            },
            {
                "name": "join with",
                "type": "string",
                "value": ", "
            }
            ]
        },
        {
            "blocktype": "step",
            "id": "3fab2b88-430a-401e-88b2-2703d614780a",
            "script": "{{1}}.push({{2}});",
            "help": "add any object to the end of an array",
            "sockets": [
            {
                "name": "array",
                "type": "array"
            },
            {
                "name": "append",
                "type": "any"
            }
            ]
        },
        {
            "blocktype": "step",
            "id": "77edf0e9-e5df-4294-81ef-bfa363cda3ee",
            "script": "{{1}}.unshift({{2}});",
            "help": "add any object to the beginning of an array",
            "sockets": [
            {
                "name": "array",
                "type": "array"
            },
            {
                "name": "prepend",
                "type": "any"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "bf3ed213-4435-4152-bb2c-573ce1721036",
            "script": "{{1}}.length",
            "type": "number",
            "help": "get the length of an array",
            "sockets": [
            {
                "name": "array",
                "type": "array",
                "suffix": "length"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "f4870f0f-1dbb-4bc7-b8e3-3a00af613689",
            "script": "{{1}}.splice({{2}}, 1)[0]",
            "type": "any",
            "help": "remove item at index from an array",
            "sockets": [
            {
                "name": "array",
                "type": "array"
            },
            {
                "name": "remove item",
                "type": "number",
                "value": 0,
                "min": 0
            }
            ]
        },
        {
            "blocktype": "step",
            "id": "f4870f0f-1dbb-4bc7-b8e3-3a00af613619",
            "help": "remove item at index from an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array"
                },
                {
                    "name": "remove item",
                    "type": "number",
                    "value": 0,
                    "min": 0
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e137e1a3-fe66-4d15-ae2a-596050acb6a7",
            "script": "{{1}}.pop()",
            "type": "any",
            "help": "remove and return the last item from an array",
            "sockets": [
            {
                "name": "array",
                "type": "array",
                "suffix": "pop"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "00685267-c279-4fc1-bdbd-a07742a76b1e",
            "script": "{{1}}.shift()",
            "type": "any",
            "help": "remove and return the first item from an array",
            "sockets": [
            {
                "name": "array",
                "type": "array",
                "suffix": "shift"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "b4f115d3-fc52-4d75-a363-5119de21e97c",
            "script": "{{1}}.slice().reverse()",
            "type": "array",
            "help": "reverse a copy of array",
            "sockets": [
            {
                "name": "array",
                "type": "array",
                "suffix": "reversed"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "0931d219-707c-41dd-92e6-b1a7c2a0f6b3",
            "script": "{{1}}.concat({{2}});",
            "type": "array",
            "help": "a new array formed by joining the arrays",
            "sockets": [
            {
                "name": "array",
                "type": "array"
            },
            {
                "name": "concat",
                "type": "array"
            }
            ]
        },
        {
            "blocktype": "expression",
            "id": "acf4e2d3-24b2-41c7-8452-bce733400248",
            "script": "sum({{1}})",
            "type": "number",
            "help": "calculate the sum of a number array",
            "sockets": [
                {
                    "name": "sum of array",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "f8be8360-aa41-4079-a7cb-12ff7a91b52d",
            "script": "mean({{1}})",
            "type": "number",
            "help": "calculate the mean of a number array",
            "sockets": [
                {
                    "name": "mean of array",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e7424a86-3773-4759-828e-4dc33423a4da",
            "script": "stdev({{1}})",
            "type": "number",
            "help": "calculate the standard deviation of a number array",
            "sockets": [
                {
                    "name": "stdev of array",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "d037e6dd-099b-4e0f-aa54-cbf2b92067b8",
            "script": "variance({{1}})",
            "type": "number",
            "help": "calculate the variance of a number array",
            "sockets": [
                {
                    "name": "variance of array",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "71e323de-c561-4aac-91dd-4d5eae671b5b",
            "script": "normalize({{1}})",
            "type": "array",
            "help": "normalize the entries of a number array",
            "sockets": [
                {
                    "name": "normalize array",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "58e775de-23aa-4572-88b8-ce85891db42b",
            "script": "local.array##= createArrayFromCSV(\"{{1}}\");",
            "help": "create number array from CSV",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "array##"
                        }
                    ],
                    "script": "local.array##",
                    "type": "array"
                }
            ],
            "sockets": [
                {
                    "name": "new array## from CSV",
                    "type": "file"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "dc315e45-66cd-4c06-af40-ec9275b63a4c",
            "script": "kNN({{2}},{{3}},{{1}})",
            "type": "number",
            "help": "Run k-Nearest Neighbors algorithm",
            "sockets": [
                {
                    "name": "classify test point",
                    "type": "array"
                },
                {
                    "name": "using kNN algorithm with k value",
                    "type": "number"
                },
                {
                    "name": "and training set",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "68d14a01-3e8e-4fd8-9a37-08257b70d429",
            "script": "weightedKNN({{2}},{{3}},{{1}})",
            "type": "number",
            "help": "Run weighted k-Nearest Neighbors algorithm",
            "sockets": [
                {
                    "name": "classify test point",
                    "type": "array"
                },
                {
                    "name": "using weighted kNN algorithm with k value",
                    "type": "number"
                },
                {
                    "name": "and training set",
                    "type": "array"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "9f6f4e21-7abf-4e6f-b9bf-4ce8a1086a21",
            "script": "{{1}}.forEach(function(item, idx){local.index = idx; local.item = item; [[1]] });",
            "locals": [
            {
                "blocktype": "expression",
                "sockets": [
                {
                    "name": "index"
                }
                ],
                "script": "local.index",
                "help": "index of current item in array",
                "type": "number"
            },
            {
                "blocktype": "expression",
                "sockets": [
                {
                    "name": "item"
                }
                ],
                "script": "local.item",
                "help": "the current item in the iteration",
                "type": "any"
            }
            ],
            "help": "run the blocks with each item of a named array",
            "sockets": [
            {
                "name": "array",
                "type": "array",
                "suffix": "for each"
            }
            ]
        }
        ]
    }
    );
})(wb);