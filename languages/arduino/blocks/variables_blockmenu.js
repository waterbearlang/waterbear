(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "variables",
            "name": "Variables",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "eda33e3e-c6de-4f62-b070-f5035737a241",
                    "script": "String {{1}} = '{{2}}';",
                    "help": "Create a string variable",
                    "sockets": [
                        {
                            "name": "Create",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "set to",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "3423bd33-6a55-4660-ba78-2304308b653d",
                    "script": "{{1}} = '{{2}}';",
                    "help": "Change the value of an already created string variable",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "=",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "076b71fc-23eb-485a-8002-7e84abe8b6cf",
                    "type": "string",
                    "script": "{{1}}",
                    "help": "Get the value of a string variable",
                    "sockets": [
                        {
                            "name": "value of",
                            "type": "string",
                            "value": "var"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1236184b-2397-44b3-8c69-0b184e24ffd8",
                    "script": "int {{1}} = {{2}}'",
                    "help": "Create an integer variable",
                    "sockets": [
                        {
                            "name": "Create",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "set to",
                            "type": "int",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "60a81c46-fd2e-4eb4-a828-00d201534baa",
                    "script": "{{1}} = {{2}};",
                    "help": "Change the value of an already created integer variable",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "=",
                            "type": "int",
                            "value": "0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "06a44aae-31a8-4909-80b9-61151dc2d666",
                    "type": "int",
                    "script": "{{1}}",
                    "help": "Get the value of an integer variable",
                    "sockets": [
                        {
                            "name": "value of",
                            "type": "string",
                            "value": "var"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "645f8dde-a050-4106-b436-57c9f2301b17",
                    "script": "float {{1}} = {{2}}",
                    "help": "Create a decimal variable",
                    "sockets": [
                        {
                            "name": "Create",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "set to",
                            "type": "float",
                            "value": "0.0"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f487db77-3f81-47ae-8fb5-478e24019c0b",
                    "script": "{{1}} = {{2}};",
                    "help": "Change the value of an already created deciaml variable",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "=",
                            "type": "float",
                            "value": "0.0"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "705a5ef3-c0b9-49f5-885d-f195c2f4c464",
                    "type": "float",
                    "script": "{{1}}",
                    "help": "Get the value of a decimal variable",
                    "sockets": [
                        {
                            "name": "value of",
                            "type": "string",
                            "value": "var"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c4ab9c5d-4493-429c-beb1-be9b411c0a7e",
                    "script": "int {{1}} = {{2}};",
                    "help": "Create a new true or false variable",
                    "sockets": [
                        {
                            "name": "Create",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "set to",
                            "type": "boolean",
                            "value": "false"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "027bbe7b-6b50-4d94-b447-9bca02ec513f",
                    "script": "{{1}} = {{2}};",
                    "help": "Change the value of an already created true or false variable",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": "var"
                        },
                        {
                            "name": "=",
                            "type": "boolean",
                            "value": "false"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a41881a2-7cce-4ee5-98f4-c8067e3d57a6",
                    "type": "boolean",
                    "script": "{{1}}",
                    "help": "Get the value of a true or false variable",
                    "sockets": [
                        {
                            "name": "value of",
                            "type": "string",
                            "value": "var"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);