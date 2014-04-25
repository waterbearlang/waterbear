(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "mcplayer",
            "name": "Minecraft Player",
            "help": "Find and move Steve the Minecraft player",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "fe8f0ff3-1f52-4866-bbf0-bc3c7a850e11",
                    "sockets": [
                        {
                            "name": "Get Player Tile Position"
                        }
                    ],
                    "script": "client.getTile(function(playerposition){[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Player Position"
                                }
                            ],
                            "script": "playerposition",
                            "type": "position"
                        },
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Player Stood on Position"
                                }
                            ],
                            "script": "playerposition.minus(v(0,1,0))",
                            "type": "position"
                        },
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Player Position as text"
                                }
                            ],
                            "script": "playerposition.toString()",
                            "type": "string"
                        }
                    ],
                    "help": "Get the tile that the player is on"
                },
                {
                    "blocktype": "expression",
                    "id": "91db1ebb-a2c4-44b3-a897-72a8e9764ae9",
                    "sockets": [
                        {
                            "name": "Player Position"
                        }
                    ], 
                    "type":"position",
                    "script": "playerposition",
                    "help": "position"
                }, 
                {
                    "blocktype": "step",
                    "id": "5474d53a-b671-4392-b299-d10339ad12af",
                    "sockets": [
                        {
                            "name": "Create Position## from",
                            "type": "position",
                            "block": "91db1ebb-a2c4-44b3-a897-72a8e9764ae9"
                        },
                        {   
                            "name": "offset by",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "var position## = {{1}}.plus({{2}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "Position##"
                                }
                            ],
                            "script": "position##",
                            "type": "position"
                        }
                    ],
                    "help": "Create new position relative to Player position"
                },
                {
                    "blocktype": "step",
                    "id": "0ff6e19b-74ee-415e-805a-c46cd2e6ee6e",
                    "sockets": [
                        {
                            "name": "Move Player to",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        }
                    ],
                    "script": "client.setTile({{1}});",
                    "help": "Move Player to position"
                }
                
            
            ]
        }
        
    );
})(wb);