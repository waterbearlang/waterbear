(function(wb){
    'use strict';
    wb.menu({
        "sectionkey": "number",
        "name": "Number",
        "help": "Number blocks are for manipulating numbers",
        "blocks": [
            {
                "blocktype": "expression",
                "id": "1903b821-7a16-4b83-9f2f-b25be0172a2c",
                "type": "number",
                "script": "(+ {{1}} {{2}})",
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
                "id": "9c1bdfa2-6485-4d31-a28f-66369c7926ac",
                "type": "number",
                "script": "(- {{1}} {{2}})",
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
                "id": "d713eed8-7f3c-4b83-9ca6-507e73f03ad5",
                "type": "number",
                "script": "(* {{1}} {{2}})",
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
                "id": "7a52bc02-d5a0-4a1e-b0c3-8e2cf3484eb5",
                "type": "number",
                "script": "(integer-divide {{1}} {{2}})",
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
                "id": "a5da44a9-311b-4a5d-8530-9561d89b2fe9",
                "type": "boolean",
                "script": "(= {{1}} {{2}})",
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
                "id": "eff105da-5c3b-4e73-83f6-8f181308ad7c",
                "type": "boolean",
                "script": "(not (= {{1}} {{2}}))",
                "help": "two operands are not equal",
                "sockets": [
                    {
                        "name": "",
                        "type": "number",
                        "value": "0"
                    },
                    {
                        "name": "≠",
                        "type": "number",
                        "value": "0"
                    }
                ],
                "keywords": [
                    "comparison",
                    "not equal"
                ]
            },
            {
                "blocktype": "expression",
                "id": "03976d69-145e-44db-8709-9a218bcc7a76",
                "type": "boolean",
                "script": "(< {{1}} {{2}})",
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
                "id": "6b17e888-1294-43a1-a8ba-42bd3a47d746",
                "type": "boolean",
                "script": "(<= {{1}} {{2}})",
                "help": "first operand is less than or equal to second operand",
                "sockets": [
                    {
                        "name": "",
                        "type": "number",
                        "value": "0"
                    },
                    {
                        "name": "≤",
                        "type": "number",
                        "value": "0"
                    }
                ],
                "keywords": [
                    "comparison",
                    "less than or equal to"
                ]
            },
            {
                "blocktype": "expression",
                "id": "ad87c5bf-a5cd-4bd7-ae44-c092570b9bbf",
                "type": "boolean",
                "script": "(> {{1}} {{2}})",
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
                "id": "ffa1a5e1-e2c2-4e79-946f-3a5bd1e937be",
                "type": "boolean",
                "script": "(>= {{1}} {{2}})",
                "help": "first operand is greater than or equal to second operand",
                "sockets": [
                    {
                        "name": "",
                        "type": "number",
                        "value": "0"
                    },
                    {
                        "name": "≥",
                        "type": "number",
                        "value": "0"
                    }
                ],
                "keywords": [
                    "comparison",
                    "greater than or equal to"
                ]
            },
            {
                "blocktype": "expression",
                "id": "bd9480c6-058d-4469-aa65-84142449ecbd",
                "type": "number",
                "script": "(remainder {{1}} {{2}})",
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
                "id": "264b3ec9-c7d1-421b-a4ec-a722e885938d",
                "type": "number",
                "script": "(abs {{1}})",
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
                "id": "b7b6c1cd-7d21-4d14-9165-d0316f178a44",
                "type": "number",
                "script": "(gcd {{1}} {{2}})",
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
                "id": "c44aa944-7677-4e0f-b834-f733d0a6a52d",
                "type": "number",
                "script": "(lcm {{1}},{{2}})",
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
                "id": "238752de-dfad-4ac3-9ac3-883f3181049b",
                "type": "number",
                "script": "(max {{1}} {{2}})",
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
                "id": "f9bf9de2-175d-46df-9eb0-788ed32c1781",
                "type": "number",
                "script": "(min {{1}} {{2}})",
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
                "id": "dc2be559-bbf5-423e-a396-e331c14eb535",
                "type": "number",
                "script": "(min {{1}} {{2}})",
                "help": "the smaller of the two arguments",
                "sockets": [
                    {
                        "name": "number",
                        "type": "number"
                    }
                ],
                "keywords": [
                    "minimum"
                ]
            }
        ]
    });
})(wb);