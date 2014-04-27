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
                    "id": "555172b9-1077-4205-a403-3b301be14055",
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
                    "id": "8e2d5fba-b674-4d1e-8137-db49da44acf2",
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
                    "id": "9e8bf11e-4fe6-4028-932d-a7c3c4231060",
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
                    "id": "df795450-aa4a-4acd-b96d-230617611f83",
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
                    "id": "4f66c164-2873-4313-a54a-2771b6a04e92",
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
                    "id": "c6f26489-46d8-481c-ba6d-07739ca7c267",
                    "script": "{{1}}.length",
                    "type": "number",
                    "help": "get the length of an array",
                    "sockets": [
                        {
                            "name": "array",
                            "type": "array",
                            "value": null,
                            "suffix": "length"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "ed5a1051-cc8e-47e0-aa9f-c0b852dda6fa",
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
                    "id": "56a4997d-7a67-4b85-9983-9d7c64ac2bad",
                    "script": "{{1}}.pop()",
                    "type": "any",
                    "help": "remove and return the last item from an array",
                    "sockets": [
                        {
                            "name": "array",
                            "type": "array",
                            "value": null,
                            "suffix": "pop"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "b9a43234-d090-4db9-9ebf-bc4e45dff90f",
                    "script": "{{1}}.shift()",
                    "type": "any",
                    "help": "remove and return the first item from an array",
                    "sockets": [
                        {
                            "name": "array",
                            "type": "array",
                            "value": null,
                            "suffix": "shift"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6d706cdf-9311-4034-8bd8-6ce0c2340e56",
                    "script": "{{1}}.slice().reverse()",
                    "type": "array",
                    "help": "reverse a copy of array",
                    "sockets": [
                        {
                            "name": "array",
                            "type": "array",
                            "value": null,
                            "suffix": "reversed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "43415751-34cb-478b-952b-3954718cb0d3",
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
                    "id": "2cf51b08-8c8a-44e8-8227-39a6f13da423",
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
                            "value": null,
                            "suffix": "for each"
                        }
                    ]
                }
            ]
        }
    );
})(wb);