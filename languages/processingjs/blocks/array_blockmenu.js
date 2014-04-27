(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "arrays",
            "name": "Arrays",
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
                            "type": "array",
                            "value": null
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
                            "type": "array",
                            "value": null
                        },
                        {
                            "name": "item",
                            "type": "number",
                            "value": "0"
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
                            "type": "array",
                            "value": null
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
                    "help": "add any object to an array",
                    "sockets": [
                        {
                            "name": "array",
                            "type": "array",
                            "value": null
                        },
                        {
                            "name": "append",
                            "type": "any",
                            "value": null
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
                            "value": null
                        },
                        {
                            "name": "length"
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
                            "type": "array",
                            "value": null
                        },
                        {
                            "name": "remove item",
                            "type": "number",
                            "value": "0"
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
                            "value": null
                        },
                        {
                            "name": "pop"
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
                            "value": null
                        },
                        {
                            "name": "shift"
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
                            "value": null
                        },
                        {
                            "name": "reversed"
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
                            "type": "array",
                            "value": null
                        },
                        {
                            "name": "concat",
                            "type": "array",
                            "value": null
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
                            "value": null
                        },
                        {
                            "name": "for each"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);