(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "mcposition",
            "name": "Minecraft Position",
            "help": "Find and change Minecraft Positions",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "8bb6aab6-273d-4671-8caa-9c15b5c486a7",
                    "sockets": [
                        {
                            "name": "x",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "z",
                            "type": "number",
                            "value": "0"
                        }
                    ],
                    "type": "position",
                    "script": "v({{1}}, {{2}} , {{3}})",
                    "help": "A position: x is across, y is up and z is depth"
                },
                {
                    "blocktype": "expression",
                    "id": "590c8aef-a755-4df5-8930-b430db5a3c3d",
                    "sockets": [
                        {
                            "name": "Centre Position"
                        }
                    ],
                    "type": "position",
                    "script": "v()",
                    "help": "position"
                },
                {
                    "blocktype": "step",
                    "id": "0ae2eba9-582e-4a3a-92b2-0f8484397e90",
                    "sockets": [
                        {
                            "name": "Create Position## from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "var position## = {{1}}.clone();",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Position##"
                                }
                            ],
                            "script": "position##",
                            "type": "position"
                        }
                    ],
                    "help": "create new position"
                },
                {
                    "blocktype": "expression",
                    "id": "abe5ebe0-a169-4ca4-8048-80633f7f19f9",
                    "sockets": [
                        {
                            "name": "position",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "equals position",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "({{1}}.equal({{2}})",
                    "type": "boolean",
                    "help": "are 2 positions the same"
                },
                {
                    "blocktype": "step",
                    "id": "5dfa6369-b4bc-4bb3-9b98-839015d5f9ee",
                    "sockets": [
                        {
                            "name": "Create Position## from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "offset by",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "var position## = {{1}}.plus({{2}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Position##"
                                }
                            ],
                            "script": "position##",
                            "type": "position"
                        }
                    ],
                    "help": "create new position by adding 2 others"
                },
                {
                    "blocktype": "context",
                    "id": "2ab7b0ea-b646-4672-a2fe-310542b924aa",
                    "sockets": [
                        {
                            "name": "Get ground position from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "client.getHeight({{1}}, function(groundposition){[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Ground Position"
                                }
                            ],
                            "script": "groundposition",
                            "type": "position"
                        }
                    ],
                    "help": "get height of blocks at position"
                },
                {
                    "blocktype": "expression",
                    "id": "c95312f6-da99-4516-b43d-6f759c42b5c5",
                    "sockets": [
                        {
                            "name": "x from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "{{1}}.x",
                    "type": "number",
                    "help": "the x (across) part of the postion"
                },
                {
                    "blocktype": "expression",
                    "id": "6facc3ac-a8d5-4503-89d9-0dff6ebc9fc6",
                    "sockets": [
                        {
                            "name": "y from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "{{1}}.y",
                    "type": "number",
                    "help": "the y (up) part of the postion"
                },
                {
                    "blocktype": "expression",
                    "id": "96c32f90-7234-4463-b18d-d528271bf224",
                    "sockets": [
                        {
                            "name": "z from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "{{1}}.z",
                    "type": "number",
                    "help": "the z (depth) part of the postion"
                },
                {
                    "blocktype": "expression",
                    "id": "3fa57ab7-bfed-4d36-8307-0ba11eda25f0",
                    "sockets": [
                        {
                            "name": "position",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7",
                            "suffix": "as text"
                        }
                    ],
                    "script": "{{1}}.toString()",
                    "type": "string",
                    "help": "Position as text"
                },
                {
                    "blocktype": "step",
                    "id": "e28a420d-9b94-4480-ad0f-ebe4e68134b0",
                    "sockets": [
                        {
                            "name": "Set",
                            "type": "position",
                            "block": "590c8aef-a755-4df5-8930-b430db5a3c3d"
                        },
                        {
                            "name": "to",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "{{1}}.update({{2}});",
                    "help": "Set position variable to a new postion"
                },
                {
                    "blocktype": "expression",
                    "id": "d453a2dc-cebc-47dd-b421-09d450bd7e88",
                    "sockets": [
                        {
                            "name": "Distance from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "to",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "{{1}}.distanceTo({{2}})",
                    "type":"number",
                    "help": "the distance between 2 positions"
                },
                {
                    "blocktype": "context",
                    "id": "10ec4498-1aa8-44ff-9620-b338a2cdc3cb",
                    "sockets": [
                        {
                            "name": "For each direction from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "by",
                            "type": "number",
                            "value": "1",
                            "suffix": "block(s)"
                        }
                    ],
                    "script": "client.directions.forEach(function(dir, idx){var position##=client.directioncalcs[dir]({{1}},{{2}});[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Position##"
                                }
                            ],
                            "script": "position##",
                            "type": "position"
                        }
                    ],
                    "help": "Go around each direction"
                },
                {
                    "blocktype": "step",
                    "id": "4072476e-cdc4-43b1-b36b-a8c5829c113c",
                    "sockets": [
                        {
                            "name": "Create Position## from",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "offset by",
                            "type": "number",
                            "value": "1"
                        },
                        {
                            "name": " ",
                            "type": "string",
                            "options": "directions",
                            "value": "up"
                        }
                    ],
                    "script": "var position##=client.directioncalcs[{{3}}]({{1}},{{2}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Position##"
                                }
                            ],
                            "script": "position##",
                            "type": "position"
                        }
                    ],
                    "help": "create new position by adding a distance and direction"
                },
                {
                    "blocktype": "expression",
                    "type":"boolean",
                    "id": "635a2e41-94d8-4f63-b20b-8e9340c0f2c5",
                    "sockets": [
                        {
                            "name": "Is",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "between",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "and",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "({{1}}.min({{2}}).equal({{2}}) && {{1}}.max({{3}}).equal({{3}}))",
                    "help": "is 1st point between 2nd and 3rd"
                }
            ]
        }
    );
})(wb);