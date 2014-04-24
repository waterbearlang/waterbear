(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "math",
            "name": "Math",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "0ee12a6a-51a5-46b0-b1f6-db3731d99fc5",
                    "type": "number",
                    "script": "({{1}} + {{2}})",
                    "help": "Adds two values",
                    "sockets": [
                        {
                            "name": "addition",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "+",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "406d4e12-7dhd-4fg4-9bpe-0a69d968b3c",
                    "script": "{{1}} += {{2}};",
                    "help": "Combines addition with assignment. First argument must be a variable",
                    "sockets": [
                        {
                            "name": "add assign",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "+=",
                            "type": "any",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "406d4e12-7db0-4fn4-9bne-9b86bd94be3c",
                    "type": "string",
                    "script": "({{1}} + {{2}})",
                    "help": "Concatenates string values",
                    "sockets": [
                        {
                            "name": "concatena",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "+",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "eff1fb37-b0f5-4dac-9964-11e32dc8572a",
                    "type": "number",
                    "script": "({{1}} - {{2}})",
                    "help": "Subtracts one value from another and may also be used to negate a value",
                    "sockets": [
                        {
                            "name": "minus",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "-",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "78147ed0-78d2-4ff1-a7bb-079921a00768",
                    "type": "any",
                    "script": "({{1}} * {{2}})",
                    "help": "Multiplies the values of the two parameters",
                    "sockets": [
                        {
                            "name": "multiply",
                            "type": "any",
                            "value": "0"
                        },
                        {
                            "name": "*",
                            "type": "any",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "07ebe81b-64a7-44e8-9d6f-7a4980fb2588",
                    "type": "number",
                    "script": "({{1}} / {{2}})",
                    "help": "Divides the value of the second parameter by the value of the first parameter",
                    "sockets": [
                        {
                            "name": "divide",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "/",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a2647515-2f14-4d0f-84b1-p0e288823630",
                    "type": "number",
                    "script": "({{1}} % {{2}})",
                    "help": "Calculates the remainer when one number is divided by another",
                    "sockets": [
                        {
                            "name": "modulo",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "%",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "247888a8-47a1-42a1-9018-55e307fd6a4e",
                    "type": "number",
                    "script": "random({{1}}, {{2}})",
                    "help": "Generates random numbers",
                    "sockets": [
                        {
                            "name": "random",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7a20f5d9-86dc-40cf-86a0-63ba565d78c1",
                    "type": "number",
                    "script": "round({{1}})",
                    "help": "Calculates the integer closest to the value parameter",
                    "sockets": [
                        {
                            "name": "round",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "004040ab-5954-40ec-9dac-0918ef1d5d42",
                    "type": "number",
                    "script": "abs({{1}})",
                    "help": "Calculates the absolute value (magnitude) of a number",
                    "sockets": [
                        {
                            "name": "absolute",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7864b7f4-b6fb-46ff-ba8f-6c29160b141e",
                    "type": "number",
                    "script": "pow({{1}}, {{2}})",
                    "help": "Facilitates exponential expressions",
                    "sockets": [
                        {
                            "name": "pow",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "^",
                            "type": "number",
                            "value": "2"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "b64d1ea4-f3c9-4499-8104-9d0acf85a7a5",
                    "type": "number",
                    "script": "sqrt({{1}})",
                    "help": "Calculates the square root of a number",
                    "sockets": [
                        {
                            "name": "square root",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "fa7d53e9-2cf9-4acc-9d04-f941f98ff2b1",
                    "type": "number",
                    "script": "floor({{1}})",
                    "help": "Calculates the closest int value that is less than or equal to the value of the parameter",
                    "sockets": [
                        {
                            "name": "floor",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7fb957cb-4cb2-462e-8aa5-66a03ff4a35c",
                    "type": "number",
                    "script": "ceil({{1}})",
                    "help": "Calculates the closest int value that is greater than or equal to the value of the parameter",
                    "sockets": [
                        {
                            "name": "ceiling",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e2c9f20d-c17c-4fdb-bffc-561e7c373665",
                    "type": "number",
                    "script": "cos(radians({{1}}))",
                    "help": "Calculates the cosine of an angle",
                    "sockets": [
                        {
                            "name": "cosine",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "28887223-5e67-4332-98d4-8e0ee53f037d",
                    "type": "number",
                    "script": "sin(radians({{1}}))",
                    "help": "Calculates the sine of an angle",
                    "sockets": [
                        {
                            "name": "sine",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "194d6757-e04e-48d6-9cc1-d9071be47007",
                    "type": "number",
                    "script": "tan(radians({{1}}))",
                    "help": "Calculates the ratio of the sine and cosine of an angle",
                    "sockets": [
                        {
                            "name": "tangent",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "42a91ce7-184b-4853-9653-32f6f28e5e0f",
                    "type": "number",
                    "script": "degrees(acos({{1}}))",
                    "help": "The inverse of cos(), returns the arc cosine of a value",
                    "sockets": [
                        {
                            "name": "arccosine degrees",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "655b85f4-9090-4590-9c64-3887d29272d2",
                    "type": "number",
                    "script": "degrees(asin({{1}}))",
                    "help": "The inverse of sin(), returns the arc sine of a value",
                    "sockets": [
                        {
                            "name": "arcsine degrees",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "0p5eeo69-148e-4e4a-a514-5179af86b615",
                    "type": "number",
                    "script": "degrees(atan({{1}}))",
                    "help": "The inverse of tan(), returns the arc tangent of a value",
                    "sockets": [
                        {
                            "name": "arctangent degrees",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1f53e062-118e-4e4a-a514-5f79a8874e15",
                    "type": "number",
                    "script": "degrees({{1}})",
                    "help": "Converts a radian measurement to its corresponding value in degrees",
                    "sockets": [
                        {
                            "name": "degrees",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1f5ee064-148e-4e4a-a514-179a886keqw",
                    "type": "number",
                    "script": "radians({{1}})",
                    "help": "Converts a degree measurement to its corresponding value in radians",
                    "sockets": [
                        {
                            "name": "radians",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "b30761f4-b43c-4714-8ace-e6d1fe204da4",
                    "script": "PI;",
                    "type": "number",
                    "help": "pi is the ratio of a circle's circumference to its diameter",
                    "sockets": [
                        {
                            "name": "pi"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "350e69fc-950b-4a9e-8d00-f598262cb6c6",
                    "script": "TWO_PI",
                    "type": "number",
                    "help": "Two pi (tau) is 2 times pi, a generally more useful number",
                    "sockets": [
                        {
                            "name": "two pi"
                        }
                    ]
                }
            ]
        }
    );
})(wb);