(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "mcblocks",
            "name": "Minecraft Blocks",
            "help": "Find and set Minecraft Blocks",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "c500a7f0-7117-40ea-9139-b161e19f190b",
                    "sockets": [
                            {
                                "name": "Get Block Type at",
                                "type": "position",
                                "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                            }
                        ],
                    "script": "client.getBlock({{1}}, function(block##){[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                    {
                                        "name": "Block Type Number"
                                    }
                                ],
                            "script": "block##",
                            "type": "number"
                        },
                        {
                            "blocktype": "expression",
                            "sockets": [
                                    {
                                        "name": "Block Type Name"
                                    }
                                ],
                            "script": "client.getBlockName(block##)",
                            "type": "string"
                        }
                    ],
                    "help": "get block type at x, y, z"
                },
                {
                    "blocktype": "expression",
                    "id": "a7c17404-8555-42be-877e-9d01d7647604",
                    "sockets": [
                            {
                            "name":"block",
                            "type": "string",
                            "options": "blocks",
                            "value": "AIR"
                        }
                        ],
                    "script": "client.blocks[{{1}}]",
                    "type": "number",
                    "help": "a blocktype"
                },
                {
                    "blocktype": "step",
                    "id": "5ac8754e-6bbe-42a8-8504-707f1ca3848b",
                    "sockets": [
                        {
                            "name": "set Block at",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "to",
                            "type": "string",
                            "options": "blocks",
                            "value": "AIR"
                        }
                    ],
                    "script": "client.setBlock({{1}}, client.blocks[{{2}}]);",
                    "help": "set block at position"
                },
                {
                    "blocktype": "step",
                    "id": "3969a128-5e8d-4320-9f91-73bebf81820f",
                    "labels": ["set Blocks between [object] and [object] to [choice:blocks:STONE]"],
                    "sockets": [
                        {
                            "name": "set Blocks between",
                        
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "and",
                            "type": "position",
                            "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                        },
                        {
                            "name": "to",
                            "type": "string",
                            "options": "blocks",
                            "value": "AIR"
                        }
                    ],
                    "script": "client.setBlocks({{1}}, {{2}}, client.blocks[{{3}}]);",
                    "help": "set blocks in a 3D rectangle between the first and second postions to .."
                },
                {
                    "blocktype": "expression",
                    "id": "7ab673d1-832b-4a0b-9dc9-0ac47892893b",
                    "sockets": [
                        {
                            "name": "block type name",
                            "type": "number",
                            "value": 0
                        }
                    ],
                    "script": "client.getBlockName({{1}})",
                    "type": "string",
                    "help": "name of a blocktype by number"
                }
            ]
        }
        
    );
})(wb);