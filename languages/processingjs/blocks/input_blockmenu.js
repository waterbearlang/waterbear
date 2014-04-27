(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "input",
            "name": "Input",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "01124271-6dc0-4j82-81kc-4si0i88c3907",
                    "script": "mouseButton",
                    "type": "boolean",
                    "help": "Tracks if the mouse button is pressed and which button is pressed",
                    "sockets": [
                        {
                            "name": "mouse button"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "01124271-6dc0-4482-813c-4320331c3f07",
                    "script": "mousePressed",
                    "type": "boolean",
                    "help": "Variable storing if a mouse button is pressed",
                    "sockets": [
                        {
                            "name": "mousePressed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "01124271-6dc0-4a82-81cc-4050308c3907",
                    "script": "mouseX",
                    "type": "number",
                    "help": "Contains the current horizontal coordinate of the mouse",
                    "sockets": [
                        {
                            "name": "mouseX"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "01124271-6dc0-4a82-81cc-47h737lc39p7",
                    "script": "mouseY",
                    "type": "number",
                    "help": "Contains the current vertical coordinate of the mouse",
                    "sockets": [
                        {
                            "name": "mouseY"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "11134251-6dc0-4a82-81cc-4s5938893997",
                    "script": "pmouseX",
                    "type": "number",
                    "help": "Contains the previous horizontal coordinate of the mouse",
                    "sockets": [
                        {
                            "name": "pmouseX"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "21124231-64c0-4a82-81cc-9s50358c3508",
                    "script": "pmouseY",
                    "type": "number",
                    "help": "Contains the previous vertical coordinate of the mouse",
                    "sockets": [
                        {
                            "name": "pmouseY"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1c4813ra-4v96-45ds-ee82-3e132200e3c8",
                    "script": "void mouseClicked(){[[1]]}",
                    "help": "Called once after a mouse button has been pressed and then released",
                    "sockets": [
                        {
                            "name": "mouse clicked"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1c4813ra-4v96-45ds-ee82-6e6372048340",
                    "script": "void mouseDragged(){[[1]]}",
                    "help": "Called once every time the mouse moves and a mouse button is pressed",
                    "sockets": [
                        {
                            "name": "mouse dragged"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1248334a-4v56-453s-ee82-4e654203e32a",
                    "script": "void mouseMoved(){[[1]]}",
                    "help": "Called every time the mouse moves and a mouse button is not pressed",
                    "sockets": [
                        {
                            "name": "mouse moved"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1244384a-4v86-473s-e582-34135207e38a",
                    "script": "void mouseOut(){[[1]]}",
                    "help": "Called when the mouse pointer leaves a sketch",
                    "sockets": [
                        {
                            "name": "mouse out"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1244384a-4v86-473s-e582-0e939e44s34x",
                    "script": "void mouseOver(){[[1]]}",
                    "help": "Called when the mouse pointer moves over the sketch",
                    "sockets": [
                        {
                            "name": "mouse over"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1244384a-4v86-473s-e582-t9r62ei934a",
                    "script": "void mousePressed(){[[1]]}",
                    "help": "Called once after every time a mouse button is pressed",
                    "sockets": [
                        {
                            "name": "mouse pressed"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1244384a-4v86-473s-e582-2e2634id39a",
                    "script": "void mouseReleased(){[[1]]}",
                    "help": "Called every time a mouse button is released",
                    "sockets": [
                        {
                            "name": "mouse released"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "01124271-6dc0-4a82-81cc-4swb3a8v39e7",
                    "script": "key",
                    "type": "string",
                    "help": "Contains the value of the most recently pressed key on the keyboard",
                    "sockets": [
                        {
                            "name": "key"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "81926274-63cn-4d82-e1cc-4s533a8v39e7",
                    "script": "keyCode",
                    "type": "number",
                    "help": "Used to detect special keys ",
                    "sockets": [
                        {
                            "name": "key code"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8192ib74-63an-4de2-e1gc-4m5b3l8vcpe0",
                    "script": "keyPressed",
                    "type": "boolean",
                    "help": "True if any key is pressed and false if no keys are pressed",
                    "sockets": [
                        {
                            "name": "key pressed"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1j4538ja-4vf6-473s-er82-2r2f31ids9a",
                    "script": "void keyPressed(){[[1]]}",
                    "help": "Called once every time a key is pressed",
                    "sockets": [
                        {
                            "name": "when key pressed"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1s45h8ja-4vf6-473s-er82-9rkf3pidsgi",
                    "script": "void keyReleased(){[[1]]}",
                    "help": "Called once every time a key is released",
                    "sockets": [
                        {
                            "name": "key released"
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "1s45h8ja-4vf6-473s-er82-2r2fd5igsg9p",
                    "script": "void keyTyped(){[[1]]}",
                    "help": "Called once every time a key is pressed",
                    "sockets": [
                        {
                            "name": "key typed"
                        }
                    ]
                }
            ]
        }
        
        
    );
})(wb);