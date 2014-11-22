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
})(wb);(function(wb){
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
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "canvas",
            "name": "Canvas",
            "help": "Canvas blocks are blocks that are about drawing on the canvas but don't fit elsewhere. Also look at the Sprites, Shapes, and Path menus.",
            "blocks": [
                {
                    "blocktype": "context",
                    "script": "local.ctx.save();[[1]];local.ctx.restore();",
                    "help": "save the current state, run the contained steps, then restore the saved state",
                    "id": "9e514499-05a6-4b76-ad4b-1ea888181a8b",
                    "sockets": [
                        {
                            "name": "with local state"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "local.ctx.stroke();",
                    "help": "stroke...",
                    "id": "99d5828c-ccdd-47db-9abe-f67a8c065fe6",
                    "sockets": [
                        {
                            "name": "stroke"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "local.ctx.fill();",
                    "help": "fill...",
                    "id": "d540bb5f-7711-4133-a631-53821daeb593",
                    "sockets": [
                        {
                            "name": "fill"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c7e2e322-921a-4a96-9c86-9dbbaf54eb53",
                    "script": "local.ctx.globalAlpha = {{1}};",
                    "help": "set the global alpha",
                    "sockets": [
                        {
                            "name": "global alpha",
                            "type": "number",
                            "value": 1.0,
                            "min": 0.0,
                            "max": 1.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "0237bbab-d62a-4ff9-afb8-4a64bc98dbc3",
                    "script": "local.ctx.globalCompositOperator = {{1}};",
                    "help": "set the global composite operator",
                    "sockets": [
                        {
                            "name": "global composite operator",
                            "type": "string",
                            "options": "globalCompositeOperators",
                            "value": "source-over"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "96085392-9a2d-4857-85f1-af2af72cf800",
                    "script": "local.ctx.scale({{1}},{{2}});",
                    "help": "change the scale of subsequent drawing",
                    "sockets": [
                        {
                            "name": "scale x",
                            "type": "number",
                            "value": 1.0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 1.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5e6ce8f8-d5a2-454e-8e88-d5155fb0eef0",
                    "script": "local.ctx.rotate(deg2rad({{1}}));",
                    "help": "rotate...",
                    "sockets": [
                        {
                            "name": "rotate by",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "df0ffca8-dd43-45aa-8b9f-b7d588090cd5",
                    "script": "local.ctx.translate({{1}},{{2}});",
                    "help": "translate...",
                    "sockets": [
                        {
                            "name": "translate by x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d297afc2-3941-4977-a6af-d7f4e222b467",
                    "script": "local.ctx.lineWidth = {{1}};",
                    "help": "set line width",
                    "sockets": [
                        {
                            "name": "line width",
                            "type": "number",
                            "value": 1,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b538aadd-e90d-4d0d-bc12-95b7df9c2a61",
                    "script": "local.ctx.lineCap = {{1}};",
                    "help": "set line cap",
                    "sockets": [
                        {
                            "name": "line cap",
                            "type": "string",
                            "options": "linecap",
                            "value": "round"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "4b3f5315-295c-46d7-baf2-e791c707cf4f",
                    "script": "local.ctx.lineJoin = {{1}};",
                    "help": "set line join",
                    "sockets": [
                        {
                            "name": "line join",
                            "type": "string",
                            "options": "linejoin",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c3aec6b2-ccb1-4e24-b00f-0736214f44c3",
                    "script": "local.ctx.mitreLimit = {{1}};",
                    "help": "set mitre limit",
                    "sockets": [
                        {
                            "name": "mitre limit",
                            "type": "number",
                            "value": 10,
                            "min": 0.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f28b6498-87f7-4b39-bf16-81644a2a1996",
                    "script": "local.ctx.shadowOffsetX = {{1}}; local.ctx.shadowOffsetY = {{2}}",
                    "help": "set the offsets for shadow",
                    "sockets": [
                        {
                            "name": "shadow offset x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "278b0b41-895c-4786-9c09-d745ae5501af",
                    "script": "local.ctx.shadowBlur = {{1}};",
                    "help": "set the shadow blur radius",
                    "sockets": [
                        {
                            "name": "shadow blur",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "help": "clear...",
                    "id": "cf17a61d-8c7a-4829-a476-0b650efda3e4",
                    "sockets": [
                        {
                            "name": "clear rect",
                            "type": "shape",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();",
                    "help": "stroke a circle with the current color",
                    "id": "b4e05d48-32e4-4e0b-832c-b2433ffda2e2",
                    "sockets": [
                        {
                            "name": "stroke circle at point",
                            "type": "point",
                            "value": null
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": ["shape", "circle", "stroke"]
                }
            ]
        }

    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "color",
            "name": "Color",
            "help": "Color blocks are for creating, converting, and manipulating colors",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "a57f2c99-c76b-499d-bd49-8bb2f1a15bd7",
                    "script": "#111111",
                    "help": "simple black color",
                    "sockets": [
                        {
                            "name": "black"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4ba83dbf-9317-4db6-ab40-cd5d67cc154c",
                    "script": "#FFFFFF",
                    "help": "simple white color",
                    "sockets": [
                        {
                            "name": "white"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a096d508-0ad6-4b91-a780-d814da70c892",
                    "script": "#001f3f",
                    "help": "simple navy color",
                    "sockets": [
                        {
                            "name": "navy"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "49e94816-79c8-4184-9b1e-3d67d0cf462c",
                    "script": "#0074d9",
                    "help": "simple blue color",
                    "sockets": [
                        {
                            "name": "blue"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2371917e-02b5-4309-8f50-adc37138cabe",
                    "script": "#7fdbff",
                    "help": "simple aqua color",
                    "sockets": [
                        {
                            "name": "aqua"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "33f4911a-848e-4fee-98b4-1518eaa8c8c3",
                    "script": "#39cccc",
                    "help": "simple teal color",
                    "sockets": [
                        {
                            "name": "teal"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1594cdab-0816-47f2-a8b8-ebb2ede1773b",
                    "script": "#3d9970",
                    "help": "simple olive color",
                    "sockets": [
                        {
                            "name": "olive"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "59684297-d8e8-4d2a-9a79-a3067d1346ec",
                    "script": "#2ecc40",
                    "help": "simple green color",
                    "sockets": [
                        {
                            "name": "green"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9370a21d-3201-4f1a-97c5-779bc2b97070",
                    "script": "#01ff70",
                    "help": "simple lime color",
                    "sockets": [
                        {
                            "name": "lime"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "b22d1d30-e49d-4994-aca8-f8018e518975",
                    "script": "#ffdc00",
                    "help": "simple yellow color",
                    "sockets": [
                        {
                            "name": "yellow"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "be273619-4467-4b71-ab98-7698dedfad2f",
                    "script": "#ff851b",
                    "help": "simple orange color",
                    "sockets": [
                        {
                            "name": "orange"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "88e2874a-2dd7-4e47-bc1a-769696f6dddc7",
                    "script": "#ff4136",
                    "help": "simple red color",
                    "sockets": [
                        {
                            "name": "red"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9586be34-f287-410b-8bfa-867e392d62d3",
                    "script": "#f012be",
                    "help": "simple fuchsia color",
                    "sockets": [
                        {
                            "name": "fuchsia"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "62df6765-092a-4d70-bd62-2e67f72c4712",
                    "script": "#b10dc9",
                    "help": "simple purple color",
                    "sockets": [
                        {
                            "name": "purple"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "3e791123-ef1f-4d2c-8081-9d65dc39ed12",
                    "script": "#85144b",
                    "help": "simple maroon color",
                    "sockets": [
                        {
                            "name": "maroon"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "04041f33-7eda-4b8c-a5af-90ec3a444168",
                    "script": "#aaaaaa",
                    "help": "simple grey color",
                    "sockets": [
                        {
                            "name": "grey"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a1acf4e2-7281-4fa0-a669-0cbfca863dbc",
                    "script": "#dddddd",
                    "help": "simple silver color",
                    "sockets": [
                        {
                            "name": "silver"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "01e39af1-679d-4b4d-b30e-a093a2687063",
                    "script": "local.ctx.shadowColor = {{1}};",
                    "help": "set the shadow color",
                    "sockets": [
                        {
                            "name": "shadow color",
                            "type": "color"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9286b647-2c6f-4fbe-ae92-3d0062bc438f",
                    "script": "local.ctx.strokeStyle = {{1}};",
                    "help": "stroke color...",
                    "sockets": [
                        {
                            "name": "stroke color",
                            "type": "color",
                            "value": "#000"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6fe550a9-c630-4876-950c-f727de27b7ae",
                    "script": "local.ctx.fillStyle = {{1}};",
                    "help": "fill color...",
                    "sockets": [
                        {
                            "name": "fill color",
                            "type": "color",
                            "value": "#000"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c8a2aa22-df8e-40e4-b33e-fcbd489689da",
                    "script": function(args){
                        // expect one argument, a number between 0 and 255
                        return 'runtime.color.greyValueAsHex(' + args[0] + ')';
                    },
                    "type": "color",
                    "help": "returns a grey with a level between 0 and 255",
                    "sockets": [
                        {
                            "name": "grey with level",
                            "type": "number",
                            "value": 100,
                            "min": 0,
                            "max": 255
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "271c8b4c-b045-4ff9-8ad5-9608ea204b09",
                    "script": "\"rgb(\" + {{1}} + \",\" + {{2}} + \",\" + {{3}} + \")\"",
                    "type": "color",
                    "help": "returns a color",
                    "sockets": [
                        {
                            "name": "color with red",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 255
                        },
                        {
                            "name": "green",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 255
                        },
                        {
                            "name": "blue",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 255
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "13236aef-cccd-42b3-a041-e26528174323",
                    "script": "\"rgba(\" + {{1}} + \",\" + {{2}} + \",\" + {{3}} + \",\" + {{4}} + \")\"",
                    "type": "color",
                    "help": "returns a semi-opaque color",
                    "sockets": [
                        {
                            "name": "color with red",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 255
                        },
                        {
                            "name": "green",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 255
                        },
                        {
                            "name": "blue",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 255
                        },
                        {
                            "name": "alpha",
                            "type": "number",
                            "value": 0.1,
                            "min": 0.0,
                            "max": 1.0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e9496816-4f7b-47d3-8c70-163df835230c",
                    "type": "color",
                    "script": "\"hsb({{1}}, {{2}}, {{3}})\"",
                    "help": "returns a color",
                    "sockets": [
                        {
                            "name": "color with hue",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 360,
                            "suffix": "°"
                        },
                        {
                            "name": "saturation",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 100,
                            "suffix": "%"
                        },
                        {
                            "name": "brightness",
                            "type": "number",
                            "value": 0,
                            "min": 0,
                            "max": 100,
                            "suffix": "%"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f",
                    "type": "color",
                    "script": "\"rgb(\" + randint(0,255) + \",\" + randint(0,255) + \",\" + randint(0,255) + \")\"",
                    "help": "returns a random color",
                    "sockets": [
                        {
                            "name": "random color"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c2d8442b-c9eb-45bb-8ca6-69f2e6d4c7c7",
                    "script": "local.ctx.strokeStyle = {{1}};",
                    "help": "replaces stroke color or stroke pattern with gradient",
                    "sockets": [
                        {
                            "name": "stroke gradient",
                            "type": "gradient"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b80bc4ea-7f07-4dd5-b2f9-d8f09e0aca55",
                    "script": "local.ctx.fillStyle = {{1}};",
                    "help": "replaces fill color or fill pattern with gradient",
                    "sockets": [
                        {
                            "name": "fill gradient",
                            "type": "gradient"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7fd65106-276d-43f3-b433-5ce6b750d511",
                    "script": "local.ctx.strokeStyle = {{1}};",
                    "help": "replaces stroke color or stroke gradient with pattern",
                    "sockets": [
                        {
                            "name": "stroke pattern",
                            "type": "pattern"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9f54e5b1-f539-4005-bd8e-5b759e776bba",
                    "script": "local.ctx.fillStyle = {{1}};",
                    "help": "replaces fill color or fill gradient with pattern",
                    "sockets": [
                        {
                            "name": "fill pattern",
                            "type": "pattern"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5caf94c7-f489-4423-a0c7-d1ad066c4dc7",
                    "script": "local.gradient## = local.ctx.createRadialGradient({{1}}.x,{{1}}.y,{{2}},{{3}}.x,{{3}}.y,{{4}});",
                    "help": "create a radial gradient in the cone described by two circles",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "radial gradient##"
                                }
                            ],
                            "script": "local.gradient##",
                            "type": "gradient"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "create radial gradient from point1",
                            "type": "point"
                        },
                        {
                            "name": "radius1",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "to point2",
                            "type": "point"
                        },
                        {
                            "name": "radius2",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "be35754d-da0e-4b26-b8f1-9a4f36e902c3",
                    "script": "local.gradient## = local.ctx.createLinearGradient({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y);",
                    "help": "create a linear gradient between two points",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "linear gradient##"
                                }
                            ],
                            "script": "local.linear.gradient##",
                            "type": "gradient"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "create linear gradient from point1",
                            "type": "point"
                        },
                        {
                            "name": "to point2",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a0783aab-194c-4059-8f8e-4afd93ec1ca5",
                    "script": "{{1}}.addColorStop({{2}}, {{3}});",
                    "help": "creates an additional color stop, offset must be between 0.0 and 1.0",
                    "sockets": [
                        {
                            "name": "add color stop to gradient",
                            "type": "gradient"
                        },
                        {
                            "name": "at offset",
                            "type": "number",
                            "value": 0.5,
                            "min": 0.0,
                            "max": 1.0
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "value": "#F00"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "3a6b43b7-3392-4f0d-b2b7-c5e1dc0cf501",
                    "script": "local.pattern## = local.ctx.createPattern({{1}}, {{2}});",
                    "help": "create a pattern with the given html image",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "pattern##"
                                }
                            ],
                            "script": "local.pattern##",
                            "type": "pattern"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "create pattern## from image",
                            "type": "image"
                        },
                        {
                            "name": "repeats",
                            "type": "string",
                            "options": "repetition",
                            "value": "repeat"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "controls",
            "name": "Controls",
            "help": "Contains control flow, variables, setters, and messaging blocks.",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "1cf8132a-4996-47db-b482-4e336200e3ca",
                    "script": [
                        "(function(){",
                        "    [[1]]",
                        "})();"
                    ],
                    "help": "this trigger will run its scripts once when the program starts",
                    "sockets": [
                        {
                            "name": "when program runs"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "f4a604cd-f0b5-4133-9f91-4e1abe48fb6a",
                    "script": "document.addEventListener('keydown', function(event){ if (runtime.keyForEvent(event) === {{1}}){[[1]];}});",
                    "help": "this trigger will run the attached blocks every time this key is pressed",
                    "sockets": [
                        {
                            "name": "when",
                            "type": "string",
                            "options": "keys",
                            "value": "a",
                            "suffix": "key pressed"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "f13fcf60-a7e4-4672-9ff8-06197a65af94",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "event##"
                                }
                            ],
                            "script": "local.event##",
                            "type": "object"
                        }
                    ],
                    "script": "document.addEventListener({{1}}, function(event){local.event##=event;[[1]]; });",
                    "help": "this trigger will run the attached blocks every time the chosen mouse event happens",
                    "sockets": [
                        {
                            "name": "when",
                            "type": "string",
                            "options": "pointerEvents",
                            "value": ""
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "cfea9087-3d7c-46ad-aa41-579bba2f4709",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "local.count##",
                            "type": "number"
                        }
                    ],
                    "script": "(function(){local.count##=0;requestAnimationFrame(function eachFrame(){local.count##++;[[1]];requestAnimationFrame(eachFrame);})})();",
                    "help": "this trigger will run the attached blocks periodically",
                    "sockets": [
                        {
                            "name": "each frame"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "47AA31E2-5A90-4AF1-8F98-5FDD437561B6",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "local.count##",
                            "type": "number"
                        }
                    ],
                    "script": "(function(){local.count##=0;local.timerid##=setInterval(function(){local.count##++;if({{2}}){clearInterval(local.timerid##);return;}[[1]]},1000/{{1}});})();",
                    "help": "this trigger will run the attached blocks periodically",
                    "sockets": [
                        {
                            "name": "repeat",
                            "type": "number",
                            "value": 30,
                            "min": 0
                        },
                        {
                            "name": "times a second until",
                            "type": "boolean",
                            "value": true
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "079b2b89-41c2-4d00-8e21-bcb86574bf80",
                    "script": "local.variable## = {{1}};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "script": "local.variable##",
                            "type": "any",
                            "sockets": [
                                {
                                    "name": "variable##"
                                }
                            ]
                        }
                    ],
                    "help": "create a reference to re-use the any",
                    "sockets": [
                        {
                            "name": "variable variable##",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b4036693-8645-4852-a4de-9e96565f9aec",
                    "script": "{{1}} = {{2}};",
                    "help": "first argument must be a variable",
                    "sockets": [
                        {
                            "name": "set variable",
                            "type": "any"
                        },
                        {
                            "name": "to",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9AED48C9-A90B-49FB-9C1A-FD632F0388F5",
                    "script": "{{1}} += {{2}};",
                    "help": "first argument must be a variable",
                    "sockets": [
                        {
                            "name": "increment variable",
                            "type": "any"
                        },
                        {
                            "name": "by",
                            "type": "any",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "66b33236-c9ce-4b6c-9b69-e8c4fdadbf52",
                    "script": "setTimeout(function(){[[1]]},1000*{{1}});",
                    "help": "pause before running the following blocks",
                    "sockets": [
                        {
                            "name": "schedule in",
                            "type": "number",
                            "value": 1,
                            "min": 0
                        },
                        {
                            "name": "secs"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "aa146082-9a9c-4ae7-a409-a89e84dc113a",
                    "script": "range({{1}}).forEach(function(idx, item){local.count## = idx;[[1]]});",
                    "help": "repeat the contained blocks so many times",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "count##"
                                }
                            ],
                            "script": "local.count##",
                            "type": "number"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "repeat",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b7079d91-f76d-41cc-a6aa-43fc2749429c",
                    "script": "runtime.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}));",
                    "help": "send this message to any listeners",
                    "sockets": [
                        {
                            "name": "broadcast",
                            "type": "string",
                            "value": "ack",
                            "suffix": "message"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d175bd7d-c7fd-4465-8b1f-c82687f35577",
                    "script": "runtime.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}, {detail: {{2}}}));",
                    "help": "send this message with an object argument to any listeners",
                    "sockets": [
                        {
                            "name": "broadcast",
                            "type": "string",
                            "value": "ping"
                        },
                        {
                            "name": "message with data",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "3931a20c-f510-45e4-83d2-4005983d5cae",
                    "script": "runtime.stage.addEventListener(\"wb_\" + {{1}}, function(){[[1]]});",
                    "help": "add a listener for the given message, run these blocks when it is received",
                    "sockets": [
                        {
                            "name": "when I receive",
                            "type": "string",
                            "value": "ack",
                            "suffix": "message"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "a0496339-c405-4d1c-8185-9bc211bf5a56",
                    "script": "runtime.stage.addEventListener(\"wb_\" + {{1}}, function(event){local.data##=event.detail;[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "data##"
                                }
                            ],
                            "script": "local.data##",
                            "type": "any"
                        }
                    ],
                    "help": "add a listener for the given message which receives data, run these blocks when it is received",
                    "sockets": [
                        {
                            "name": "when I receive",
                            "type": "string",
                            "value": "ping",
                            "suffix": "message with data"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "b1e43170-800a-4e9b-af82-0ed5c62c47a0",
                    "script": "while({{1}}){[[1]]}",
                    "help": "repeat until the condition is false",
                    "sockets": [
                        {
                            "name": "forever if",
                            "type": "boolean",
                            "value": "false"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "20ba3e08-74c0-428e-b612-53545de63ce0",
                    "script": "if({{1}}){[[1]]}",
                    "help": "run the following blocks only if the condition is true",
                    "sockets": [
                        {
                            "name": "if",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "6dddaf61-caf0-4976-a3f1-9d9c3bbbf5a4",
                    "script": "if( ! {{1}} ){ [[1]] }",
                    "help": "run the  blocks if the condition is not true",
                    "sockets": [
                        {
                            "name": "if not",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "AB5EB656-EF22-4DD3-9B5B-9A5187DF2F2F",
                    "script": "(({{1}}) ? ({{2}}) : ({{3}}))",
                    "help": "select a result based on a condition",
                    "type": "any",
                    "sockets": [
                        {
                            "name": "if",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "then",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "else",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "5a09e58a-4f45-4fa8-af98-84de735d0fc8",
                    "script": "while(!({{1}})){[[1]]}",
                    "help": "repeat forever until condition is true",
                    "sockets": [
                        {
                            "name": "repeat until",
                            "type": "boolean"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
        "sectionkey": "datablock",
        "name": "DataBlock",
        "help": "Retrieve Remote Data",
        "blocks": [
            {
                "blocktype": "step",
                "id": "744f4e58-b99e-4df5-9f1a-27c03c312811",
                "script": "local.datablock## = new DataBlock({{1}});",
                "locals": [
                    {
                        "blocktype": "expression",
                        "sockets": [
                            {
                                "name": "datablock##"
                            }
                        ],
                        "script": "local.datablock##",
                        "type": "datablock"
                    }
                ],
                "help": "create a simple datablock",
                "sockets": [
                    {
                        "name": "datablock ## url",
                        "type": "string",
                        "value": "data.gc.ca/data/api/action/package_show?id=6a26595e-3b66-4591-b795-87702ed5d58e"
                    }
                ]
            },
            {
                "blocktype": "step",
                "id": "332d17f7-01f1-400f-b011-d07a91caf0d9",
                "script": "{{1}}.getData();",
                "help": "retrieve data from website",
                "sockets": [
                    {
                        "name": "retrieve data",
                        "type": "datablock"
                    }
                ]
            }
        ]
    }
            
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "date",
            "name": "Date",
            "help": "Date blocks are used to work with dates and times",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "31007d66-3b78-43d8-a295-89bc81cb62d9",
                    "script": "local.date## = new Date();",
                    "help": "create a date block",
                    "sockets": [
                        {
                            "name": "date##"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "expression",
                            "type": "date",
                            "script": "local.date##",
                            "help": "current location",
                            "sockets": [
                                {
                                    "name": "date##"
                                }
                            ]
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "795bacf1-3abd-4e04-b181-baab9bcf6721",
                    "type": "number",
                    "script": "{{1}}.getFullYear()",
                    "help": "get the year (four digits)",
                    "sockets": [
                        {
                            "name": "get the year",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1a14fa64-bf53-4584-95fe-9d6bf0cc823a",
                    "type": "number",
                    "script": "({{1}}.getMonth() + 1)",
                    "help": "get the month (from 1-12)",
                    "sockets": [
                        {
                            "name": "get the month",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c2aa55be-42a0-4831-b554-b35680f81dfd",
                    "type": "number",
                    "script": "{{1}}.getDate()",
                    "help": "get the day of the month (from 1-31)",
                    "sockets": [
                        {
                            "name": "get the date",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f5958007-0839-4491-a176-e2599169cb16",
                    "type": "number",
                    "script": "{{1}}.getHours()",
                    "help": "get the hour (from 0-23)",
                    "sockets": [
                        {
                            "name": "get the hour",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "00128be4-a08d-44cc-99a1-47eaaff6ecf4",
                    "type": "number",
                    "script": "{{1}}.getMinutes()",
                    "help": "get the minutes (from 0-59)",
                    "sockets": [
                        {
                            "name": "get the minutes",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f26108f4-3427-4489-abd3-af9e26315f2f",
                    "type": "number",
                    "script": "{{1}}.getSeconds()",
                    "help": "get the seconds (from 0-59)",
                    "sockets": [
                        {
                            "name": "get the seconds",
                            "type": "date",
            				"block": ""
                        }
                    ]
                }
            ]
        }
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "facebook",
            "name": "Facebook",
            "help": "Blocks for interacting with Facebook",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "4a2fd78c-4d0e-4c96-8ec3-52a96b2d6920",
                    "script": "FB.api(\"/me/feed/\", \"post\", { message : {{1}} }, $.noop );",
                    "sockets": [
                        {
                            "name": "share",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4f41013c-b053-439a-b284-769525f6df5d",
                    "script": "fb.friends.data",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "all my friends"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9f987bdb-87f4-4cf7-aea7-6d282bc0276e",
                    "script": "fb.me",
                    "type": "object",
                    "sockets": [
                        {
                            "name": "me"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c290da4a-c84d-46ac-a6c8-20b367283ea1",
                    "script": "{{1}}.name",
                    "type": "string",
                    "sockets": [
                        {
                            "name": "name of",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f0361c85-7ed9-4ecf-b5dc-c08da20034e1",
                    "script": "(function(){var img = new Image(); img.src=\"https://graph.facebook.com/\" + {{1}}.id + \"/picture\"; return img;})",
                    "type": "image",
                    "sockets": [
                        {
                            "name": "image of",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6a4bbc09-5782-43b9-968b-4610c7664d29",
                    "type": "string",
                    "script": "\"https://graph.facebook.com/\" + {{1}}.id + \"/picture\"",
                    "sockets": [
                        {
                            "name": "images url of",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "ac41fb9e-c0c6-4e41-b190-87ba3fdb258d",
                    "script": "(function(){var correct = {id: \"\", name: \"\"}; $.each( fb.friends.data , function(i, user) { if( user.name.indexOf( {{1}} ) != -1 ) correct = user; } ); return correct;})()",
                    "type": "object",
                    "sockets": [
                        {
                            "name": "friend with name like",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "cc6fa7cf-fa7e-47fc-b97a-27f5c83d8d4b",
                    "script": "FB.api( \"/search\", { \"type\" : \"place\", \"center\" : \"{{1}}.latitude,{{1}}.longitude\", \"distance\": \"1000\" }, function(r){ FB.api(\"/me/feed/\", \"post\", { place : r.data[0].id }, $.noop ); } );",
                    "sockets": [
                        {
                            "name": "checkin at",
                            "type": "location"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "geolocation",
            "name": "Geolocation",
            "help": "Geolocation blocks are for getting your position on Earth",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "0da815af-6010-48b6-838d-f7dd0999b07d",
                    "script": "runtime.location.watchPosition(function(){[[1]]});",
                    "help": "called every time current location is updated",
                    "sockets": [
                        {
                            "name": "track my location"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "expression",
                            "type": "location",
                            "script": "runtime.location.currentLocation",
                            "help": "current location",
                            "sockets": [
                                {
                                    "name": "my location"
                                }
                            ]
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "a7b25224-a030-4cf5-8f30-026a379d958b",
                    "script": "runtime.location.whenWithinXOf({{1}},{{2}},function(){[[1]]});",
                    "help": "script to call when the distance from a position is less than specified distance",
                    "sockets": [
                        {
                            "name": "when within",
                            "type": "number",
                            "value": 1,
                            "min": 0
                        },
                        {
                            "name": "km of",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e3bcf430-979b-4fff-a856-d10071c63708",
                    "script": "runtime.location.distance({{1}},{{2}})",
                    "type": "number",
                    "help": "return distance in kilometers between two locations",
                    "sockets": [
                        {
                            "name": "distance between",
                            "type": "location"
                        },
                        {
                            "name": "and",
                            "type": "location"
                        },
                        {
                            "name": "in km"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "84583276-c54c-4db0-b703-e0a7bdc81e71",
                    "script": "{{1}}.latitude",
                    "type": "number",
                    "help": "returns the latitude of a location",
                    "sockets": [
                        {
                            "name": "latitude",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "0afffda9-ef4f-40dc-8ac7-96354417030e",
                    "script": "{{1}}.longitude",
                    "type": "number",
                    "help": "returns the longitude of a location",
                    "sockets": [
                        {
                            "name": "longitude",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "36d3af40-e1ae-4e72-9d7e-26c64938c6ba",
                    "script": "{{1}}.altitude",
                    "type": "number",
                    "help": "returns the altitude of a location, or null if not available",
                    "sockets": [
                        {
                            "name": "altitude (m)",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "86c429bf-2d8d-45fc-8869-7d93f3821032",
                    "script": "{{1}}.heading",
                    "type": "number",
                    "help": "returns the heading of a location update, if moving",
                    "sockets": [
                        {
                            "name": "heading (degrees from north)",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5454a36d-ed35-4c7e-880a-31849d6bbe98",
                    "script": "{{1}}.speed",
                    "type": "number",
                    "help": "returns the speed of a location update, if moving",
                    "sockets": [
                        {
                            "name": "speed (m/s)",
                            "type": "location"
                        }
                    ]
                }
            ]
        }
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "images",
            "name": "Images",
            "help": "Image blocks are for loading image files to use in other blocks and for manipulating images. See Sprite and Canvas menus.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "7c40299d-ca48-4aba-a326-45ccb5f9d37b",
                    "script": "local.image##=new Image();local.image##.src={{1}};",
                    "help": "Create a new image from a URL",
                    "sockets": [
                        {
                            "name": "load image##",
                            "type": "url"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "asset",
                            "type": "image",
                            "script": "local.image##",
                            "help": "reference to an image",
                            "sockets": [
                                {
                                    "name": "image##"
                                }
                            ]
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1a6150d8-b3d5-46e3-83e5-a4fe3b00f7db",
                    "script": "local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y);",
                    "help": "draw the HTML &lt;img&gt; into the canvas without resizing",
                    "sockets": [
                        {
                            "name": "draw image",
                            "type": "image"
                        },
                        {
                            "name": "at point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "da300b03-1d39-4865-ab99-beec07b53bb2",
                    "script": "local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y,{{2}}.w,{{2}}.h);",
                    "help": "draw the HTML &lt;img&gt; into the canvas sized to the given dimension",
                    "sockets": [
                        {
                            "name": "draw image",
                            "type": "image"
                        },
                        {
                            "name": "in rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5514e085-970f-48c2-b6bf-a443488c3c07",
                    "script": "local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);",
                    "help": "draw a rect extracted from image into a rect specified on the canvas",
                    "sockets": [
                        {
                            "name": "draw a rect",
                            "type": "rect"
                        },
                        {
                            "name": "from image",
                            "type": "image"
                        },
                        {
                            "name": "to rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6c79800c-af02-48e1-b9cb-d043e8299f7a",
                    "script": "local.imageData## = local.ctx.createImageData({{1}}.w,{{1}}.h);",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "imageData##"
                                }
                            ],
                            "script": "local.imageData##",
                            "type": "imagedata"
                        }
                    ],
                    "help": "initialize a new imageData with the specified dimensions",
                    "sockets": [
                        {
                            "name": "create ImageData ImageData## with size",
                            "type": "size"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "2137c296-1666-499c-871c-60226188f031",
                    "script": "local.imageData## = local.ctx.createImageData({{1}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "imageData##"
                                }
                            ],
                            "script": "local.imageData##",
                            "type": "imagedata"
                        }
                    ],
                    "help": "initialized a new imageData the same size as an existing imageData",
                    "sockets": [
                        {
                            "name": "create ImageData ImageData## from imageData",
                            "type": "imageData"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a2745268-a506-46b6-8d96-e4c275dd5584",
                    "script": "local.imageData## = local.ctx.getImageData({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "imageData##"
                                }
                            ],
                            "script": "local.imageData##",
                            "type": "imagedata"
                        }
                    ],
                    "help": "returns the image data from the specified rectangle",
                    "sockets": [
                        {
                            "name": "get imageData## for rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "207c93f2-d8c7-4b87-99bf-d79b61faafc2",
                    "script": "local.ctx.putImageData({{1}},{{2}}.x,{{2}}.y);",
                    "help": "draw the given image data into the canvas at the given coordinates",
                    "sockets": [
                        {
                            "name": "draw imageData",
                            "type": "imagedata"
                        },
                        {
                            "name": "at point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "52ecfee7-005f-45ef-8c2a-df7b15dd974f",
                    "script": "local.ctx.putImageData({{2}},{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "help": "draw the given image data into the canvas from the given rect to the given position",
                    "sockets": [
                        {
                            "name": "draw a rect",
                            "type": "rect"
                        },
                        {
                            "name": "from imageData",
                            "type": "imagedata"
                        },
                        {
                            "name": "at point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "578ba232-d1c2-4354-993d-8538bbaf4de2",
                    "script": "{{1}}.width",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "imageData",
                            "type": "imagedata",
                            "suffix": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "01bc0775-1a0b-4d0f-b009-786e18417703",
                    "script": "{{1}}.height",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "imageData",
                            "type": "imagedata",
                            "suffix": "height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5e97eed9-acf7-45af-838e-fae9bf85921c",
                    "script": "{{1}}.data",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "imageData",
                            "type": "imagedata",
                            "suffix": "as array"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7fa79655-4c85-45b3-be9e-a19aa038feae",
                    "script": "runtime.preloadImage('##', {{1}});",
                    "sockets": [
                        {
                            "name": "create ImageData image## from url",
                            "type": "string"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "asset",
                            "sockets": [
                                {
                                    "name": "image ##"
                                }
                            ],
                            "script": "runtime.images[\"##\"]",
                            "type": "image"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a7e59ad2-47ab-4240-8801-5d66d8f57fc9",
                    "script": "{{1}}.width",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "image",
                            "type": "image",
                            "suffix": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d9c7d36e-d15f-48a9-9423-1a6497727221",
                    "script": "{{1}}.height",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "image",
                            "type": "image",
                            "suffix": "height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8d90b1fa-2791-4381-add5-c3c5d238ac0d",
                    "script": "{{1}}.width",
                    "type": "string",
                    "sockets": [
                        {
                            "name": "image",
                            "type": "image",
                            "suffix": "url"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "math",
            "name": "Math",
            "help": "Math blocks are for manipulating numbers",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "CC2FD987-1EFC-483C-BDA3-71C839E4BAC4",
                    "type": "number",
                    "script": "({{1}}E{{2}})",
                    "help": "scientific notation",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "× 10 ^",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "exponent"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "406d4e12-7dbd-4f94-9b0e-e2a66d960b3c",
                    "type": "number",
                    "script": "({{1}} + {{2}})",
                    "help": "sum of the two operands",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "+",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "addition",
                        "plus",
                        "sum"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d7082309-9f02-4cf9-bcd5-d0cac243bff9",
                    "type": "number",
                    "script": "({{1}} - {{2}})",
                    "help": "difference of the two operands",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "-",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "subtraction",
                        "minus",
                        "difference"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "bd3879e6-e440-49cb-b10b-52d744846341",
                    "type": "number",
                    "script": "({{1}} * {{2}})",
                    "help": "product of the two operands",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "×",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "multiplication",
                        "times",
                        "product"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7f51bf70-a48d-4fda-ab61-442a0766abc4",
                    "type": "number",
                    "script": "({{1}} / {{2}})",
                    "help": "quotient of the two operands",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "÷",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "division",
                        "divide",
                        "quotient"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e3a5ea20-3ca9-42cf-ac02-77ff06836a7e",
                    "type": "boolean",
                    "script": "({{1}} === {{2}})",
                    "help": "two operands are equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "=",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "comparison",
                        "equal"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "11f59515-8061-4c96-a358-4944ad58cd18",
                    "type": "boolean",
                    "script": "({{1}} !== {{2}})",
                    "help": "two operands are not equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "≠",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "comparison",
                        "not equal"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d753757b-a7d4-4d84-99f1-cb9b8c7e62da",
                    "type": "boolean",
                    "script": "({{1}} < {{2}})",
                    "help": "first operand is less than second operand",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "<",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "comparison",
                        "less than"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "A6725EBC-C1A2-4BB4-8A34-396F2CC5D833",
                    "type": "boolean",
                    "script": "({{1}} <= {{2}})",
                    "help": "first operand is less than or equal to second operand",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0                        },
                        {
                            "name": "≤",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "comparison",
                        "less than or equal to"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5a1f5f68-d74b-4154-b376-6a0200f585ed",
                    "type": "boolean",
                    "script": "({{1}} > {{2}})",
                    "help": "first operand is greater than second operand",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": ">",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "comparison",
                        "greater than"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "75B859E7-9244-45DE-BA08-C3D09F67069F",
                    "type": "boolean",
                    "script": "({{1}} >= {{2}})",
                    "help": "first operand is greater than or equal to second operand",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "≥",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "comparison",
                        "greater than or equal to"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a2647515-2f14-4d0f-84b1-a6e288823630",
                    "type": "number",
                    "script": "({{1}} % {{2}})",
                    "help": "modulus of a number is the remainder after whole number division",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "mod",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "modulus",
                        "modulo"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4f7803c0-24b1-4a0c-a461-d46acfe9ab25",
                    "type": "number",
                    "script": "Math.round({{1}})",
                    "help": "rounds to the nearest whole number",
                    "sockets": [
                        {
                            "name": "round",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "rounding"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c38383df-a765-422e-b215-7d1cfb7557a1",
                    "type": "number",
                    "script": "Math.abs({{1}})",
                    "help": "converts a negative number to positive, leaves positive alone",
                    "sockets": [
                        {
                            "name": "absolute value of",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "keywords": [
                        "absolute value"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "46bcac2d-eb76-417c-81af-cb894a54a86c",
                    "type": "number",
                    "script": "Math.floor({{1}})",
                    "help": "rounds down to nearest whole number",
                    "sockets": [
                        {
                            "name": "floor of",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "keywords": [
                        "floor",
                        "rounding"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4945df27-f4f3-490b-94ae-67c7081f744b",
                    "type": "number",
                    "script": "Math.ceil({{1}})",
                    "help": "rounds up to nearest whole number",
                    "sockets": [
                        {
                            "name": "ceiling of",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "keywords": [
                        "ceiling",
                        "rounding"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "24A7ACF3-13A7-4150-8740-CB9F2B963789",
                    "type": "number",
                    "script": "math.runtime.gcd({{1}},{{2}})",
                    "help": "greatest common divisor - the largest number that is a factor of both arguments",
                    "sockets": [
                        {
                            "name": "gcd of",
                            "type": "number",
                            "value": "1"
                        },
                        {
                            "name": "and",
                            "type": "number",
                            "value": "2"
                        }
                    ],
                    "keywords": [
                        "gcd"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "E764FF62-BB0D-477E-85A2-8C0EA050904E",
                    "type": "number",
                    "script": "runtime.math.lcm({{1}},{{2}})",
                    "help": "least common multiple - the smallest number divisible by both arguments",
                    "sockets": [
                        {
                            "name": "lcm of",
                            "type": "number",
                            "value": "1"
                        },
                        {
                            "name": "and",
                            "type": "number",
                            "value": "2"
                        }
                    ],
                    "keywords": [
                        "lcm"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "F3A723AF-B17C-4549-AC7F-2FFF451A2B1E",
                    "type": "number",
                    "script": "Math.max({{1}},{{2}})",
                    "help": "the larger of the two arguments",
                    "sockets": [
                        {
                            "name": "maximum of",
                            "type": "number",
                            "value": "1"
                        },
                        {
                            "name": "or",
                            "type": "number",
                            "value": "2"
                        }
                    ],
                    "keywords": [
                        "maximum"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "FEA46803-0FEF-418E-9B7B-C289BE50A060",
                    "type": "number",
                    "script": "Math.min({{1}},{{2}})",
                    "help": "the smaller of the two arguments",
                    "sockets": [
                        {
                            "name": "minimum of",
                            "type": "number",
                            "value": "1"
                        },
                        {
                            "name": "or",
                            "type": "number",
                            "value": "2"
                        }
                    ],
                    "keywords": [
                        "minimum"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5178A7D0-9D89-49EC-AA53-D3FA9AEDA6A4",
                    "type": "number",
                    "script": "gamma({{1}}+1)",
                    "help": "the product of all numbers less than or equal to the input - technically, Γ(n+1)",
                    "sockets": [
                        {
                            "name": "factorial of",
                            "type": "number",
                            "value": "5"
                        }
                    ],
                    "keywords": [
                        "factorial"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "ce4bf2bc-a06a-47f4-ac05-df2213d087a5",
                    "type": "number",
                    "script": "Math.cos(deg2rad({{1}}))",
                    "help": "ratio of the length of the adjacent side to the length of the hypotenuse",
                    "sockets": [
                        {
                            "name": "cosine of",
                            "type": "number",
                            "value": 10,
                            "suffix": "degrees"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "cosine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1a8f6a28-14e9-4400-8e80-31217309ebc9",
                    "type": "number",
                    "script": "Math.sin(deg2rad({{1}}))",
                    "help": "ratio of the length of the opposite side to the length of the hypotenuse",
                    "sockets": [
                        {
                            "name": "sine of",
                            "type": "number",
                            "value": 10,
                            "suffix": "degrees"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "sine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "fcecb61b-7fd9-4a92-b6cb-77d0a2fc8541",
                    "type": "number",
                    "script": "Math.tan(deg2rad({{1}}))",
                    "help": "ratio of the length of the opposite side to the length of the adjacent side",
                    "sockets": [
                        {
                            "name": "tangent of",
                            "type": "number",
                            "value": 10,
                            "suffix": "degrees"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "tangent"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9bf66bb0-c182-42e5-b3a7-cf10de26b08c",
                    "type": "number",
                    "script": "rad2deg(Math.acos({{1}}))",
                    "help": "inverse of cosine",
                    "sockets": [
                        {
                            "name": "arccosine degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "arccosine",
                        "cosine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "92f79a75-e3f4-4fc7-8f17-bf586aef180b",
                    "type": "number",
                    "script": "rad2deg(Math.asin({{1}}))",
                    "help": "inverse of sine",
                    "sockets": [
                        {
                            "name": "arcsine degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "arcsine",
                        "sine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1f5ee069-148e-4e4a-a514-5179af86be15",
                    "type": "number",
                    "script": "rad2deg(Math.atan({{1}}))",
                    "help": "inverse of tangent",
                    "sockets": [
                        {
                            "name": "arctangent degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "arctangent",
                        "tangent"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "52AA07F8-7C71-4BE1-902A-3F3AC88822B0",
                    "type": "number",
                    "script": "Math.cosh(deg2rad({{1}}))",
                    "help": "ratio of the length of the adjacent side to the length of the hypotenuse",
                    "sockets": [
                        {
                            "name": "hyperbolic cosine of",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "degrees"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "hyperbolic",
                        "cosh",
                        "cosine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "D5D68651-B6A1-44EE-8246-87060C62860F",
                    "type": "number",
                    "script": "Math.sinh(deg2rad({{1}}))",
                    "help": "ratio of the length of the opposite side to the length of the hypotenuse",
                    "sockets": [
                        {
                            "name": "hyperbolic sine of",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "degrees"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "hyperbolic",
                        "sinh",
                        "sine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "72442F9D-0AA5-4A0E-A3E0-7D6E46A944CF",
                    "type": "number",
                    "script": "Math.tanh(deg2rad({{1}}))",
                    "help": "ratio of the length of the opposite side to the length of the adjacent side",
                    "sockets": [
                        {
                            "name": "hyperbolic tangent of",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "degrees"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "hyperbolic",
                        "tanh",
                        "tangent"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8BCC0FB3-878C-4BA8-A4A1-A73C6FE9F71B",
                    "type": "number",
                    "script": "rad2deg(Math.acosh({{1}}))",
                    "help": "inverse of hyperbolic cosine",
                    "sockets": [
                        {
                            "name": "hyperbolic arccosine degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "hyperbolic",
                        "acosh",
                        "arccosine",
                        "cosine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "03A6DA1C-F1AB-499C-A97E-0F59E0A6A371",
                    "type": "number",
                    "script": "rad2deg(Math.asinh({{1}}))",
                    "help": "inverse of hyperbolic sine",
                    "sockets": [
                        {
                            "name": "hyperbolic arcsine degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "hyperbolic",
                        "asinh",
                        "arcsine",
                        "sine"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "A114C2B7-3334-4DCB-9418-F1BB40F8604D",
                    "type": "number",
                    "script": "rad2deg(Math.atanh({{1}}))",
                    "help": "inverse of hyperbolic tangent",
                    "sockets": [
                        {
                            "name": "hyperbolic arctangent degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ],
                    "keywords": [
                        "trigonometric",
                        "hyperbolic",
                        "atanh",
                        "arctangent",
                        "tangent"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8a4a81d8-de25-46f0-b610-97d4f6fffbff",
                    "type": "number",
                    "script": "Math.pow({{1}}, {{2}})",
                    "help": "multiply a number by itself the given number of times",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": 10
                        },
                        {
                            "name": "to the power of",
                            "type": "number",
                            "value": 2
                        }
                    ],
                    "keywords": [
                        "power",
                        "exponent"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "668798a3-f15e-4839-b4b3-da5db380aa5a",
                    "type": "number",
                    "script": "Math.sqrt({{1}})",
                    "help": "the square root is the same as taking the power of 1/2",
                    "sockets": [
                        {
                            "name": "square root of",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "keywords": [
                        "exponent",
                        "square root"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "30513651-eab2-4f85-9ec5-725df5d62851",
                    "type": "number",
                    "script": "(Math.log({{2}})/Math.log({{1}}))",
                    "help": "logarithm",
                    "sockets": [
                        {
                            "name": "log base",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "of",
                            "type": "number",
                            "value": "1"
                        }
                    ],
                    "keywords": [
                        "exponent",
                        "logarithm"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "93708036-080B-49FE-942E-E65CBC72BE44",
                    "script": "Math.E",
                    "type": "number",
                    "help": "base of natural logarithm",
                    "sockets": [
                        {
                            "name": "e"
                        }
                    ],
                    "keywords": [
                        "exponent",
                        "logarithm"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a34c51d9-bfa0-49ad-8e7d-b653611836d3",
                    "script": "Math.PI",
                    "type": "number",
                    "help": "pi is the ratio of a circle's circumference to its diameter",
                    "sockets": [
                        {
                            "name": "pi"
                        }
                    ],
                    "keywords": [
                        "pi",
                        "circle",
                        "circumference"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "da2c8203-bf80-4617-a762-92dd4d7bfa27",
                    "script": "(Math.PI * 2)",
                    "type": "number",
                    "help": "tau is 2 times pi, a generally more useful number",
                    "sockets": [
                        {
                            "name": "tau"
                        }
                    ],
                    "keywords": [
                        "pi",
                        "circle",
                        "circumference"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "076E0F96-52EA-466E-84BC-FE41A2399510",
                    "type": "number",
                    "script": "({{1}} & {{2}})",
                    "help": "bitwise AND of the two operands - useful to select only specific bits",
                    "sockets": [
                        {
                            "name": "bitwise",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "and",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "bitwise",
                        "and"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "74C039B2-988F-4571-8AEB-C79F772D8F2D",
                    "type": "number",
                    "script": "({{1}} | {{2}})",
                    "help": "bitwise OR of the two operands - useful to set specific bits",
                    "sockets": [
                        {
                            "name": "bitwise",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "or",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "bitwise",
                        "or"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "DA40D6D3-0052-4187-92EB-2F4C0A64C39F",
                    "type": "number",
                    "script": "({{1}} ^ {{2}})",
                    "help": "bitwise XOR of the two operands - useful to toggle specific bits",
                    "sockets": [
                        {
                            "name": "bitwise",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "xor",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "bitwise",
                        "xor"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "D58C0616-1CE4-4588-90C5-B57E1221E831",
                    "type": "number",
                    "script": "({{1}} &~ {{2}})",
                    "help": "bitwise NAND of the two operands - useful to unset specific bits",
                    "sockets": [
                        {
                            "name": "bitwise",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "nand",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "keywords": [
                        "bitwise",
                        "nand"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "43109945-DA0A-4B16-84A5-17727C0EF994",
                    "type": "number",
                    "script": "({{1}} << Math.floor({{2}}))",
                    "help": "left bit shift",
                    "sockets": [
                        {
                            "name": "bit shift",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "left by",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "bits"
                        }
                    ],
                    "keywords": [
                        "bitwise",
                        "shift"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4EE8184B-52A8-40E8-ACC6-C7D21BA90742",
                    "type": "number",
                    "script": "({{1}} >> Math.floor({{2}}))",
                    "help": "right bit shift",
                    "sockets": [
                        {
                            "name": "bit shift",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "right by",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "bits"
                        }
                    ],
                    "keywords": [
                        "bitwise",
                        "shift"
                    ]
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "be2c0634-28d8-4f64-97e0-48ed66877ba6",
            "type": "number",
            "script": "runtime.math.summation({{1}});",
            "help": "sum all of the numbers from 1 to N",
            "sockets": [
                {
                    "name": "Summation",
                    "type": "number",
                    "value": 0
                }
            ],
            "keywords": [
                "Summation",
                "1 to N"
            ]
        },
        {
            "blocktype": "expression",
            "id": "5d547a3d-886a-40f9-86fa-b3d68d3db228",
            "type": "number",
            "script": "runtie.math.inclusiveSummation({{1}}, {{2}});",
            "help": "sum all of the numbers from N to M",
            "sockets": [
                {
                    "name": "Inclusive Summation"
                },
                {
                    "name": "from ",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "to",
                    "type": "number",
                    "value": 0
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "3348490a-2b56-453e-9dfb-bfecd4cac71f",
            "type": "number",
            "script": "runtime.math.sumOfFirstNMultiples({{2}}, {{1}});",
            "help": "sum of the first N multiples of M",
            "sockets": [
                {
                    "name": "Multiple Summation"
                },
                {
                    "name": "First ",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "multiples of",
                    "type": "number",
                    "value": 0
                }
            ],
            "keywords": [
                "Multiple Summation",
                "multiple"
            ]
        }
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "matrix",
            "name": "Matrix",
            "help": "Matrix blocks can be used to store more complex tranformations on the canvas",
            "blocks": [
                {
                    "blocktype": "step",
                    "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.transform.apply(local.ctx, {{1}});",
                    "help": "transform by an arbitrary matrix [a,b,c,d,e,f]",
                    "sockets": [
                        {
                            "name": "transform by 6-matrix",
                            "type": "array"
                        }
                    ],
                    "id": "b65e02c5-b990-4ceb-ab18-2593337103d9"
                },
                {
                    "blocktype": "step",
                    "id": "e4787583-77ce-4d45-a863-50dcb4e87af0",
                    "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});",
                    "help": "set transform to an arbitrary array [a,b,c,d,e,f]",
                    "sockets": [
                        {
                            "name": "set transform to 6-matrix",
                            "type": "array"
                        }
                    ]
                }
            ]
        }
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "motion",
            "name": "Motion",
            "help": "Motion blocks are for detecting the motion of devices equipped with accelerometers",
            "blocks": [
                {
                	"blocktype": "expression",
                	"id": "f1a792df-9508-4ad5-90f8-aa9cd60d46bc",
                	"type": "string",
                	"script": "runtime.accelerometer.direction",
                	"help": "which way is the device moving?",
                	"sockets": [
                		{
                			"name": "tilt direction"
                		}
                	]
                },
                {
                	"blocktype": "eventhandler",
                	"id": "74f8f7c0-f2f9-4ea4-9888-49110785b26d",
                	"script": "runtime.accelerometer.whenTurned({{1}}, function(){[[1]]});",
                	"help": "handler for accelerometer events",
                	"sockets": [
                		{
                			"name": "when device turned",
                			"type": "string",
                			"options": "directions"
                		}
                	]
                }
            ]
        }
        
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "objects",
            "name": "Objects",
            "help": "Objects are key/value containers. Keys must be strings, but values can be any type.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "26ee5e5c-5405-453f-8941-26ac6ea009ec",
                    "script": "local.object## = {};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "object##"
                                }
                            ],
                            "script": "local.object##",
                            "type": "object"
                        }
                    ],
                    "help": "create a new, empty object",
                    "sockets": [
                        {
                            "name": "new object##"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "ee86bcd0-10e3-499f-9a81-6738374c0c1f",
                    "script": "{{1}}[{{2}}] = {{3}};",
                    "help": "set the key/value of an object",
                    "sockets": [
                        {
                            "name": "object",
                            "type": "any"
                        },
                        {
                            "name": "key",
                            "type": "string"
                        },
                        {
                            "name": "= value",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7ca6df56-7c25-4c8c-98ef-8dfef90eff36",
                    "script": "{{1}}[{{2}}]",
                    "type": "any",
                    "help": "return the value of the key in an object",
                    "sockets": [
                        {
                            "name": "object",
                            "type": "any"
                        },
                        {
                            "name": "value at key",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "cd07f8d6-d2cb-475b-b1fb-1ee8392e0b14",
                    "script": "{{1}}[{{2}}].apply({{1}},{{3}});",
                    "help": "call instance method",
                    "sockets": [
                        {
                            "name": "object",
                            "type": "any"
                        },
                        {
                            "name": "method name",
                            "type": "string"
                        },
                        {
                            "name": "arguments",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "322da80d-d8e2-4261-bab7-6ff0ae89e5f4",
                    "script": "Object.keys({{1}}).forEach(function(key){local.key = key; local.item = {{1}}[key]; [[1]] });",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "key"
                                }
                            ],
                            "script": "local.key",
                            "help": "key of current item in object",
                            "type": "string"
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
                    "help": "run the blocks with each item of a object",
                    "sockets": [
                        {
                            "name": "for each item in",
                            "type": "any",
                            "suffix": "do"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "paths",
            "name": "Paths",
            "help": "Path blocks are for construction more complex shapes for drawing, masking, and other uses.",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "5bd66c5d-1a66-4cbb-8984-a4361270c2c6",
                    "script": "local.ctx.beginPath();[[1]];local.ctx.closePath();",
                    "help": "create a path, run the contained steps, close the path",
                    "sockets": [
                        {
                            "name": "with path"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f9c9328b-746c-468b-90fa-4d3da4cb1479",
                    "script": "local.ctx.moveTo({{1}}.x,{{1}}.y);",
                    "help": "move to...",
                    "sockets": [
                        {
                            "name": "move to point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1dec1d26-282b-4d14-b943-6c06ebdd5ceb",
                    "script": "local.ctx.lineTo({{1}}.x,{{1}}.y);",
                    "help": "line to...",
                    "sockets": [
                        {
                            "name": "line to point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e79ff085-fb9a-46cb-8e4f-f61c5563d73b",
                    "script": "local.ctx.quadraticCurveTo({{2}}.x, {{2}}.y, {{1}}.x, {{1}}.y);",
                    "help": "quad curve to ...",
                    "sockets": [
                        {
                            "name": "quadradic curve to point",
                            "type": "point"
                        },
                        {
                            "name": "with control point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f311980c-eb49-4e42-9e9b-a4bdf428d5b5",
                    "script": "local.ctx.bezierCurveTo({{2}}.x,{{2}}.y,{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y);",
                    "help": "bezier curve to...",
                    "sockets": [
                        {
                            "name": "bezier curve to point",
                            "type": "point"
                        },
                        {
                            "name": "with control points",
                            "type": "point"
                        },
                        {
                            "name": "and",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "adf632ea-02e1-4087-8dfd-91e41ec520b1",
                    "script": "local.ctx.arcTo({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y,{{3}});",
                    "help": "I wish I understood this well enough to explain it better",
                    "sockets": [
                        {
                            "name": "arc to point1",
                            "type": "point"
                        },
                        {
                            "name": "point1",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 1.0,
                            "min": 0.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5b46a44d-6974-4eb9-ac35-ba1ec5a79304",
                    "script": "local.ctx.arc({{1}}.x,{{1}}.y,{{2}},deg2rad({{3}}),deg2rad({{4}}),{{5}});",
                    "help": "arc...",
                    "sockets": [
                        {
                            "name": "arc with origin",
                            "type": "point"
                        },
                        {
                            "name": "radius",
                            "type": "number",
                            "value": "1",
                            "min": 0
                        },
                        {
                            "name": "start angle",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        },
                        {
                            "name": "end angle",
                            "type": "number",
                            "value": 45,
                            "suffix": "degrees"
                        },
                        {
                            "name": "anticlockwise",
                            "type": "boolean",
                            "value": true
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "236e2fb4-3705-4465-9aa8-d7128e1f1c7f",
                    "script": "local.ctx.rect({{1}},{{1}},{{1}},{{1}});",
                    "help": "rect...",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e4198722-951c-4dd9-8396-a70813478152",
                    "script": "local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);",
                    "help": "circle...",
                    "sockets": [
                        {
                            "name": "circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "db455432-c7dd-4cba-af80-1802e38446c2",
                    "script": "local.ctx.clip();",
                    "help": "adds current path to the clip area",
                    "sockets": [
                        {
                            "name": "clip"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5b0fd9a6-39e7-4a70-86f8-1e7dc1c7166f",
                    "script": "local.ctx.isPointInPath({{1}}.x,{{1}}.y)",
                    "type": "boolean",
                    "help": "test a point against the current path",
                    "sockets": [
                        {
                            "name": "is point",
                            "type": "point",
                            "suffix": "in path?"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "points",
            "name": "Points",
            "help": "Point blocks represent and manipulate x,y coordinates.",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "71eb3271-6dc0-4a82-81cc-4c50d8acb9e7",
                    "script": "{x: {{1}}, y: {{2}} }",
                    "type": "point",
                    "help": "create a new point",
                    "sockets": [
                        {
                            "name": "point at x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "efe5e679-8336-4e5a-ade0-4bd930826096",
                    "type": "point",
                    "script": "{x: {{1}}[0], y: {{1}}[1]}",
                    "help": "convert array to point",
                    "sockets": [
                        {
                            "name": "point from array",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "29803c49-5bd5-4473-bff7-b3cf66ab9711",
                    "type": "point",
                    "script": "{x: randint(0, runtime.stage_width), y: randint(0, runtime.stage_height)}",
                    "help": "returns a point at a random location on the stage",
                    "sockets": [
                        {
                            "name": "random point"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "36f0eb56-9370-402d-83ef-99201a62c732",
                    "script": "{{1}}.x",
                    "type": "number",
                    "help": "get the x value of a point",
                    "sockets": [
                        {
                            "name": "point",
                            "type": "point",
                            "suffix": "x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "90b42cf3-185d-4556-b7e8-d9682c187425",
                    "script": "{{1}}.y",
                    "type": "number",
                    "help": "get the y value of a point",
                    "sockets": [
                        {
                            "name": "point",
                            "type": "point",
                            "suffix": "y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "743cba63-11d4-4a84-a3b6-a98480bdd731",
                    "script": "[{{1}}.x, {{1}}.y]",
                    "type": "array",
                    "help": "convert a point to an array",
                    "sockets": [
                        {
                            "name": "point",
                            "type": "point",
                            "suffix": "as array"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "random",
            "name": "Random",
            "help": "Various forms of randomness for your code",
            "blocks": [
            	{
            		"blocktype": "expression",
            		"id": "12488f92-1fc4-41fe-a882-95c5d5fe72dd",
            		"type": "number",
            		"script": "Math.random()",
            		"help": "returns a random number between 0.0 and 1.0",
            		"sockets": [
            			{
            				"name": "random float"
            			}
            		]
            	},
                {
                    "blocktype": "expression",
                    "id": "a35fb291-e2fa-42bb-a5a6-2124bb33157d",
                    "type": "number",
                    "script": "randint({{1}}, {{2}})",
                    "help": "random number between two numbers (inclusive)",
                    "sockets": [
                        {
                            "name": "pick random integer from",
                            "type": "number",
                            "value": 1
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4bc09592-ed3c-4a0c-b0bd-8e520d5385b6",
                    "type": "number",
                    "script": "noise({{1}},{{2}},{{3}})",
                    "help": "generates Perlin noise from 3 dimensions",
                    "sockets": [
                    	{
                    		"name": "noise from x",
                    		"type": "number",
                    		"value": 0.001
                    	},
                    	{
                    		"name": "y",
                    		"type": "number",
                    		"value": 0.002
                    	},
                    	{
                    		"name": "z",
                    		"type": "number",
                    		"value": 0.003
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "24bd9687-b29d-45af-9a00-b7961bcbd65d",
                    "type": "number",
                    "script": "noise({{1}},{{2}},1)",
                    "help": "generates Perlin noise from 2 dimensions",
                    "sockets": [
                    	{
                    		"name": "noise from x",
                    		"type": "number",
                    		"value": 0.001
                    	},
                    	{
                    		"name": "y",
                    		"type": "number",
                    		"value": 0.002
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e3a04097-3fb2-44f8-abe4-2047e15fab21",
                    "type": "number",
                    "script": "noise({{1}},1,1)",
                    "help": "generates Perlin noise from 1 dimension",
                    "sockets": [
                    	{
                    		"name": "noise from x",
                    		"type": "number",
                    		"value": 0.001
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "649ec162-8584-4aeb-b75d-2e55f0551015",
                    "type": "any",
                    "script": "choice({{1}})",
                    "help": "returns a random item from an array, without changing the array",
                    "sockets": [
                    	{
                    		"name": "choose item from",
                    		"type": "array"
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f444a3cd-2f1c-48e7-a2df-a2881e7a18fb",
                    "type": "any",
                    "script": "removeChoice({{1}})",
                    "help": "removes a random item from a array and returns the array",
                    "sockets": [
                    	{
                    		"name": "remove random item from",
                    		"type": "array"
                    	}
                    ]
                }
            ]
        }
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "rects",
            "name": "Rects",
            "help": "Rect blocks represent and manipulate rectangles represented by x,y coordinates for the top left corner of the rectangle, plus a size (width,height).",
            "blocks": [
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "67924ef4-71eb-4793-9599-d8605b14320a",
                    "script": "{x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}} }",
                    "type": "rect",
                    "sockets": [
                        {
                            "name": "rect at x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "with width",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "24b44fea-7be1-472a-a203-2a0d97515311",
                    "script": "{x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h}",
                    "type": "rect",
                    "sockets": [
                        {
                            "name": "rect at point",
                            "type": "point"
                        },
                        {
                            "name": "with size",
                            "type": "size"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "68c9cfd0-d06b-41ae-9eac-d762126f6bd7",
                    "script": "{x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] };",
                    "type": "rect",
                    "sockets": [
                        {
                            "name": "rect from array",
                            "type": "array"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "aed385a0-7439-4b36-ad3e-fd07c562523a",
                    "script": "{x: {{1}}.x, y: {{1}}.y}",
                    "type": "point",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "position"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "453db037-c418-467b-8808-52d84c7a3273",
                    "script": "{w: {{1}}.w, h: {{1}}.h}",
                    "type": "size",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "size"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "599f6375-e26e-414c-9740-fa9fcfc8ff00",
                    "script": "[{{1}}.x, {{1}}.y, {{1}}.w, {{1}}.h]",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "as array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c95a1658-e1ec-4500-8766-abab8f67f865",
                    "script": "{{1}}.x",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7ee1fb57-7a16-4eff-9077-ade7fad60e86",
                    "script": "{{1}}.y",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "79df9d07-6894-45bc-bcc8-fc565e66df0c",
                    "script": "{{1}}.w",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8ae2a7ee-712d-4288-ac55-957a7e2b2b72",
                    "script": "{{1}}.h",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "height"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);
(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sensing",
            "name": "Sensing",
            "help": "Sensing blocks are for getting information from the environment, like user responses, mouse clicks, keyboard presses, and the size of the drawing area.",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "916c79df-40f1-4280-a093-6d9dfe54d87e",
                    "script": "local.answer## = prompt({{1}});[[1]]",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "answer##"
                                }
                            ],
                            "type": "string",
                            "script": "local.answer##"
                        }
                    ],
                    "help": "Prompt the user for information",
                    "sockets": [
                        {
                            "name": "ask",
                            "type": "string",
                            "value": "What's your name?",
                            "suffix": "and wait"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2504cc6a-0053-4acc-8594-a00fa8a078cb",
                    "type": "number",
                    "script": "runtime.mouse_x",
                    "help": "The current horizontal mouse position",
                    "sockets": [
                        {
                            "name": "mouse x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "80600e66-f99e-4270-8c32-a2bb8d1dafe0",
                    "type": "number",
                    "script": "runtime.mouse_y",
                    "help": "the current vertical mouse position",
                    "sockets": [
                        {
                            "name": "mouse y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "ce1026a0-9acf-4d8f-a7c0-0759115af1ca",
                    "type": "boolean",
                    "script": "runtime.mouse_down",
                    "help": "true if the mouse is down, false otherwise",
                    "sockets": [
                        {
                            "name": "mouse down"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4321cef6-6365-4885-9a3c-1fd0db2b4eab",
                    "type": "boolean",
                    "script": "runtime.isKeyDown({{1}})",
                    "help": "is the given key down when this block is run?",
                    "sockets": [
                        {
                            "name": "key",
                            "type": "string",
                            "options": "keys",
                            "value": "a",
                            "suffix": "pressed?"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "048218dd-0b8d-4bc9-b310-480e93232665",
                    "type": "number",
                    "script": "runtime.stage_width",
                    "help": "width of the stage where scripts are run. This may change if the browser window changes",
                    "sockets": [
                        {
                            "name": "stage width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6f9031c6-579b-4e24-b5d1-f648aab6e0aa",
                    "type": "number",
                    "script": "runtime.stage_height",
                    "help": "height of the stage where scripts are run. This may change if the browser window changes.",
                    "sockets": [
                        {
                            "name": "stage height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f85d3bfd-b58c-458f-b4a9-68538302aa12",
                    "type": "number",
                    "script": "runtime.stage_center_x",
                    "help": "horizontal center of the stage",
                    "sockets": [
                        {
                            "name": "center x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "083bee4f-ee36-4a35-98df-587ed586d623",
                    "type": "number",
                    "script": "runtime.stage_center_y",
                    "help": "vertical center of the stage",
                    "sockets": [
                        {
                            "name": "center y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "76184edb-ac2c-4809-899d-7b105776ba12",
                    "type": "number",
                    "script": "randint(0,runtime.stage_width)",
                    "help": "return a number between 0 and the stage width",
                    "sockets": [
                        {
                            "name": "random x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8e749092-327d-4921-a50e-c87acefe7102",
                    "type": "number",
                    "script": "randint(0, runtime.stage_height)",
                    "help": "return a number between 0 and the stage height",
                    "sockets": [
                        {
                            "name": "random y"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6b924f28-9bba-4257-a80b-2f2a591128a5",
                    "script": "runtime.timer.reset();",
                    "help": "set the global timer back to zero",
                    "sockets": [
                        {
                            "name": "reset timer"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f04b0e0a-b591-4eaf-954d-dea412cbfd61",
                    "type": "number",
                    "script": "runtime.timer.value()",
                    "help": "seconds since the script began running",
                    "sockets": [
                        {
                            "name": "timer"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "shapes",
            "name": "Shapes",
            "help": "Shape blocks are for creating shapes that can then be drawn or used to create sprites",
            "blocks": [
                {
                    "blocktype": "step",
                    "script": "runtime.shape.fillShape({{1}}, {{2}});",
                    "help": "fill...",
                    "id": "0baa9d2b-659d-40a7-bbd3-cc72712a546b",
                    "sockets": [
                        {
                            "name": "fill shape",
                            "type": "shape",
                            "value": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "var shape## = {{1}}; var color## = {{2}}; var width## = {{3}}; runtime.shape.strokeShape(shape##, color##, width##);",
                    "help": "stroke...",
                    "id": "90b70122-340f-46a7-9753-9c39022c00ac",
                    "sockets": [
                        {
                            "name": "stroke shape",
                            "type": "shape",
                            "value": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "value": null
                        },
                        {
                            "name": "and width",
                            "type": "number",
                            "value": 1,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8219fa9f-caeb-42cf-a3e5-9cd5066b707c",
                    "script": "{type: 'circle', x: {{1}}, y: {{2}}, r: {{3}}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "circle at x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "957e8a12-b933-4489-ba55-8d9a08d511a5",
                    "script": "{type: 'poly', points: {{1}}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "polygon with points ",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7c7e116b-3035-43d7-9230-4d1b6cc4a7dd",
                    "script": "{type: 'rect', x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}}, r:{{5}}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "rect at x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "with width",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        },
                        {
                            "name": "border-radius",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a51afa9e-f6be-444c-a591-1ca0d0ab697f",
                    "script": "{type: 'rect', x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h, r: {{3}} }",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "rect at point",
                            "type": "point"
                        },
                        {
                            "name": "with size",
                            "type": "size"
                        },
                        {
                            "name": "border-radius",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "b2b9d08f-5d21-4742-a1fd-3f118c254c17",
                    "script": "{type: 'rect', x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] }, r:{{1}}[4];",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "rect from array",
                            "type": "array"
                        }
                    ]
                },
                // DEPRECATED BLOCKS ONLY BELOW THIS LINE

                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "help": "clear...",
                    "id": "3d714bd6-8d02-49cb-8e56-ece642b295ad",
                    "sockets": [
                        {
                            "name": "clear rect",
                            "type": "rect"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();",
                    "help": "circle...",
                    "id": "3ae0e65c-1d1c-4976-8807-799b0408984b",
                    "sockets": [
                        {
                            "name": "fill circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "runtime.shape.fillCircleAtPointWithRadiusAndColor({{1}},{{2}},{{3}});",
                    "id": "e399d950-4d91-49aa-ac42-bfc58299633c",
                    "sockets": [
                        {
                            "name": "fill circle at point",
                            "type": "point",
                            "block": "29803c49-5bd5-4473-bff7-b3cf66ab9711"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 30,
                            "min": 0
                        },
                        {
                            "name": "and color",
                            "type": "color",
                            "block": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();",
                    "help": "circle...",
                    "id": "79133274-d53f-4ef4-8b17-9259fe25fb87",
                    "sockets": [
                        {
                            "name": "stroke circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.strokeStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();local.ctx.restore();",
                    "id": "8a091a21-1fa9-49b6-a622-696c38556a2e",
                    "sockets": [
                        {
                            "name": "stroke circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        },
                        {
                            "name": "and color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.stroke();",
                    "help": "circle...",
                    "id": "094fa424-8b6f-4759-a9bc-f4dbf289f697",
                    "sockets": [
                        {
                            "name": "stroke and fill circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var rect## = {{1}};local.ctx.fillRect(rect##.x,rect##.y,rect##.w,rect##.h);",
                    "help": "fill...",
                    "id": "bf909ec4-5387-4baf-ba43-f17df493f9bd",
                    "sockets": [
                        {
                            "name": "fill rect",
                            "type": "rect"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "7a342b2b-f169-4071-8771-34394cc07393",
                    "script": "var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.fillStyle = color##; local.ctx.fillRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();",
                    "sockets": [
                        {
                            "name": "fill rect",
                            "type": "rect"
                        },
                        {
                            "name": "with color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "cbc60543-0a14-4f5c-af14-a2b55148b4e0",
                    "script": "var rect## = {{1}};var borderRadius## = {{2}};var color## = {{3}};local.ctx.save();local.ctx.strokeStyle=color##;local.ctx.fillStyle=color##;local.ctx.lineJoin='round';local.ctx.lineWidth=borderRadius##;local.ctx.strokeRect(rect##.x+(borderRadius##/2), rect##.y+(borderRadius##/2), rect##.w-borderRadius##, rect##.h-borderRadius##);local.ctx.fillRect(rect##.x+(borderRadius##/2), rect##.y+(borderRadius##/2), rect##.w-borderRadius##, rect##.h-borderRadius##);local.ctx.restore();",
                    "sockets": [
                        {
                            "name": "fill round rect",
                            "type": "rect",
                            "value": null
                        },
                        {
                            "name": "with border-radius",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "and color",
                            "type": "color",
                            "value": null
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "9cf3a017-ab20-4987-875a-5d8436377bd0",
                    "script": "var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.strokeStyle = color##; local.ctx.strokeRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();",
                    "sockets": [
                        {
                            "name": "stroke rect",
                            "type": "rect"
                        },
                        {
                            "name": "with color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "b28a6aeb-bbad-4828-8ff1-2f846e556e1a",
                    "script": "var rect## = {{1}};local.ctx.strokeRect(rect##.x,rect##.y,rect##.w,rect##.h);",
                    "help": "stroke...",
                    "sockets": [
                        {
                            "name": "stroke rect",
                            "type": "rect"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "ebe1b968-f117-468d-91cb-1e67c5776030",
                    "script": "local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}});",
                    "help": "fill and stroke...",
                    "sockets": [
                        {
                            "name": "fill and stroke rect x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "width",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "c0416416-9a75-4202-b3cf-54b03f9a28ee",
                    "script": "var points## = {{1}}; var color## = {{2}}; local.ctx.save();local.ctx.beginPath(); local.ctx.moveTo(points##[0].x, points##[0].y); for (var i = 1; i < points##.length; i ++ ) {   local.ctx.lineTo(points##[i].x, points##[i].y); } local.ctx.closePath(); local.ctx.strokeStyle = color##; local.ctx.stroke();local.ctx.restore()",
                    "help": "stroke the polygon defined by array of points",
                    "sockets": [
                        {
                            "name": "stroke polygon ",
                            "type": "array"
                        },
                        {
                            "name": "with color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                }
            ]
        }

    );
})(wb);
(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sizes",
            "name": "Sizes",
            "help": "Size blocks represent a width and height. They are often used as components of Rects.",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "d8e71067-afc2-46be-8bb5-3527b36474d7",
                    "script": "{w: convert({{1}}), h: convert({{2}})}",
                    "type": "size",
                    "sockets": [
                        {
                            "name": "size with width",
                            "type": "number",
                            "value": 32,
                            "min": 0,
                            "quantity": "length",
                            "unit": "% width"
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 32,
                            "min": 0,
                            "quantity": "length",
                            "unit": "% height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "33f2a3b7-5d87-4481-ad1c-f2970915db51",
                    "script": "convert({{1}}.w)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "width",
                            "quantity": "length",
                            "unit": "% width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2d449e0e-cb18-473f-a574-614320b7ba22",
                    "script": "convert({{1}}.h)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "height",
                            "quantity": "length",
                            "unit": "% height"
                        }
                    ]
                }
            ]
        }

    );
})(wb);
(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "twitter",
            "name": "Twitter",
            "help": "Social blocks are intended for working with social networking sites",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "467848f3-3493-439a-9228-d6f83007e886",
                    "script": "local.getTweet({{1}}, function(tweet){local.tweet## = tweet;[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "last tweet##"
                                }
                            ],
                            "script": "local.tweet## || \"waiting…\"",
                            "type": "string"
                        }
                    ],
                    "help": "asynchronous call to get the last tweet of the named account",
                    "sockets": [
                        {
                            "name": "get tweet for",
                            "type": "string"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sound",
            "name": "Sound",
            "help": "Sound blocks can load and play sound files (wav, mp3, ogg) if those files are supported by your browser.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "59f338b4-0f2f-489a-b4bd-b458fcb48e37",
                    "script": "runtime.preloadAudio('##', {{1}});",
                    "sockets": [
                        {
                            "name": "load audio## from url",
                            "type": "string"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "asset",
                            "sockets": [
                                {
                                    "name": "audio ##"
                                }
                            ],
                            "script": "runtime.audio[\"##\"]",
                            "type": "sound"
                        }
                    ],
                    "help": "Load a sound for playback"
                },
                {
                    "blocktype": "step",
                    "id": "4deb2817-6dfc-44e9-a885-7f4b350cc81f",
                    "script": "{{1}}.currentTime=0;{{1}}.play();",
                    "sockets": [
                    	{
                    		"name": "play sound",
                    		"type": "sound"
                    	}
                    ],
                    "help": "play a sound"
                },
                {
                    "blocktype": "step",
                    "id": "eb715a54-c1f2-4677-819a-9427537bad72",
                    "script": "{{1}}.pause();",
                    "sockets": [
                    	{
                    		"name": "pause sound",
                    		"type": "sound"
                    	}
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "79f14360-3a3b-48de-83ae-240977cf343b",
                    "script": "{{1}}.loop={{2}};",
                    "sockets": [
                    	{
                    		"name": "set sound",
                    		"type": "sound"
                    	},
                    	{
                    		"name": "looping to",
                    		"type": "boolean"
                    	}
        
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sprites",
            "name": "Sprites",
            "help": "Sprites are graphics that can be repositioned, rotated, and have a vector of motion. They can also check for collision with other Sprites.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "a5ec5438-a3e5-4949-a3d6-296f959670b1",
                    "script": "local.ctx.save();local.ctx.fillStyle = {{1}};local.ctx.fillRect(0,0,runtime.stage_width, runtime.stage_height);local.ctx.restore();",
                    "help": "clear the stage to a solid color",
                    "sockets": [
                        {
                            "name": "clear stage to color",
                            "type": "color",
                            "value": "#111111"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "44d98663-d4fd-4fc8-8b65-0cde22deced6",
                    "script": "local.ctx.save();local.ctx.canvas.width = runtime.stage_width;local.ctx.canvas.height =  runtime.stage_height;var w = local.ctx.canvas.width;var h = local.ctx.canvas.height;var size = {{1}};local.ctx.beginPath();if (size <= 0){size = 0.1;};for (var x=0;x<=w;x+=size){local.ctx.moveTo(x,0);local.ctx.lineTo(x,h);};for (var y=0;y<=h;y+=size){local.ctx.moveTo(0,y);local.ctx.lineTo(w,y);};local.ctx.strokeStyle ={{2}};local.ctx.stroke();",
                    "help": "set a grid background",
                    "sockets": [
                        {
                            "name": "set grid with interval",
                            "type": "number",
                            "block": ""
                        },
                        {
                            "name": "with color",
                            "type": "point",
                            "block": "13236aef-cccd-42b3-a041-e26528174323"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9d6b3a43-8319-482e-b0f8-2ce0fe7c2f3a",
                    "script": "local.ctx.drawImage(img, 0,0,img.width,img.height,0,0,runtime.stage_width,runtime.stage_height);",
                    "help": "clear the stage to a background image",
                    "sockets": [
                        {
                            "name": "clear stage to image",
                            "type": "image"
                        }
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "eb889480-c381-4cfa-a6ee-7c6928c08817",
                    "script": "local.sprite## = createRectSprite({{1}}, {{2}}, {{3}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple rectangle sprite",
                    "sockets": [
                        {
                            "name": "rectangle sprite##",
                            "type": "size",
                            "block": "d8e71067-afc2-46be-8bb5-3527b36474d7"
                        },
                        {
                            "name": "big at",
                            "type": "point",
                            "block": "29803c49-5bd5-4473-bff7-b3cf66ab9711"
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "block": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c876f5e8-87e9-4dc5-a6ee-8cf8e0188988",
                    "script": "local.sprite## = createImageSprite({{1}}, {{2}}, {{3}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple image sprite",
                    "sockets": [
                        {
                            "name": "image sprite##",
                            "type": "size",
                            "block": ""
                        },
                        {
                            "name": "big at",
                            "type": "point",
                            "block": ""
                        },
                        {
                            "name": "with image",
                            "type": "image",
                            "block": ""
                        }
                    ]
                },
            	{
                    "blocktype": "step",
                    "id": "43b28edf-c77f-422f-be5b-5217c9da93c9",
                    "script": "local.sprite## = createTextSprite({{1}}, {{2}}, {{3}}, {{4}}, {{5}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple text sprite",
                    "sockets": [
                        {
                            "name": "text sprite##",
                            "type": "size",
                            "block": ""
                        },
                        {
                            "name": "big at",
                            "type": "point",
                            "block": ""
                        },
                        {
                            "name": "with block color",
                            "type": "color",
                            "block": ""
                        },
            			{
                            "name": "with text",
                            "type": "string",
                            "block": ""
                        },
            			{
                            "name": "with text color",
                            "type": "color",
                            "block": ""
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6e0689f9-c731-4874-9ba8-5228c1ff335a",
                    "script": "local.sprite## = createSprite({{1}}, {{2}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple rectangle sprite",
                    "sockets": [
                        {
                            "name": "shape sprite##",
                            "type": "shape",
                            "block": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "block": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "db5f8b4e-93f2-4f88-934b-5eb4bac40e0d",
                    "script": "{{1}}.draw(local.ctx);",
                    "help": "draw the sprite at its current location",
                    "sockets": [
                        {
                            "name": "draw sprite",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "468e4180-2221-11e3-8224-0800200c9a66",
                    "script": "{{1}}.setFacingDirectionBy({{2}});",
                    "help": "Rotate the sprites facing direction absolutely",
                    "sockets": [
                        {
                            "name": "Turn sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "by",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "69998440-22f4-11e3-8224-0800200c9a66",
                    "script": "{{1}}.setFacingDirection({{2}});",
                    "help": "Rotate the sprites facing direction",
                    "sockets": [
                        {
                            "name": "Turn sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "71c09d20-22f4-11e3-8224-0800200c9a66",
                    "script": "{{1}}.setMovementDirectionBy({{2}});",
                    "help": "Rotate the sprites movement direction",
                    "sockets": [
                        {
                            "name": "Steer sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "by",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7ecb947f-28ac-4418-bc44-cd797be697c9",
                    "script": "{{1}}.setMovementDirection({{2}});",
                    "help": "Rotate the sprites movement direction",
                    "sockets": [
                        {
                            "name": "Steer sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7381ea40-22f6-11e3-8224-0800200c9a66",
                    "script": "{{1}}.autosteer = ({{2}});",
                    "help": "Set the sprite to sync facing and movement directions",
                    "sockets": [
                        {
                            "name": "Autosteer sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "",
                            "type": "boolean",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "04c9dfd8-82eb-4f64-9d1c-54b78d744c21",
                    "script": "{{1}}.collides({{2}})",
                    "type": "boolean",
                    "help": "test for collision",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "collides with sprite",
                            "type": "sprite"
                        }
                    ]
                },
                  {
            		"blocktype": "expression",
                    "id": "f874f2af-c15e-44d2-9728-c14a774f22fb",
                    "script": "isSpriteClicked({{1}})",
                    "type": "boolean",
                    "help": "test for click",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "is clicked?"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "aaa2f728-cae3-4368-b241-e80f94c360d3",
                    "script": "{{1}}.bounceOff({{2}});",
                    "help": "Bounce the sprite off of the passed in sprite",
                    "sockets": [
                        {
                            "name": "bounce sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "off of sprite",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d1521a30-c7bd-4f42-b21d-6330a2a73631",
                    "script": "{{1}}.moveRelative({{2}},{{3}});",
                    "help": "move a sprite relatively",
                    "sockets": [
                        {
                            "name": "move",
                            "type": "sprite"
                        },
                        {
                            "name": "by x",
                            "type": "number"
                        },
                        {
                            "name": "y",
                            "type": "number"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "372de8c1-5f72-49cb-a2bd-faf66c36e318",
                    "help": "move a sprite by its own speed and direction",
                    "script": "{{1}}.move();",
                    "sockets": [
                        {
                            "name": "move",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "4d7d6b10-222b-11e3-8224-0800200c9a66",
                    "help": "set the speed of a sprite",
                    "script": "{{1}}.setSpeed({{2}});",
                    "sockets": [
                        {
                            "name": "set sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "speed",
                            "type": "number",
                            "value": 3
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "30d3103b-6657-4233-bd57-47bd5050704b",
                    "help": "set the movement vector of a sprite (speed and steer)",
                    "script": "{{1}}.movementDirection = {{2}};",
                    "sockets": [
                        {
                            "name": "set sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "movement vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a110b9d4-34bc-4d3f-a7b1-dbc7885eb977",
                    "help": "bounce in the x and/or y direction if the stage is exceeded",
                    "script": "{{1}}.stageBounce(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "bounce",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "039a62e2-fbde-4fd0-9fa6-1e5383434698",
                    "help": "if the sprite moves to the edge of the screen, stop it at the edge",
                    "script": "{{1}}.edgeStop(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "stop sprite ",
                            "type": "sprite",
                            "suffix": "at edge of stage"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a4caaf13-514a-499a-a406-f88bfc9ddccd",
                    "help": "if the sprite moves to the edge of the screen, slide it along the edge",
                    "script": "{{1}}.edgeSlide(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "slide sprite ",
                            "type": "sprite",
                            "suffix": "at edge of stage"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "45f73aca-bf93-4249-9da4-1c089d6c8537",
                    "help": "if the sprite moves to the edge of the screen, wrap it around to the other side",
                    "script": "{{1}}.edgeWrap(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "wrap sprite ",
                            "type": "sprite",
                            "suffix": "around edge of stage"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "88c75c2b-18f1-4195-92bc-a90d99743551",
                    "script": "{{1}}.moveAbsolute({{2}}.x, {{2}}.y);",
                    "help": "move a sprite absolutely",
                    "sockets": [
                        {
                            "name": "move",
                            "type": "sprite"
                        },
                        {
                            "name": "to",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "badee0b6-8f7c-4cbd-9173-f450c765045d",
                    "script": "{{1}}.color = {{2}};",
                    "help": "Recolor a sprite",
                    "sockets": [
                        {
                            "name": "Color sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "to color",
                            "type": "color",
                            "block": "13236aef-cccd-42b3-a041-e26528174323"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "36DD3165-1168-4345-9198-E9B230FF84A3",
                    "script": "{{1}}.facingDirection",
                    "type": "vector",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "facing direction"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "495336f3-68ed-4bc7-a145-11756803876b",
                    "script": "{{1}}.movementDirection",
                    "type": "vector",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "movement vector"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "86aa39be-5419-4abb-9765-e63f824608f0",
                    "script": "{{1}}.polygon.average",
                    "type": "point",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "center"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "DF9E52B5-CE65-477A-BE10-95DF88C53FD0",
                    "script": "{{1}}.speed",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "speed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8D0880EA-1722-435A-989D-06E8A9B62FB0",
                    "script": "{{1}}.movementDirection.x",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "horizontal speed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "21A7A835-9647-4DC2-80AE-AE9B06346706",
                    "script": "{{1}}.movementDirection.y",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "vertical speed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a0c6d157-7fc7-4819-9b97-7b81d4c49a83",
                    "script": "{{1}}.x",
                    "help": "get x (left) position of sprite",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "left"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "23b4ffd1-3812-4372-8873-8a1b3107bdac",
                    "script": "({{1}}.x + {{1}}.w)",
                    "help": "get x+w (right) position of sprite",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "right"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "898208b7-4d38-4c24-ba23-0b0443089435",
                    "script": "{{1}}.y",
                    "help": "get y (top) position of sprite",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "top"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8c73e3fd-7c53-4c92-be1d-286db5357cbb",
                    "script": "({{1}}.y + {{1}}.h)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "bottom"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);
(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "strings",
            "name": "Strings",
            "help": "String blocks represent or manipulate bits of text (strings of characters)",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "cdf5fa88-0d87-45d1-bf02-9ee4ec4c5565",
                    "script": "{{1}}.split({{2}})",
                    "type": "array",
                    "help": "create an array by splitting the named string on the given string",
                    "sockets": [
                        {
                            "name": "split string",
                            "type": "string"
                        },
                        {
                            "name": "on separator",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e1951d04-dc2f-459e-9d7a-4796f29169ea",
                    "type": "string",
                    "script": "({{1}} + {{2}})",
                    "help": "returns a string by joining together two strings",
                    "sockets": [
                        {
                            "name": "concatenate",
                            "type": "string",
                            "value": "hello"
                        },
                        {
                            "name": "with",
                            "type": "string",
                            "value": "world"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "3889BB61-FC62-4BED-B0EC-792AF636EC18",
                    "type": "string",
                    "script": "{{1}}.repeat({{2}})",
                    "help": "returns a string by joining together copies of the original string",
                    "sockets": [
                        {
                            "name": "repeat",
                            "type": "string",
                            "value": "hello"
                        },
                        {
                            "name": "",
                            "type": "number",
                            "value": 2,
                            "min": 0
                        },
                        {
                            "name": "times"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e71d4b0b-f32e-4b02-aa9d-5cbe76a8abcb",
                    "script": "{{1}}[{{2}}]",
                    "type": "string",
                    "help": "get the single character string at the given index of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string"
                        },
                        {
                            "name": "character at",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "304A88C6-FFF3-4DA5-9522-6DAF99E89F10",
                    "script": "{{1}}[{{1}}.length-{{2}}]",
                    "type": "string",
                    "help": "get the single character string at the given index from the end of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "character at",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "from the end"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6BA0B0CF-6F22-4384-8A16-630C745FA3D3",
                    "script": "{{1}}.substr({{2}},{{3}})",
                    "type": "string",
                    "help": "get the substring of specified length starting at the given index of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "substring at",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "of length",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "A41F840C-C64A-4047-9EBD-CF7152EA5D7B",
                    "script": "{{1}}.slice({{2}},{{3}}+1)",
                    "type": "string",
                    "help": "get the substring starting at the given index of named string and ending at the second given index",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "substring from",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c1eda8ae-b77c-4f5f-9b9f-c11b65235765",
                    "script": "{{1}}.length",
                    "type": "number",
                    "help": "get the length of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "suffix": "length"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "cc005f19-e1b9-4f74-8fd0-91faccedd370",
                    "script": "{{1}}.indexOf({{2}})",
                    "type": "number",
                    "help": "get the index of the substring within the named string",
                    "sockets": [
                        {
                            "name": "search string",
                            "type": "string"
                        },
                        {
                            "name": "for substring",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "037BB272-ADA5-41E4-BE9E-5FACA42F02C8",
                    "script": "{{1}}.contains({{2}})",
                    "type": "boolean",
                    "help": "check for the substring within the named string",
                    "sockets": [
                        {
                            "name": "test string",
                            "type": "string"
                        },
                        {
                            "name": "for substring",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8b536c13-4c56-471e-83ac-cf8648602df4",
                    "script": "{{1}}.replace({{2}}, {{3}})",
                    "type": "string",
                    "help": "get a new string by replacing a substring with a new string",
                    "sockets": [
                        {
                            "name": "replace",
                            "type": "string"
                        },
                        {
                            "name": "with",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "3047CA98-2E78-4D0B-BD88-6F4D1B3E8420",
                    "script": "{{1}}.replace({{2}}g, {{3}})",
                    "type": "string",
                    "help": "get a new string by replacing a pattern with a new string using regular expressions",
                    "sockets": [
                        {
                            "name": "in string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "replace pattern",
                            "type": "regex",
                            "value": null
                        },
                        {
                            "name": "with",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1D76122E-1E5D-4A19-AA5E-267B41A788FA",
                    "script": "{{1}}.trim()",
                    "type": "string",
                    "help": "remove trailing and leading whitespace",
                    "sockets": [
                        {
                            "name": "trim whitespace from",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "85CA02CB-229F-4DF5-8400-4AFA2BA8E627",
                    "script": "{{1}}.toUpperCase()",
                    "type": "string",
                    "help": "change to uppercase",
                    "sockets": [
                        {
                            "name": "to uppercase",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5AD79C7C-321E-4588-B05D-DB1FEF86B82D",
                    "script": "{{1}}.toLowerCase()",
                    "type": "string",
                    "help": "change to lowercase",
                    "sockets": [
                        {
                            "name": "to lowercase",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "DBA355CF-0F3A-4BA1-BBD7-2F8BDCE8C3CC",
                    "type": "boolean",
                    "script": "({{1}} === {{2}})",
                    "help": "two strings are equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "=",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "46391AF0-3002-4A58-85BA-C670FE743219",
                    "type": "boolean",
                    "script": "({{1}} !== {{2}})",
                    "help": "two strings are not equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "≠",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "C9B4EC06-0C82-458F-AB99-E5BB620269D7",
                    "type": "boolean",
                    "script": "({{1}} < {{2}})",
                    "help": "first string precedes second string in lexicographical ordering",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "<",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "085AD019-E831-4501-A058-34A7A1E6744D",
                    "type": "boolean",
                    "script": "({{1}} <= {{2}})",
                    "help": "first precedes or is equal to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "≤",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "684A6EDF-7351-4DCF-AE93-EEA4AF1B41A5",
                    "type": "boolean",
                    "script": "({{1}} > {{2}})",
                    "help": "second string precedes first string in lexicographical ordering",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": ">",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "149FFB1E-4143-4724-BBBA-EEE133F517A7",
                    "type": "boolean",
                    "script": "({{1}} >= {{2}})",
                    "help": "first string succeeds or is equal to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "≥",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "55FC2AC3-7C0E-43CD-BDDE-8E890073EDAC",
                    "type": "boolean",
                    "script": "{{1}}.startsWith({{2}})",
                    "help": "first string starts with to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "starts with",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2F3963B1-1FAC-402A-B5B6-86927DCD3241",
                    "type": "boolean",
                    "script": "{{1}}.endsWith({{2}})",
                    "help": "first string ends with to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "ends with",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "73A7E675-E152-454A-9B60-A7C3D54F603C",
                    "type": "boolean",
                    "script": "{{2}}.test({{1}})",
                    "help": "first string matches the given regular expression",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "matches pattern",
                            "type": "regex",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "D8EF192D-16BD-42AA-98A0-C6C2236392F7",
                    "script": "levenshtein({{1}},{{2}})",
                    "type": "number",
                    "help": "calculate how much two strings are different using Levenshtein difference",
                    "sockets": [
                        {
                            "name": "difference of strings",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "and",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8eaacf8a-18eb-4f21-a1ab-a356326f7eae",
                    "script": "{{1}}.toString()",
                    "type": "string",
                    "help": "convert any object to a string",
                    "sockets": [
                        {
                            "name": "to string",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "48bb8639-0092-4384-b5a0-3a772699dea9",
                    "script": "/* {{1}} */",
                    "help": "this is a comment and will not be run by the program",
                    "sockets": [
                        {
                            "name": "comment",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "2f178d61-e619-47d0-b9cf-fcb52625c2a3",
                    "script": "window.alert({{1}});",
                    "help": "pop up an alert window with string",
                    "sockets": [
                        {
                            "name": "alert",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "8496b7af-129f-48eb-b15b-8803b7617493",
                    "script": "console.log({{1}});",
                    "help": "Send any object as a message to the console",
                    "sockets": [
                        {
                            "name": "console log",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "8bfaf131-d169-4cf4-afe4-1d7f02a55341",
                    "script": "var __a={{2}};__a.unshift({{1}});console.log.apply(console, __a);",
                    "help": "send a message to the console with a format string and multiple objects",
                    "sockets": [
                        {
                            "name": "console log format",
                            "type": "string"
                        },
                        {
                            "name": "arguments",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "06ddcfee-76b7-4be4-856d-44cda3fb109b",
                    "script": "runtime.keys",
                    "help": "for debugging",
                    "type": "object",
                    "sockets": [
                        {
                            "name": "global keys object"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "text",
            "name": "Text",
            "help": "Text blocks represent and manipulate the way text is drawn to the screen, things like alignment, font, and size.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "d16df0dc-f90a-4e21-967d-f054956c8135",
                    "script": "local.ctx.font = {{1}}+{{2}}+\" \"+{{3}};",
                    "help": "set the current font",
                    "sockets": [
                        {
                            "name": "font",
                            "type": "number",
                            "value": 10,
                            "min": 6
                        },
                        {
                            "name": "",
                            "type": "string",
                            "options": "fontsize",
                            "value": "px"
                        },
                        {
                            "name": "",
                            "type": "string",
                            "value": "sans-serif"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7ea4ef80-8355-4987-8d3b-165367b97cc1",
                    "script": "local.ctx.textAlign = {{1}};",
                    "help": "how should the text align?",
                    "sockets": [
                        {
                            "name": "text align",
                            "type": "string",
                            "options": "align",
                            "value": "left"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "46345cbf-e095-4b34-9d37-c9dcc22da7db",
                    "script": "local.ctx.textBaseline = {{1}};",
                    "help": "set the text baseline",
                    "sockets": [
                        {
                            "name": "text baseline",
                            "type": "string",
                            "options": "baseline",
                            "value": ""
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9f3fb819-f8a9-4929-87c8-6c6742b4cb2d",
                    "script": "local.ctx.fillText({{1}},{{2}},{{3}});",
                    "help": "basic text operation",
                    "sockets": [
                        {
                            "name": "fill text",
                            "type": "string"
                        },
                        {
                            "name": "x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "742ee568-8a27-49d5-9dce-8b9151b30bef",
                    "script": "local.ctx.fillText({{1}},{{2}},{{3}},{{4}});",
                    "help": "basic text operation with optional max width",
                    "sockets": [
                        {
                            "name": "fill text",
                            "type": "string"
                        },
                        {
                            "name": "x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "max width",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b9bfe426-3110-4b67-bc4e-5da48103e890",
                    "script": "local.ctx.strokeText({{1}},{{2}},{{3}});",
                    "help": "outline the text",
                    "sockets": [
                        {
                            "name": "stroke text",
                            "type": "string"
                        },
                        {
                            "name": "x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6d03d273-8c5d-4059-b525-641ceb7ed662",
                    "script": "local.ctx.strokeText({{1}},{{2}},{{3}},{{4}});",
                    "help": "outline the text with optional max width",
                    "sockets": [
                        {
                            "name": "stroke text",
                            "type": "string"
                        },
                        {
                            "name": "x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "max width",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7edfa688-bdbb-491b-9011-4cb866b7dc2e",
                    "script": "local.ctx.measureText({{1}}).width",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "text",
                            "type": "string",
                            "suffix": "width"
                        }
                    ]
                }
            ]
        }

    );
})(wb);
(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "vectors",
            "name": "Vectors",
            "help": "Vector blocks have a direction and a magnitude, which can represent speed of movement for a Sprite. Vectors can be added to or subtracted from other Vectors, among other things.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "874f1097-2aa2-4056-8a8f-de88f73f39e2",
                    "script": "local.vector## = new SAT.Vector({{1}}, {{2}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "vector##"
                                }
                            ],
                            "script": "local.vector##",
                            "type": "vector"
                        }
                    ],
                    "help": "create a vector",
                    "sockets": [
                        {
                            "name": "vector##",
                            "type": "number",
                            "value": 0,
                            "suffix": "x"
                        },
                        {
                            "name": "",
                            "type": "number",
                            "value": 0,
                            "suffix": "y"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "61d265c9-7314-45c9-89cd-16e5ae26b258",
                    "script": "{{1}}.add({{2}});",
                    "help": "Add a second vector to this vector",
                    "sockets": [
                        {
                            "name": "Vector",
                            "type": "vector"
                        },
                        {
                            "name": "add vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e82c5f05-ba59-4267-b817-f1e44b4d31c4",
                    "script": "{{1}}.sub({{2}});",
                    "help": "Subtract a second vector from this vector",
                    "sockets": [
                        {
                            "name": "Vector",
                            "type": "vector"
                        },
                        {
                            "name": "subtract vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c6edb126-6306-44e4-a5f9-44728ae1cbb4",
                    "script": "{{1}}.dot({{2}})",
                    "type": "number",
                    "help": "Get the dot product of two vectors",
                    "sockets": [
                        {
                            "name": "Dot product of vector",
                            "type": "vector"
                        },
                        {
                            "name": "and vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d6204ed1-3b28-41af-8574-fac393df75f1",
                    "script": "{{1}}.reverse();",
                    "help": "Reverse the vector",
                    "sockets": [
                        {
                            "name": "Reverse vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "D7374103-3C03-40E8-A215-45BEFF97F0BC",
                    "script": "{{1}}.normalize();",
                    "help": "Normalize the vector",
                    "sockets": [
                        {
                            "name": "Normalize vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "612C4569-9715-48E6-ADA0-C978386D9922",
                    "script": "{{1}}.scale({{2}},{{3}});",
                    "help": "Scale the vector by the x and y",
                    "sockets": [
                        {
                            "name": "Scale vector",
                            "type": "vector"
                        },
                        {
                            "name": "by x",
                            "type": "number",
                            "value": 1
                        },
                        {
                            "name": "and y",
                            "type": "number",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f7937709-f449-4480-927d-3bcfe33d2f65",
                    "script": "{{2}}.project({{1}});",
                    "help": "Project the first vector onto the second",
                    "sockets": [
                        {
                            "name": "Vector",
                            "type": "vector"
                        },
                        {
                            "name": "project onto vector",
                            "type": "vector"
                        }
                    ]
                }
            ]
        }
    );
})(wb);(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "music",
            "name": "Music",
            "help": "Music blocks are for creating and manipulating sound programmatically, generating the sounds rather than playing back a recorded audio file (see the Sound menu for that).",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "ac1d8b1a-013c-46e0-b5e7-f241c594a7c7",
                    "script": "local.voice## = new Voice();",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "voice##"
                                }
                            ],
                            "script": "local.voice##",
                            "type": "voice"
                        }
                    ],
                    "help": "create a simple voice to play tones",
                    "sockets": [
                        {
                            "name": "voice##"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "ee91b7ec-d52b-45ff-bd13-ff8a8e5e50fb",
                    "help": "set the frequency of the voice",
                    "script": "(function(voice, freq){voice.frequency = freq; voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "tone",
                            "type": "number",
                            "value": 440,
                            "min": 20,
                            "max": 20000,
                            "suffix": "Hz"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "60984C26-0854-4075-994B-9573B3F48E95",
                    "help": "set the note of the voice",
                    "script": "(function(voice, note){voice.setNote(note); voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "note",
                            "type": "string",
                            "options": "notes",
                            "value": "A4"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a133f0ad-27e6-444c-898a-66410c447a07",
                    "help": "set the volume of the voice",
                    "script": "(function(voice, vol){voice.volume = vol; voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "volume",
                            "type": "number",
                            "value": 1,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "A64A4BC7-4E93-47B4-910B-F185BC42E366",
                    "help": "set the tempo of the voice, for determining the length of a quarter note",
                    "script": "(function(voice, tempo){voice.tempo = tempo; voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "tempo quarter note =",
                            "type": "number",
                            "value": 120,
                            "min": 0,
                            "suffix": "beats per minute"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c1ce82b2-9810-41e0-b96e-44702982372b",
                    "script": "{{1}}.frequency",
                    "help": "get frequency of a voice",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "voice",
                            "type": "voice",
                            "suffix": "Hz"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e4a4949f-1010-4026-a070-2555dbf3be0e",
                    "script": "{{1}}.startOsc();",
                    "help": "turn the voice on",
                    "sockets": [
                        {
                            "name": "turn voice",
                            "type": "voice",
                            "suffix": "on"
                        }
                    ]
                },
                        {
                    "blocktype": "step",
                    "id": "c471bc07-fe25-4c6d-a5ef-4ee7f3076561",
                    "script": "{{1}}.stopOsc();",
                    "help": "turn the voice off",
                    "sockets": [
                        {
                            "name": "turn voice",
                            "type": "voice",
                            "suffix": "off"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "2003f5ae-0bef-4517-aad4-7baf4457a823",
                    "script": "(function(voice, sec){voice.startOsc();setTimeout(function() {voice.stopOsc();}, 1000 * sec);})({{1}},{{2}});",
                    "help": "play the voice for a number of seconds",
                    "sockets": [
                        {
                            "name": "play voice",
                            "type": "voice"
                        },
                        {
                            "name": "for ",
                            "type": "number",
                            "value": 2,
                            "min": 0,
                            "suffix": "seconds"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1F98BD7B-8E13-4334-854B-6B9C1B31C99D",
                    "script": "(function(voice, note, len, dots){voice.push(note,len,dots);})({{1}},{{2}},{{3}},{{4}});",
                    "help": "schedule a note to be played as part of a song",
                    "sockets": [
                        {
                            "name": "schedule voice",
                            "type": "voice"
                        },
                        {
                            "name": "to play note",
                            "type": "string",
                            "options": "notes",
                            "value": "A4"
                        },
                        {
                            "name": "as ",
                            "type": "string",
                            "options": "durations",
                            "value": "quarter note"
                        },
                        {
                            "name": "dotted",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "24875971-7CB4-46A6-8A53-D966424A3E70",
                    "script": "(function(voice, note, len, dots){voice.push(note,len,dots);})({{1}},'none',{{2}},{{3}});",
                    "help": "schedule a note to be played as part of a song",
                    "sockets": [
                        {
                            "name": "schedule voice",
                            "type": "voice"
                        },
                        {
                            "name": "to rest for a ",
                            "type": "string",
                            "options": "durations",
                            "value": "quarter note"
                        },
                        {
                            "name": "dotted",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "34788069-BF4F-46DB-88DC-FC437F484A80",
                    "script": "(function(voice){voice.play();})({{1}});",
                    "help": "play the scheduled song",
                    "sockets": [
                        {
                            "name": "play voice",
                            "type": "voice",
                            "suffix": "stored song"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "112ffdd3-7832-43df-85a5-85587e951295",
                    "script": "{{1}}.on",
                    "help": "get whether the voice is turned on or off",
                    "type": "boolean",
                    "sockets": [
                        {
                            "name": "voice",
                            "type": "voice",
                            "suffix": "is on?"
                        }
                    ]
                }
            ]
        }
    );
})(wb);