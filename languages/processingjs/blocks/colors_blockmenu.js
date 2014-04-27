(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "colors",
            "name": "Colors",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "da9a266b-8ec0-4b97-bd79-b8pc0s4996f",
                    "type": "color",
                    "script": "color(random(0,255), random(0,255), random(0,255), random(0,255))",
                    "help": "Returns a random RBG color",
                    "sockets": [
                        {
                            "name": "random color"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "01123271-3dc0-6a82-01cc-mc50dlwcb9e7",
                    "script": "background(color({{1}}));",
                    "help": "Set background color",
                    "sockets": [
                        {
                            "name": "background color",
                            "type": "color",
                            "value": "#0000000"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "21543271-6dc0-4a82-818c-4556d712b90",
                    "script": "fill(color({{1}}));",
                    "help": "Sets the color used to fill shapes",
                    "sockets": [
                        {
                            "name": "fill color",
                            "type": "color",
                            "value": "#0000000"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "01983271-6dc0-wa82-81cc-4c50d88cb0e",
                    "script": "stroke(color({{1}}));",
                    "help": "Sets the color used to draw lines and borders around shapes",
                    "sockets": [
                        {
                            "name": "stroke color",
                            "type": "color",
                            "value": "#0000000"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "06723171-6d20-4a32-814c-2c50d92b29ew",
                    "script": "noFill();",
                    "help": "Disables filling geometry",
                    "sockets": [
                        {
                            "name": "noFill"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "16723171-6d20-4a32-814c-2c50d94b296w",
                    "script": "noStroke();",
                    "help": "Disables drawing the stroke (outline)",
                    "sockets": [
                        {
                            "name": "noStroke"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "0237b5ab-d22a-45f9-af38-4a64bc98dbc3",
                    "script": "colorMode({{1}}, {{2}});",
                    "help": "Changes the way Processing interprets color data",
                    "sockets": [
                        {
                            "name": "color mode",
                            "type": "string",
                            "options": "mode",
                            "value": ""
                        },
                        {
                            "name": "range",
                            "type": "number",
                            "value": "255"
                        }
                    ]
                }
            ]
        }
        
        
    );
})(wb);