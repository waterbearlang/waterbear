(function(wb){
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
})(wb);