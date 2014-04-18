(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "date",
            "name": "Date",
            "help": "Date blocks are used to work with dates and times",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "31007d66-3b78-43d8-a295-89bc81cb62d9",
                    "script": "local.date## = new Date();",
                    "help": "create a date block",
                    "sockets": [
                        {
                            "name": "date##"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "expression",
                            "type": "date",
                            "script": "local.date##",
                            "help": "current location",
                            "sockets": [
                                {
                                    "name": "date##"
                                }
                            ]
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "795bacf1-3abd-4e04-b181-baab9bcf6721",
                    "type": "number",
                    "script": "{{1}}.getFullYear()",
                    "help": "get the year (four digits)",
                    "sockets": [
                        {
                            "name": "get the year",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1a14fa64-bf53-4584-95fe-9d6bf0cc823a",
                    "type": "number",
                    "script": "({{1}}.getMonth() + 1)",
                    "help": "get the month (from 1-12)",
                    "sockets": [
                        {
                            "name": "get the month",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c2aa55be-42a0-4831-b554-b35680f81dfd",
                    "type": "number",
                    "script": "{{1}}.getDate()",
                    "help": "get the day of the month (from 1-31)",
                    "sockets": [
                        {
                            "name": "get the date",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f5958007-0839-4491-a176-e2599169cb16",
                    "type": "number",
                    "script": "{{1}}.getHours()",
                    "help": "get the hour (from 0-23)",
                    "sockets": [
                        {
                            "name": "get the hour",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "00128be4-a08d-44cc-99a1-47eaaff6ecf4",
                    "type": "number",
                    "script": "{{1}}.getMinutes()",
                    "help": "get the minutes (from 0-59)",
                    "sockets": [
                        {
                            "name": "get the minutes",
                            "type": "date",
            				"block": ""
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f26108f4-3427-4489-abd3-af9e26315f2f",
                    "type": "number",
                    "script": "{{1}}.getSeconds()",
                    "help": "get the seconds (from 0-59)",
                    "sockets": [
                        {
                            "name": "get the seconds",
                            "type": "date",
            				"block": ""
                        }
                    ]
                }
            ]
        }
    );
})(wb);