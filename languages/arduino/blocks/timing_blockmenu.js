(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "timing",
            "name": "Timing",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "5f4a98ff-3a12-4f2d-8327-7c6a375c0192",
                    "script": "delay(1000*{{1}});",
                    "help": "pause before running subsequent blocks",
                    "sockets": [
                        {
                            "name": "wait",
                            "type": "int",
                            "value": "1"
                        },
                        {
                            "name": "secs"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "937921ed-49f4-4915-ba39-be217ddb6175",
                    "type": "int",
                    "script": "(millis())",
                    "help": "int value of time elapsed",
                    "sockets": [
                        {
                            "name": "Milliseconds since program started"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7d4ab88b-7769-497a-8822-8f0cc92c81de",
                    "type": "int",
                    "script": "(int(millis()/1000))",
                    "help": "int value of time elapsed",
                    "sockets": [
                        {
                            "name": "Seconds since program started"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);