(function(wb){
    'use strict';
    wb.menu({
        "sectionkey": "control",
        "name": "Control",
        "help": "Basic Control blocks for testing",
        "blocks": [
            {
                "blocktype": "step",
                "id": "eec0910c-be04-407f-9536-f246a65222b7",
                "script": "{{1}} ;;end\n",
                "help": "Overall control block",
                "sockets": [
                    {
                        "name": "",
                        "type": "any"
                    }
                ]
            },
             {
                "blocktype": "expression",
                "type" : "any",
                "id": "eec0910c-be04-407f-9536-f246a65222c9",
                "script": "{{1}} {{2}}",
                "help": "expands a input to 2",
                "sockets": [
                    {
                        "name": "",
                        "type": "any"
                    },
                    {
                        "name": " ",
                        "type": "any"
                    }
                ]
            }
        ]
    });
})(wb);
