(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "math",
            "name": "Math",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "cbb65aa7-b36c-4311-a479-f1776579dcd3",
                    "type": "number",
                    "script": "({{1}} + {{2}})",
                    "help": "Add two numbers",
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
                    "id": "594700d5-64c6-4b21-bc70-f3fbf6913a69",
                    "type": "number",
                    "script": "({{1}} - {{2}})",
                    "help": "Subtract two numbers",
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
                    "id": "afec758c-7ccc-4ee5-8d2c-f95160da83d4",
                    "type": "number",
                    "script": "({{1}} * {{2}})",
                    "help": "Multiply two numbers",
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
                    "id": "5cec08b8-eb58-4ef0-a73e-f5245d6859a2",
                    "type": "number",
                    "script": "({{1}} / {{2}})",
                    "help": "Divide two numbers",
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
                    "id": "90a5d524-fa8a-4a52-a4df-0beb83d32c40",
                    "type": "number",
                    "script": "(random({{1}}, {{2}}))",
                    "help": "Generate a random number between two other numbers",
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
                    "blocktype": "step",
                    "id": "d35330ee-5b49-492b-b7dd-41c3fd1496d0",
                    "script": "(randomSeed({{1}}))",
                    "help": "",
                    "sockets": [
                        {
                            "name": "set seed for random numbers to",
                            "type": "number",
                            "value": "1"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7f047e8a-3a87-49f8-b9c7-daad742faa9d",
                    "type": "boolean",
                    "script": "({{1}} < {{2}})",
                    "help": "Check if one number is less than another",
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
                    "id": "faddd68c-6c75-4908-9ee6-bccc246f9d89",
                    "type": "boolean",
                    "script": "({{1}} == {{2}})",
                    "help": "Check if one number is equal to another",
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
                    "id": "e4d81ccd-f9dc-4a0b-b41f-a5cd146a8c27",
                    "type": "boolean",
                    "script": "({{1}} > {{2}})",
                    "help": "Check if one number is greater than another",
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
                    "id": "8353c1f3-a1da-4d80-9bf9-0c9584c3896b",
                    "type": "number",
                    "script": "({{1}} % {{2}})",
                    "help": "Gives the remainder from the division of these two number",
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
                    "id": "1fde8b93-1306-4908-97c8-d628dd91eb4f",
                    "type": "int",
                    "script": "(int({{1}}))",
                    "help": "Gives the whole number, without the decimal part",
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
                    "id": "b7634de4-69ed-492c-bc9a-16ac3bb5ca45",
                    "type": "number",
                    "script": "(abs({{1}}))",
                    "help": "Gives the positive of the number",
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
                    "id": "20268318-b168-4519-a32a-10b94c264226",
                    "type": "float",
                    "script": "(cos((180 / {{1}})/ 3.14159))",
                    "help": "Gives the cosine of the angle",
                    "sockets": [
                        {
                            "name": "cosine of",
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
                    "id": "86c2f303-861f-4ad7-a7de-3108637ce264",
                    "type": "float",
                    "script": "(sin((180 / {{1}})/ 3.14159))",
                    "help": "Gives the sine of the angle",
                    "sockets": [
                        {
                            "name": "sine of",
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
                    "id": "0e018648-0b45-4096-9052-e3080a47793a",
                    "type": "float",
                    "script": "(tan((180 / {{1}})/ 3.14159))",
                    "help": "Gives the tangent of the angle given",
                    "sockets": [
                        {
                            "name": "tangent of",
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
                    "id": "814444c5-f3f4-4412-975c-7284409f1f3d",
                    "type": "number",
                    "script": "(pow({{1}}, {{2}}))",
                    "help": "Gives the first number multiplied by itself the second number of times",
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
                    "id": "1f4df24e-22ea-460e-87c5-4b0f92e233ce",
                    "type": "float",
                    "script": "(sqrt({{1}}))",
                    "help": "Gives the two numbers that if multiplied will be equal to the number input",
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
                    "id": "18a0560d-beff-43da-8708-55398cc08d30",
                    "type": "string",
                    "script": "{{1}}",
                    "help": "Allows you to use a numeric result as a string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "as string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e37dae6d-608f-43e9-9cd9-57ff03aba29d",
                    "type": "number",
                    "script": "map({{1}}, 0, 1023, 0, 255)",
                    "help": "",
                    "sockets": [
                        {
                            "name": "Map",
                            "type": "number",
                            "value": null
                        },
                        {
                            "name": "from Analog in to Analog out"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "007bccc5-36b2-4ff8-a0bc-f80def66ff49",
                    "type": "number",
                    "script": "map({{1}}, 0, 1023, 0, 255)",
                    "help": "",
                    "sockets": [
                        {
                            "name": "Map",
                            "type": "number",
                            "value": null
                        },
                        {
                            "name": "from",
                            "type": "number",
                            "value": "0]-[number"
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": "0]-[number"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);