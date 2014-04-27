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
                            "suffix": "x,"
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
})(wb);