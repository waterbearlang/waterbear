(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "pibrella",
            "name": "PiBrella",
            "help": "Physical Input and Output for the Raspberry Pi using a PiBrella board.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "cecd70c5-e733-4f36-83f3-aec34a70f75b",
                    "script": "output## = new Gpio({{1}}, 'out');",
                    "help": "Create a named pin set to output",
                    "sockets": [
                        {
                            "name": "Create output## using",
                            "type": "number",
                            "options": "pibrellaout",
                            "value": null
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "step",
                            "sockets": [
                                {
                                    "name": "output##"
                                },
                                {
                                    "name": "=",
                                    "type": "boolean",
                                    "value": null
                                }
                            ],
                            "script": "output##.writeSync(({{1}})?1:0);"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f2c60382-47b4-40d7-8117-c790a866c104",
                    "script": "input## = new Gpio({{1}}, 'in');",
                    "help": "Create a named pin set to input",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "input##"
                                }
                            ],
                            "script": "(input##.readSync() === 1)",
                            "help": "Is the digital input pin ON",
                            "type": "boolean"
                        }
                    ],
                    "sockets": [
                        {
                            "name": "Create input## using Input Pin",
                            "type": "number",
                            "options": "pibrellain",
                            "value": 11
                        }
                    ]
                },
                {
                    "blocktype": "context",
                    "id": "e57b641a-3de8-4ecd-90bc-77a1277b8066",
                    "script": "watcher## = new Gpio({{1}}, 'in', {{2}}, {\"debounceTimeout\":{{3}}}); watcher##.watch(function(err, watcherval){[[1]]})",
                    "help": "Create a named pin set to input",
                    "sockets": [
                        {
                            "name": "Watch for",
                            "type": "number",
                            "options": "pibrellain",
                            "value": 11
                        },
                        {
                            "name": "to",
                            "type": "string",
                            "options": "pibrellaedge",
                            "value": "both"
                        },
                        {
                            "name": "debounce",
                            "type": "number",
                            "value": 100,
                            "suffix": "ms"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "value"
                                }
                            ],
                            "script": "(watcherval === 1)",
                            "help": "value from input",
                            "type": "boolean"
                        }
                    ]
                }
                
                
            ]
        }
    );
})(wb);