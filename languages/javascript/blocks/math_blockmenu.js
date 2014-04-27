(function(wb){
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
                            "value": "0"
                        },
                        {
                            "name": "× 10 ^",
                            "type": "number",
                            "value": "0"
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
                    "script": "gcd({{1}},{{2}})",
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
                    "script": "lcm({{1}},{{2}})",
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
                            "value": "0"
                        },
                        {
                            "name": "and",
                            "type": "number",
                            "value": "0"
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
                            "value": "0"
                        },
                        {
                            "name": "or",
                            "type": "number",
                            "value": "0"
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
                            "value": "0"
                        },
                        {
                            "name": "xor",
                            "type": "number",
                            "value": "0"
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
                            "value": "0"
                        },
                        {
                            "name": "nand",
                            "type": "number",
                            "value": "0"
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
                            "value": "0"
                        },
                        {
                            "name": "left by",
                            "type": "number",
                            "value": "0"
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
                            "value": "0"
                        },
                        {
                            "name": "right by",
                            "type": "number",
                            "value": "0"
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
        }
        
    );
})(wb);