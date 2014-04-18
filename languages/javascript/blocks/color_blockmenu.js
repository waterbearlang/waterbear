(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "color",
            "name": "Color",
            "help": "Color blocks are for creating, converting, and manipulating colors",
            "blocks": [
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
                    "id": "271c8b4c-b045-4ff9-8ad5-9608ea204b09",
                    "script": "\"rgb(\" + {{1}} + \",\" + {{2}} + \",\" + {{3}} + \")\"",
                    "type": "color",
                    "help": "returns a color",
                    "sockets": [
                        {
                            "name": "color with red",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "green",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "blue",
                            "type": "number",
                            "value": 0
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
                            "value": 0
                        },
                        {
                            "name": "green",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "blue",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "alpha",
                            "type": "number",
                            "value": 0.1
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
                            "value": 0
                        },
                        {
                            "name": "saturation",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "brightness",
                            "type": "number",
                            "value": 0
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
                            "value": 0
                        },
                        {
                            "name": "to point2",
                            "type": "point"
                        },
                        {
                            "name": "radius2",
                            "type": "number",
                            "value": 0
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
                            "value": 0.5
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
})(wb);