(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "objects",
            "name": "Objects",
            "help": "Objects are key/value containers. Keys must be strings, but values can be any type.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "26ee5e5c-5405-453f-8941-26ac6ea009ec",
                    "script": "local.object## = {};",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "object##"
                                }
                            ],
                            "script": "local.object##",
                            "type": "object"
                        }
                    ],
                    "help": "create a new, empty object",
                    "sockets": [
                        {
                            "name": "new object##"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "ee86bcd0-10e3-499f-9a81-6738374c0c1f",
                    "script": "{{1}}[{{2}}] = {{3}};",
                    "help": "set the key/value of an object",
                    "sockets": [
                        {
                            "name": "object",
                            "type": "any"
                        },
                        {
                            "name": "key",
                            "type": "string"
                        },
                        {
                            "name": "= value",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7ca6df56-7c25-4c8c-98ef-8dfef90eff36",
                    "script": "{{1}}[{{2}}]",
                    "type": "any",
                    "help": "return the value of the key in an object",
                    "sockets": [
                        {
                            "name": "object",
                            "type": "any"
                        },
                        {
                            "name": "value at key",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "cd07f8d6-d2cb-475b-b1fb-1ee8392e0b14",
                    "script": "{{1}}[{{2}}].apply({{1}},{{3}});",
                    "help": "call instance method",
                    "sockets": [
                        {
                            "name": "object",
                            "type": "any"
                        },
                        {
                            "name": "method name",
                            "type": "string"
                        },
                        {
                            "name": "arguments",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "322da80d-d8e2-4261-bab7-6ff0ae89e5f4",
                    "script": "Object.keys({{1}}).forEach(function(key){local.key = key; local.item = {{1}}[key]; [[1]] });",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "key"
                                }
                            ],
                            "script": "local.key",
                            "help": "key of current item in object",
                            "type": "string"
                        },
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "item"
                                }
                            ],
                            "script": "local.item",
                            "help": "the current item in the iteration",
                            "type": "any"
                        }
                    ],
                    "help": "run the blocks with each item of a object",
                    "sockets": [
                        {
                            "name": "for each item in",
                            "type": "any",
                            "suffix": "do"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);