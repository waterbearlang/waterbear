(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "math",
            "name": "Math",
            "help": "Math blocks are for manipulating numbers",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "f51d2d51-d5b4-4fef-a79b-b750694bcc1a",
                    "sockets": [
                        {
                            "name": "Create Number## from",
                            "type": "number",
                            "value": "0"
                        }
                    ],
                    "script": "var number## = {{1}};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Number##"
                                }
                            ],
                            "script": "number##",
                            "type": "number"
                        }
                    ],
                    "help": "create a new named number"
                },
                {
                    "blocktype": "expression",
                    "type": "number",
                    "id": "f08f2d43-23e8-47a9-8bf5-7904af9313da",
                    "sockets": [
                        {
                            "name": "new number",
                            "type": "number",
                            "value": "0"
                        }
                    ],
                    "script": "{{1}}",
                    "help": "create a new named number"
                },
                {
                    "blocktype": "expression",
                    "id": "15a39af7-940e-4f29-88ba-38b67913599f",
                    "type": "number",
                    "script": "({{1}} + {{2}})",
                    "help": "sum of the two operands",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "+",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "3d74da37-7c18-47e3-bbdc-e4f7706c81f6",
                    "type": "number",
                    "script": "({{1}} - {{2}})",
                    "help": "difference of the two operands",
                    "sockets": [
                        {
                            "name": "",
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
                    "id": "ded5d055-7ae1-465a-ad82-003f171b9dc7",
                    "type": "number",
                    "script": "({{1}} * {{2}})",
                    "help": "product of the two operands",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "*",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "0e68e0f3-c6f4-40b1-a2cb-431dd0cd574d",
                    "type": "number",
                    "script": "({{1}} / {{2}})",
                    "help": "quotient of the two operands",
                    "sockets": [
                        {
                            "name": "",
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
                    "id": "7d9bf923-baa2-4606-8c44-0247022c2408",
                    "type": "boolean",
                    "script": "({{1}} === {{2}})",
                    "help": "two operands are equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "=",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "74992263-4356-48ba-9afe-16e9323f4efa",
                    "type": "boolean",
                    "script": "({{1}} < {{2}})",
                    "help": "first operand is less than second operand",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "<",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "44d41058-f20e-4c8d-9d35-95e1fcfb8121",
                    "type": "boolean",
                    "script": "({{1}} > {{2}})",
                    "help": "first operand is greater than second operand",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": ">",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "fa03d3e2-0c28-4c35-a5e4-ed1b17d831a0",
                    "type": "number",
                    "script": "randint({{1}}, {{2}})",
                    "help": "random number between two numbers (inclusive)",
                    "sockets": [
                        {
                            "name": "pick random",
                            "type": "number",
                            "value": "1"
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2e897518-31d8-4cc2-bd6e-2ede0b3136d0",
                    "type": "number",
                    "script": "({{1}} % {{2}})",
                    "help": "modulus of a number is the remainder after whole number division",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "mod",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5e341dc5-f328-4b81-bbb7-aed3ffc81e01",
                    "type": "number",
                    "script": "Math.round({{1}})",
                    "help": "rounds to the nearest whole number",
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
                    "id": "ca74d36c-1879-4b41-b04b-587ca56b9a77",
                    "type": "number",
                    "script": "Math.abs({{1}})",
                    "help": "converts a negative number to positive, leaves positive alone",
                    "sockets": [
                        {
                            "name": "absolute of",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "802a9575-523b-4b6a-961d-e6aed148bdd4",
                    "type": "number",
                    "script": "rad2deg(Math.acos({{1}}))",
                    "help": "inverse of cosine",
                    "sockets": [
                        {
                            "name": "arccosine degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "441f5159-878a-4109-8030-8d8f9504977e",
                    "type": "number",
                    "script": "rad2deg(Math.asin({{1}}))",
                    "help": "inverse of sine",
                    "sockets": [
                        {
                            "name": "arcsine degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "834c4446-6c32-444a-9c3d-cad449eff941",
                    "type": "number",
                    "script": "rad2deg(Math.atan({{1}}))",
                    "help": "inverse of tangent",
                    "sockets": [
                        {
                            "name": "arctangent degrees of",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2ce4d35d-3c82-4f5e-9e27-894939291ad3",
                    "type": "number",
                    "script": "Math.ceil({{1}})",
                    "help": "rounds up to nearest whole number",
                    "sockets": [
                        {
                            "name": "ceiling of",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "db690432-b321-434e-9044-b1188e581f99",
                    "type": "number",
                    "script": "Math.cos(deg2rad({{1}}))",
                    "help": "ratio of the length of the adjacent side to the length of the hypotenuse",
                    "sockets": [
                        {
                            "name": "cosine of",
                            "type": "number",
                            "value": "10",
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9f89f604-2498-4149-9fc7-8bb19391e37d",
                    "type": "number",
                    "script": "Math.sin(deg2rad({{1}}))",
                    "help": "ratio of the length of the opposite side to the length of the hypotenuse",
                    "sockets": [
                        {
                            "name": "sine of",
                            "type": "number",
                            "value": "10",
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d940a5b5-ba8a-49f0-b836-5e460e258a42",
                    "type": "number",
                    "script": "Math.tan(deg2rad({{1}}))",
                    "help": "ratio of the length of the opposite side to the length of the adjacent side",
                    "sockets": [
                        {
                            "name": "tangent of",
                            "type": "number",
                            "value": "10",
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f2127de3-d601-49fa-9ebf-79ae34c576bd",
                    "type": "number",
                    "script": "Math.pow({{1}}, {{2}})",
                    "help": "multiply a number by itself the given number of times",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "to the power of",
                            "type": "number",
                            "value": "2"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "df79282c-43bc-43dc-8d29-2dea29d33f00",
                    "type": "number",
                    "script": "Math.sqrt({{1}})",
                    "help": "the square root is the same as taking the to the power of 1/2",
                    "sockets": [
                        {
                            "name": "square root of",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4b357bdd-630c-4574-96e7-518fb7998702",
                    "script": "Math.PI;",
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
                    "id": "bdbfe741-bfb9-44fc-873d-e0513b02b87a",
                    "script": "Math.PI * 2",
                    "type": "number",
                    "help": "tau is 2 times pi, a generally more useful number",
                    "sockets": [
                        {
                            "name": "tau"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a25bdd5e-6847-4275-9b7f-bc147acd5f31",
                    "type": "int",
                    "script": "({{1}} && {{2}})",
                    "help": "Bitwise AND of 2 numbers",
                    "sockets": [
                        {
                            "name": "",
                            "type": "int",
                            "value": 0
                        },
                        {
                            "name": "AND",
                            "type": "int",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "0e4219de-1d1b-42ef-9dfa-ac090fddde02",
                    "type": "int",
                    "script": "({{1}} | {{2}})",
                    "help": "Bitwise OR of 2 numbers",
                    "sockets": [
                        {
                            "name": "",
                            "type": "int",
                            "value": 9
                        },
                        {
                            "name": "OR",
                            "type": "int",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c383c0e3-dbe0-4104-b200-8dd569ea241c",
                    "type": "int",
                    "script": "({{1}} ^ {{2}})",
                    "help": "Bitwise XOR of 2 numbers",
                    "sockets": [
                        {
                            "name": "",
                            "type": "int",
                            "value": 0
                        },
                        {
                            "name": "XOR",
                            "type": "int",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "64a12634-f17b-410b-a5e1-a2f6e0b91689",
                    "type": "int",
                    "script": "(~ {{1}})",
                    "help": "Bitwise NOT number",
                    "sockets": [
                        {
                            "name": "NOT",
                            "type": "int",
                            "value": 0
                        }
                    ]
                }
            ]
        }
    );
})(wb);