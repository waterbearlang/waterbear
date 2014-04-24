(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "boolean",
            "name": "Boolean",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "03d1df81-c7de-40a0-a88f-95b732d19936",
                    "type": "boolean",
                    "script": "({{1}} && {{2}})",
                    "help": "Check if both are true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "and",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "482db566-b14b-4381-8135-1e29f8c4e7c3",
                    "type": "boolean",
                    "script": "({{1}} || {{2}})",
                    "help": "Check if one is true",
                    "sockets": [
                        {
                            "name": "",
                            "type": "boolean",
                            "value": null
                        },
                        {
                            "name": "or",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "866a1181-e0ff-4ebc-88dd-55e2b70d7c52",
                    "type": "boolean",
                    "script": "(! {{1}})",
                    "help": "Not true is false and Not false is true",
                    "sockets": [
                        {
                            "name": "not",
                            "type": "boolean",
                            "value": null
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);