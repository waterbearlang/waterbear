(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "environment",
            "name": "Environment",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "da2c8203-bf80-4647-a762-928d477b5a27",
                    "script": "height",
                    "type": "number",
                    "help": "System variable which stores the height of the display window",
                    "sockets": [
                        {
                            "name": "height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "nadc82i3-bf70-4617-a732-920d497b5a27",
                    "script": "width",
                    "type": "number",
                    "help": "System variable which stores the width of the display window",
                    "sockets": [
                        {
                            "name": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "25pc82i3-bf70-4617-a732-920c4n7bya2",
                    "script": "frameCount",
                    "type": "number",
                    "help": "The system variable frameCount contains the number of frames displayed since the program started",
                    "sockets": [
                        {
                            "name": "frame count"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "71eb3271-6de0-4122-82cc-4c5077ac19e7",
                    "script": "frameRate({{1}});",
                    "help": "Set frame rate",
                    "sockets": [
                        {
                            "name": "frame rate",
                            "type": "number",
                            "value": "60"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "916c79df-40f1-4280-a0p3-6d0df954d87e",
                    "script": "alert(\"{{1}} value =\"+ {{1}});",
                    "help": "Alert the user some information",
                    "sockets": [
                        {
                            "name": "print",
                            "type": "any",
                            "value": null
                        }
                    ]
                }
            ]
        }
        
        
    );
})(wb);