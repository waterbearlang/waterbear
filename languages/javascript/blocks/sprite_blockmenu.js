(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sprites",
            "name": "Sprites",
            "help": "Sprites are graphics that can be repositioned, rotated, and have a vector of motion. They can also check for collision with other Sprites.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "a5ec5438-a3e5-4949-a3d6-296f959670b1",
                    "script": "local.ctx.save();local.ctx.fillStyle = {{1}};local.ctx.fillRect(0,0,runtime.stage_width, runtime.stage_height);local.ctx.restore();",
                    "help": "clear the stage to a solid color",
                    "sockets": [
                        {
                            "name": "clear stage to color",
                            "type": "color",
                            "block": "13236aef-cccd-42b3-a041-e26528174323"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "44d98663-d4fd-4fc8-8b65-0cde22deced6",
                    "script": "local.ctx.save();local.ctx.canvas.width = runtime.stage_width;local.ctx.canvas.height =  runtime.stage_height;var w = local.ctx.canvas.width;var h = local.ctx.canvas.height;var size = {{1}};local.ctx.beginPath();if (size <= 0){size = 0.1;};for (var x=0;x<=w;x+=size){local.ctx.moveTo(x,0);local.ctx.lineTo(x,h);};for (var y=0;y<=h;y+=size){local.ctx.moveTo(0,y);local.ctx.lineTo(w,y);};local.ctx.strokeStyle ={{2}};local.ctx.stroke();",
                    "help": "set a grid background",
                    "sockets": [
                        {
                            "name": "set grid with interval",
                            "type": "number",
                            "block": ""
                        },
                        {
                            "name": "with color",
                            "type": "point",
                            "block": "13236aef-cccd-42b3-a041-e26528174323"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9d6b3a43-8319-482e-b0f8-2ce0fe7c2f3a",
                    "script": "local.ctx.drawImage(img, 0,0,img.width,img.height,0,0,runtime.stage_width,runtime.stage_height);",
                    "help": "clear the stage to a background image",
                    "sockets": [
                        {
                            "name": "clear stage to image",
                            "type": "image"
                        }
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "eb889480-c381-4cfa-a6ee-7c6928c08817",
                    "script": "local.sprite## = createRectSprite({{1}}, {{2}}, {{3}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple rectangle sprite",
                    "sockets": [
                        {
                            "name": "rectangle sprite##",
                            "type": "size",
                            "block": "d8e71067-afc2-46be-8bb5-3527b36474d7"
                        },
                        {
                            "name": "big at",
                            "type": "point",
                            "block": "29803c49-5bd5-4473-bff7-b3cf66ab9711"
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "block": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c876f5e8-87e9-4dc5-a6ee-8cf8e0188988",
                    "script": "local.sprite## = createImageSprite({{1}}, {{2}}, {{3}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple image sprite",
                    "sockets": [
                        {
                            "name": "image sprite##",
                            "type": "size",
                            "block": ""
                        },
                        {
                            "name": "big at",
                            "type": "point",
                            "block": ""
                        },
                        {
                            "name": "with image",
                            "type": "image",
                            "block": ""
                        }
                    ]
                },
            	{
                    "blocktype": "step",
                    "id": "43b28edf-c77f-422f-be5b-5217c9da93c9",
                    "script": "local.sprite## = createTextSprite({{1}}, {{2}}, {{3}}, {{4}}, {{5}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple text sprite",
                    "sockets": [
                        {
                            "name": "text sprite##",
                            "type": "size",
                            "block": ""
                        },
                        {
                            "name": "big at",
                            "type": "point",
                            "block": ""
                        },
                        {
                            "name": "with block color",
                            "type": "color",
                            "block": ""
                        },
            			{
                            "name": "with text",
                            "type": "string",
                            "block": ""
                        },
            			{
                            "name": "with text color",
                            "type": "color",
                            "block": ""
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6e0689f9-c731-4874-9ba8-5228c1ff335a",
                    "script": "local.sprite## = createSprite({{1}}, {{2}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "sprite##"
                                }
                            ],
                            "script": "local.sprite##",
                            "type": "sprite"
                        }
                    ],
                    "help": "create a simple rectangle sprite",
                    "sockets": [
                        {
                            "name": "shape sprite##",
                            "type": "shape",
                            "block": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "block": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "db5f8b4e-93f2-4f88-934b-5eb4bac40e0d",
                    "script": "{{1}}.draw(local.ctx);",
                    "help": "draw the sprite at its current location",
                    "sockets": [
                        {
                            "name": "draw sprite",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "468e4180-2221-11e3-8224-0800200c9a66",
                    "script": "{{1}}.setFacingDirectionBy({{2}});",
                    "help": "Rotate the sprites facing direction absolutely",
                    "sockets": [
                        {
                            "name": "Turn sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "by",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "69998440-22f4-11e3-8224-0800200c9a66",
                    "script": "{{1}}.setFacingDirection({{2}});",
                    "help": "Rotate the sprites facing direction",
                    "sockets": [
                        {
                            "name": "Turn sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "71c09d20-22f4-11e3-8224-0800200c9a66",
                    "script": "{{1}}.setMovementDirectionBy({{2}});",
                    "help": "Rotate the sprites movement direction",
                    "sockets": [
                        {
                            "name": "Steer sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "by",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7ecb947f-28ac-4418-bc44-cd797be697c9",
                    "script": "{{1}}.setMovementDirection({{2}});",
                    "help": "Rotate the sprites movement direction",
                    "sockets": [
                        {
                            "name": "Steer sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7381ea40-22f6-11e3-8224-0800200c9a66",
                    "script": "{{1}}.autosteer = ({{2}});",
                    "help": "Set the sprite to sync facing and movement directions",
                    "sockets": [
                        {
                            "name": "Autosteer sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "",
                            "type": "boolean",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "04c9dfd8-82eb-4f64-9d1c-54b78d744c21",
                    "script": "{{1}}.collides({{2}})",
                    "type": "boolean",
                    "help": "test for collision",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "collides with sprite",
                            "type": "sprite"
                        }
                    ]
                },
                  {
            		"blocktype": "expression",
                    "id": "f874f2af-c15e-44d2-9728-c14a774f22fb",
                    "script": "isSpriteClicked({{1}})",
                    "type": "boolean",
                    "help": "test for click",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "is clicked?"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "aaa2f728-cae3-4368-b241-e80f94c360d3",
                    "script": "{{1}}.bounceOff({{2}});",
                    "help": "Bounce the sprite off of the passed in sprite",
                    "sockets": [
                        {
                            "name": "bounce sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "off of sprite",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d1521a30-c7bd-4f42-b21d-6330a2a73631",
                    "script": "{{1}}.moveRelative({{2}},{{3}});",
                    "help": "move a sprite relatively",
                    "sockets": [
                        {
                            "name": "move",
                            "type": "sprite"
                        },
                        {
                            "name": "by x",
                            "type": "number"
                        },
                        {
                            "name": "y",
                            "type": "number"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "372de8c1-5f72-49cb-a2bd-faf66c36e318",
                    "help": "move a sprite by its own speed and direction",
                    "script": "{{1}}.move();",
                    "sockets": [
                        {
                            "name": "move",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "4d7d6b10-222b-11e3-8224-0800200c9a66",
                    "help": "set the speed of a sprite",
                    "script": "{{1}}.setSpeed({{2}});",
                    "sockets": [
                        {
                            "name": "set sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "speed",
                            "type": "number",
                            "value": 3
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "30d3103b-6657-4233-bd57-47bd5050704b",
                    "help": "set the movement vector of a sprite (speed and steer)",
                    "script": "{{1}}.movementDirection = {{2}};",
                    "sockets": [
                        {
                            "name": "set sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "movement vector",
                            "type": "vector"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a110b9d4-34bc-4d3f-a7b1-dbc7885eb977",
                    "help": "bounce in the x and/or y direction if the stage is exceeded",
                    "script": "{{1}}.stageBounce(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "bounce",
                            "type": "sprite"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "039a62e2-fbde-4fd0-9fa6-1e5383434698",
                    "help": "if the sprite moves to the edge of the screen, stop it at the edge",
                    "script": "{{1}}.edgeStop(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "stop sprite ",
                            "type": "sprite",
                            "suffix": "at edge of stage"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a4caaf13-514a-499a-a406-f88bfc9ddccd",
                    "help": "if the sprite moves to the edge of the screen, slide it along the edge",
                    "script": "{{1}}.edgeSlide(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "slide sprite ",
                            "type": "sprite",
                            "suffix": "at edge of stage"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "45f73aca-bf93-4249-9da4-1c089d6c8537",
                    "help": "if the sprite moves to the edge of the screen, wrap it around to the other side",
                    "script": "{{1}}.edgeWrap(runtime.stage_width, runtime.stage_height);",
                    "sockets": [
                        {
                            "name": "wrap sprite ",
                            "type": "sprite",
                            "suffix": "around edge of stage"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "88c75c2b-18f1-4195-92bc-a90d99743551",
                    "script": "{{1}}.moveAbsolute({{2}}.x, {{2}}.y);",
                    "help": "move a sprite absolutely",
                    "sockets": [
                        {
                            "name": "move",
                            "type": "sprite"
                        },
                        {
                            "name": "to",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "badee0b6-8f7c-4cbd-9173-f450c765045d",
                    "script": "{{1}}.color = {{2}};",
                    "help": "Recolor a sprite",
                    "sockets": [
                        {
                            "name": "Color sprite",
                            "type": "sprite"
                        },
                        {
                            "name": "to color",
                            "type": "color",
                            "block": "13236aef-cccd-42b3-a041-e26528174323"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "36DD3165-1168-4345-9198-E9B230FF84A3",
                    "script": "{{1}}.facingDirection",
                    "type": "vector",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "facing direction"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "495336f3-68ed-4bc7-a145-11756803876b",
                    "script": "{{1}}.movementDirection",
                    "type": "vector",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "movement vector"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "86aa39be-5419-4abb-9765-e63f824608f0",
                    "script": "{{1}}.polygon.average",
                    "type": "point",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "center"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "DF9E52B5-CE65-477A-BE10-95DF88C53FD0",
                    "script": "{{1}}.speed",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "speed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8D0880EA-1722-435A-989D-06E8A9B62FB0",
                    "script": "{{1}}.movementDirection.x",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "horizontal speed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "21A7A835-9647-4DC2-80AE-AE9B06346706",
                    "script": "{{1}}.movementDirection.y",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "vertical speed"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a0c6d157-7fc7-4819-9b97-7b81d4c49a83",
                    "script": "{{1}}.x",
                    "help": "get x (left) position of sprite",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "left"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "23b4ffd1-3812-4372-8873-8a1b3107bdac",
                    "script": "({{1}}.x + {{1}}.w)",
                    "help": "get x+w (right) position of sprite",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "right"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "898208b7-4d38-4c24-ba23-0b0443089435",
                    "script": "{{1}}.y",
                    "help": "get y (top) position of sprite",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "top"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8c73e3fd-7c53-4c92-be1d-286db5357cbb",
                    "script": "({{1}}.y + {{1}}.h)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "sprite",
                            "type": "sprite",
                            "suffix": "bottom"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);