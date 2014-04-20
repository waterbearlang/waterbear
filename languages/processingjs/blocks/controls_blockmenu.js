(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "control",
            "name": "Control",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "079b2b89-41c2-4d00-8n21-rcf62146960",
                    "script": "int variable## = {{1}};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "script": "variable##",
                            "type": "number",
                            "sockets": [
                                {
                                    "name": "variable##"
                                }
                            ]
                        }
                    ],
                    "help": "Create a integer variable reference to re-use",
                    "sockets": [
                        {
                            "name": "int variable value",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "079b2b89-41c2-4d00-8e21-bcd62f4bm90",
                    "script": "char variable## = {{1}};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "script": "variable##",
                            "type": "string",
                            "sockets": [
                                {
                                    "name": "variable##"
                                }
                            ]
                        }
                    ],
                    "help": "Create a char variable reference to re-use",
                    "sockets": [
                        {
                            "name": "char variable value",
                            "type": "string",
                            "value": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b4036693-8645-4852-a4de-9e96565f92ec",
                    "script": "{{1}} = {{2}};",
                    "help": "First argument must be a variable",
                    "sockets": [
                        {
                            "name": "set variable",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "to",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9AED48C9-A90B-49FB-9C1A-FD632F0313F5",
                    "script": "{{1}} += {{2}};",
                    "help": "First argument must be a variable",
                    "sockets": [
                        {
                            "name": "increment variable",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "by",
                            "type": "any",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9AED48C9-A90B-49FB-9C1b-3r63eFs313F",
                    "script": "{{1}} += {{2}};",
                    "type": "number",
                    "help": "First argument must be a variable",
                    "sockets": [
                        {
                            "name": "update variable",
                            "type": "any",
                            "value": null
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
                    "id": "20ba3e08-74c0-42de-b6f2-938409e63ce0",
                    "script": "if({{1}}){[[2]]}",
                    "help": "Allows the program to make a decision about which code to execute",
                    "sockets": [
                        {
                            "name": "if",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "l0k23e48-74cp-420e-b6m2-n379po6lce0",
                    "script": "else {[[2]]}",
                    "help": "It specifies a block of code to execute when the expression in if() is false",
                    "sockets": [
                        {
                            "name": "else"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "l0k23e48-74n0-42ge-b61h-cjk456x3ce0",
                    "script": "else if({{1}}){[[2]]}",
                    "help": "It specifies a block of code to execute when the expression in if() is false",
                    "sockets": [
                        {
                            "name": "else if",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
        
                {
                    "blocktype": "context",
                    "id": "1cf8132a-4996-45db-b482-4lkshre13c1",
                    "script": "for( {{1}}; {{2}}; {{3}}) { [[4]] }",
                    "help": "Controls a sequence of repetitions",
                    "sockets": [
                        {
                            "name": "for init",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "test",
                            "type": "any",
                            "value": null
                        },
                        {
                            "name": "update",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "1cf8132a-49y6-455b-b432-3posh2e13c1",
                    "script": "while( {{1}} ) { [[2]] }",
                    "help": "Controls a sequence of repetitions",
                    "sockets": [
                        {
                            "name": "while",
                            "type": "any",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e3a5ea20-3ca9-42cf-ac02-77ff32836a7e",
                    "type": "boolean",
                    "script": "({{1}} == {{2}})",
                    "help": "Determines if two values are equivalent",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "==",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d753757b-a7d4-4d84-99f1-cb9b567e62da",
                    "type": "boolean",
                    "script": "({{1}} < {{2}})",
                    "help": "Tests if the value on the left is smaller than the value on the right",
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
                    "id": "d753757b-a7d4-4d84-99f1-cb9bou7e62da",
                    "type": "boolean",
                    "script": "({{1}} <= {{2}})",
                    "help": "Tests if the value on the left is less than the value on the right or if the values are equivalent",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "<=",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },        {
                    "blocktype": "expression",
                    "id": "5a1f5f68-d74b-4154-b376-6a0209f585ed",
                    "type": "boolean",
                    "script": "({{1}} > {{2}})",
                    "help": "Tests if the value on the left is larger than the value on the right",
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
                    "id": "5a1f5f58-d76b-4184-b376-5a32rff585ed",
                    "type": "boolean",
                    "script": "({{1}} >= {{2}})",
                    "help": "Tests if the value on the left is larger than the value on the right or if the values are equivalent",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": ">=",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5a1f5f58-d76b-4184-b376-098245f4854d",
                    "type": "boolean",
                    "script": "({{1}} != {{2}})",
                    "help": "Determines if one expression is not equivalent to another",
                    "sockets": [
                        {
                            "name": "",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "!=",
                            "type": "number",
                            "value": "0"
                        }
                    ]
                }
            ]
        }
        
        
    );
})(wb);