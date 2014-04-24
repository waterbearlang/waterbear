(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "transform",
            "name": "Transform",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "01124271-6dc0-4j82-81kc-098ehudtcb1",
                    "script": "pushMatrix();",
                    "help": "Pushes the current transformation matrix onto the matrix stack",
                    "sockets": [
                        {
                            "name": "push matrix"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "01124271-6dc0-4j82-81kc-5637dy738ue",
                    "script": "popMatrix();",
                    "help": "Pops the current transformation matrix off the matrix stack",
                    "sockets": [
                        {
                            "name": "pop matrix"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e3d6a995-4ae9-495b-bdd6-ee907d0c7915",
                    "script": "rotate({{1}});",
                    "help": "Rotates an object the amount specified by the angle parameter",
                    "sockets": [
                        {
                            "name": "rotate",
                            "type": "number",
                            "value": 30
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "916c79df-40f1-4280-a0p3-a08dh2ikzps",
                    "script": "translate({{1}}, {{2}});",
                    "help": "Specifies an amount to displace objects within the display window",
                    "sockets": [
                        {
                            "name": "translate x",
                            "type": "number",
                            "value": 30
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 20
                        }
                    ]
                }
            ]
        }
    );
})(wb);