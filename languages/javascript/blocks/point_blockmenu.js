(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "points",
            "name": "Points",
            "help": "Point blocks represent and manipulate x,y coordinates.",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "71eb3271-6dc0-4a82-81cc-4c50d8acb9e7",
                    "script": "{x: {{1}}, y: {{2}} }",
                    "type": "point",
                    "help": "create a new point",
                    "sockets": [
                        {
                            "name": "point at x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "efe5e679-8336-4e5a-ade0-4bd930826096",
                    "type": "point",
                    "script": "{x: {{1}}[0], y: {{1}}[1]}",
                    "help": "convert array to point",
                    "sockets": [
                        {
                            "name": "point from array",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "29803c49-5bd5-4473-bff7-b3cf66ab9711",
                    "type": "point",
                    "script": "{x: randint(0, global.stage_width), y: randint(0, global.stage_height)}",
                    "help": "returns a point at a random location on the stage",
                    "sockets": [
                        {
                            "name": "random point"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "36f0eb56-9370-402d-83ef-99201a62c732",
                    "script": "{{1}}.x",
                    "type": "number",
                    "help": "get the x value of a point",
                    "sockets": [
                        {
                            "name": "point",
                            "type": "point",
                            "suffix": "x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "90b42cf3-185d-4556-b7e8-d9682c187425",
                    "script": "{{1}}.y",
                    "type": "number",
                    "help": "get the y value of a point",
                    "sockets": [
                        {
                            "name": "point",
                            "type": "point",
                            "suffix": "y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "743cba63-11d4-4a84-a3b6-a98480bdd731",
                    "script": "[{{1}}.x, {{1}}.y]",
                    "type": "array",
                    "help": "convert a point to an array",
                    "sockets": [
                        {
                            "name": "point",
                            "type": "point",
                            "suffix": "as array"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);